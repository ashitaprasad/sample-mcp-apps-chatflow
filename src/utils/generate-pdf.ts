/**
 * Server-side PDF generation utility.
 *
 * Uses jsPDF + jspdf-autotable to build a complete sales report PDF
 * with summary tables, period breakdown charts, and state comparison charts.
 * Charts are drawn using jsPDF drawing primitives (no browser canvas needed).
 *
 * Returns the PDF as a base64 string for passing to the MCP App UI.
 */

import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { jsPDF } from 'jspdf';
import { applyPlugin, autoTable } from 'jspdf-autotable';

// Register the autoTable plugin on jsPDF
applyPlugin(jsPDF);

// Load Noto Sans font (supports ₹ and other Unicode currency symbols)
const __dirname = dirname(fileURLToPath(import.meta.url));
const notoRegularPath = join(__dirname, '..', '..', 'src', 'fonts', 'NotoSans-Regular.ttf');
const notoBoldPath = join(__dirname, '..', '..', 'src', 'fonts', 'NotoSans-Bold.ttf');
const notoRegularBase64 = readFileSync(notoRegularPath).toString('base64');
const notoBoldBase64 = readFileSync(notoBoldPath).toString('base64');

function registerNotoSans(doc: jsPDF): void {
    doc.addFileToVFS('NotoSans-Regular.ttf', notoRegularBase64);
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
    doc.addFileToVFS('NotoSans-Bold.ttf', notoBoldBase64);
    doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
}

// Chart color palette (RGB tuples)
const PDF_COLORS: [number, number, number][] = [
    [0, 120, 212], [78, 201, 176], [221, 183, 111], [244, 71, 71], [197, 134, 192],
    [86, 156, 214], [215, 186, 125], [96, 139, 78], [206, 145, 120], [156, 220, 254],
];

interface PdfSelections {
    states: string[];
    metric: string;
    period: string;
    year: string;
}

interface PdfReport {
    summary: { total: string; average: string; trend: string; totalRaw: number; averageRaw: number };
    topState: { name: string; code: string; value: string; percentage: string };
    periods: Array<{ period: string; total: string; stateValues: Record<string, number> }>;
    states: Array<{ state: string; value: string; percentage: string }>;
    stateNames: string[];
}

/** Parse a possibly-formatted value into a number. */
function num(val: string | number | undefined): number {
    if (val === undefined || val === null) return 0;
    if (typeof val === 'number') return val;
    return parseFloat(String(val).replace(/[^0-9.-]/g, '')) || 0;
}

/** Resolve a state value from stateValues trying both code and name as keys. */
function getStateValue(
    stateValues: Record<string, number>,
    code: string,
    name: string,
): number {
    if (code in stateValues) return stateValues[code];
    if (name in stateValues) return stateValues[name];
    return 0;
}

// ---------------------------------------------------------------------------
// Chart drawing helpers (pure jsPDF primitives)
// ---------------------------------------------------------------------------

function drawStackedBarChart(
    doc: jsPDF,
    x: number, y: number, w: number, h: number,
    labels: string[],
    datasets: { label: string; data: number[]; color: [number, number, number] }[],
) {
    const pad = { top: 14, bottom: 20, left: 30, right: 8 };
    const cx = x + pad.left;
    const cy = y + pad.top;
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;

    // Compute max stacked value
    let maxVal = 0;
    for (let i = 0; i < labels.length; i++) {
        let sum = 0;
        for (const ds of datasets) sum += ds.data[i] || 0;
        maxVal = Math.max(maxVal, sum);
    }
    if (maxVal === 0) maxVal = 1;

    // Axes
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(cx, cy + ch, cx + cw, cy + ch);
    doc.line(cx, cy, cx, cy + ch);

    // Y-axis labels + grid
    const ySteps = 5;
    doc.setFontSize(5);
    doc.setTextColor(120, 120, 120);
    for (let i = 0; i <= ySteps; i++) {
        const val = Math.round((maxVal / ySteps) * i);
        const yp = cy + ch - (ch / ySteps) * i;
        doc.text(val.toLocaleString(), cx - 2, yp + 1, { align: 'right' });
        if (i > 0) {
            doc.setDrawColor(235, 235, 235);
            doc.line(cx, yp, cx + cw, yp);
        }
    }

    // Bars
    const groupW = cw / labels.length;
    const barPad = groupW * 0.15;
    const barW = groupW - barPad * 2;

    labels.forEach((label, i) => {
        let stackY = cy + ch;
        for (const ds of datasets) {
            const val = ds.data[i] || 0;
            const barH = (val / maxVal) * ch;
            if (barH > 0.5) {
                stackY -= barH;
                doc.setFillColor(ds.color[0], ds.color[1], ds.color[2]);
                doc.rect(cx + i * groupW + barPad, stackY, barW, barH, 'F');
            }
        }
        // X label
        doc.setFontSize(5);
        doc.setTextColor(80, 80, 80);
        const lbl = label.length > 5 ? label.substring(0, 5) : label;
        doc.text(lbl, cx + i * groupW + groupW / 2, cy + ch + 4, { align: 'center' });
    });

    // Legend
    let lx = cx;
    const ly = y + 2;
    doc.setFontSize(5);
    for (const ds of datasets) {
        doc.setFillColor(ds.color[0], ds.color[1], ds.color[2]);
        doc.rect(lx, ly, 3, 2.5, 'F');
        doc.setTextColor(80, 80, 80);
        doc.text(ds.label, lx + 4, ly + 2);
        lx += doc.getTextWidth(ds.label) + 7;
    }
}

function drawHorizontalBarChart(
    doc: jsPDF,
    x: number, y: number, w: number, h: number,
    labels: string[],
    values: number[],
) {
    const pad = { top: 4, bottom: 4, left: 38, right: 8 };
    const cx = x + pad.left;
    const cy = y + pad.top;
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;

    const maxVal = Math.max(...values, 1);
    const barH = Math.min(ch / labels.length - 1.5, 8);
    const gap = (ch - barH * labels.length) / (labels.length + 1);

    labels.forEach((label, i) => {
        const yp = cy + gap + i * (barH + gap);
        const barW = (values[i] / maxVal) * cw;
        const color = PDF_COLORS[i % PDF_COLORS.length];

        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(cx, yp, Math.max(barW, 0.5), barH, 'F');

        doc.setFontSize(6);
        doc.setTextColor(80, 80, 80);
        doc.text(label, cx - 2, yp + barH / 2 + 1, { align: 'right' });

        doc.setFontSize(5);
        doc.setTextColor(60, 60, 60);
        doc.text(values[i].toLocaleString(), cx + barW + 2, yp + barH / 2 + 1);
    });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

interface PdfResult {
    base64: string;
    fileName: string;
    fileSize: number;
}

export function generateSalesPdf(
    selections: PdfSelections,
    report: PdfReport,
    metricName: string,
): PdfResult {
    const periodText = selections.period === 'monthly' ? 'Monthly' : 'Quarterly';
    const stNames = report.stateNames || [];

    const doc = new jsPDF('p', 'mm', 'a4');
    registerNotoSans(doc);
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    let y = 15;

    // ---- Title ----
    doc.setFontSize(18);
    doc.setFont('NotoSans', 'bold');
    doc.setTextColor(0, 120, 212);
    doc.text('Sales Report', pw / 2, y, { align: 'center' });
    y += 8;

    // ---- Subtitle ----
    doc.setFontSize(10);
    doc.setFont('NotoSans', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(
        `${metricName} | ${periodText} | ${selections.year} | States: ${selections.states.join(', ')}`,
        pw / 2, y, { align: 'center' },
    );
    y += 4;

    doc.setDrawColor(0, 120, 212);
    doc.setLineWidth(0.5);
    doc.line(15, y, pw - 15, y);
    y += 8;

    // ---- Summary table ----
    doc.setFontSize(12);
    doc.setFont('NotoSans', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('Summary', 15, y);
    y += 6;

    autoTable(doc, {
        startY: y,
        head: [['Metric', 'Value']],
        body: [
            ['Total', report.summary.total],
            ['Average', report.summary.average],
            ['Trend', report.summary.trend],
            ['Top State', `${report.topState.name} (${report.topState.value})`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [0, 120, 212], textColor: 255, fontSize: 9, font: 'NotoSans' },
        bodyStyles: { fontSize: 9, font: 'NotoSans' },
        margin: { left: 15, right: 15 },
        columnStyles: { 0: { cellWidth: 40 } },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // ---- Period breakdown chart ----
    doc.setFontSize(12);
    doc.setFont('NotoSans', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(`${periodText} ${metricName} Breakdown`, 15, y);
    y += 2;

    const periodLabels = report.periods.map(p => p.period.split(' ')[0]);
    const periodDatasets = stNames.map((name, idx) => ({
        label: name,
        data: report.periods.map(p =>
            getStateValue(p.stateValues || {}, selections.states[idx] || '', name),
        ),
        color: PDF_COLORS[idx % PDF_COLORS.length],
    }));

    drawStackedBarChart(doc, 15, y, pw - 30, 55, periodLabels, periodDatasets);
    y += 60;

    // ---- Period table ----
    const periodHead = ['Period', ...stNames, 'Total'];
    const periodBody = report.periods.map(p => {
        const row: string[] = [p.period];
        stNames.forEach((name, idx) => {
            const val = getStateValue(p.stateValues || {}, selections.states[idx] || '', name);
            row.push(val ? val.toLocaleString() : '—');
        });
        row.push(String(p.total || '—'));
        return row;
    });

    autoTable(doc, {
        startY: y,
        head: [periodHead],
        body: periodBody,
        theme: 'striped',
        headStyles: { fillColor: [0, 120, 212], textColor: 255, fontSize: 8, font: 'NotoSans' },
        bodyStyles: { fontSize: 8, font: 'NotoSans' },
        margin: { left: 15, right: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    if (y > ph - 50) { doc.addPage(); y = 15; }

    // ---- State comparison chart ----
    doc.setFontSize(12);
    doc.setFont('NotoSans', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('State Comparison', 15, y);
    y += 2;

    const stateLabels = report.states.map(s => s.state);
    const stateValues = report.states.map(s => num(s.value));
    const hBarH = Math.max(35, stateLabels.length * 10);
    drawHorizontalBarChart(doc, 15, y, pw - 30, hBarH, stateLabels, stateValues);
    y += hBarH + 5;

    // ---- State table ----
    autoTable(doc, {
        startY: y,
        head: [['State', 'Value', 'Share (%)']],
        body: report.states.map(s => [s.state, s.value, s.percentage + '%']),
        theme: 'striped',
        headStyles: { fillColor: [0, 120, 212], textColor: 255, fontSize: 9, font: 'NotoSans' },
        bodyStyles: { fontSize: 9, font: 'NotoSans' },
        margin: { left: 15, right: 15 },
    });

    // ---- Page footers ----
    const totalPages = doc.getNumberOfPages();
    const dateStr = new Date().toLocaleDateString();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont('NotoSans', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
            `Generated on ${dateStr} | Page ${i} of ${totalPages}`,
            pw / 2, ph - 8, { align: 'center' },
        );
    }

    // ---- Output ----
    const arrayBuffer = doc.output('arraybuffer');
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const safeName = metricName.toLowerCase().replace(/\s+/g, '-');
    const fileName = `sales-report-${safeName}-${selections.year}.pdf`;

    return { base64, fileName, fileSize: arrayBuffer.byteLength };
}
