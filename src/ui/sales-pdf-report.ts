/**
 * Sales PDF Report UI
 *
 * Receives a pre-generated PDF blob (base64) from the server via
 * structuredContent. Renders an inline preview using PDF.js (from CDN)
 * and provides a download button. All PDF generation happens server-side.
 */

import { baseStyles, salesPdfReportStyles } from '../styles.js';

export function SALES_PDF_REPORT_UI(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sales PDF Report</title>
  <script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs" type="module"><\/script>
  <style>
    ${baseStyles}
    ${salesPdfReportStyles}
  </style>
</head>
<body>

  <!-- Loading overlay -->
  <div class="loading-overlay" id="loadingOverlay">
    <div class="loading-spinner"></div>
    <div class="status" id="statusBar">Waiting for report data...</div>
  </div>

  <!-- Toolbar -->
  <div class="toolbar" id="toolbar" style="display:none;">
    <div class="toolbar-left">
      <span class="pdf-title" id="pdfTitle">📄 Sales Report</span>
      <span class="pdf-subtitle" id="pdfSubtitle"></span>
    </div>
    <div class="toolbar-center">
      <button class="nav-btn" id="prevBtn" disabled title="Previous page">◀</button>
      <span class="page-info" id="pageInfo">1 / 1</span>
      <button class="nav-btn" id="nextBtn" disabled title="Next page">▶</button>
    </div>
    <div class="toolbar-right">
      <button class="zoom-btn" id="zoomOutBtn" title="Zoom out">−</button>
      <span class="zoom-level" id="zoomLevel">100%</span>
      <button class="zoom-btn" id="zoomInBtn" title="Zoom in">+</button>
    </div>
  </div>

  <!-- PDF Canvas -->
  <div class="canvas-container" id="canvasContainer" style="display:none;">
    <div class="page-wrapper">
      <canvas id="pdfCanvas"></canvas>
    </div>
  </div>

  <!-- Bottom bar with download -->
  <div class="bottom-bar" id="bottomBar" style="display:none;">
    <div class="file-info">
      <span class="file-name" id="fileName"></span>
      <span class="file-size" id="fileSize"></span>
    </div>
    <button class="btn-primary download-btn" id="downloadBtn">⬇ Download PDF</button>
  </div>

  <script type="module">
    /* -------- PDF.js setup -------- */
    const pdfjsLib = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';

    /* -------- state -------- */
    let pdfDoc = null;
    let currentPage = 1;
    let totalPages = 0;
    let scale = 1.0;
    let pdfBase64 = null;
    let pdfFileName = 'report.pdf';
    let rendering = false;
    let pendingPage = null;

    /* -------- MCP communication -------- */
    const pending = new Map();
    let nextId = 1;

    function request(method, params) {
      const id = nextId++;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        window.parent.postMessage({ jsonrpc:'2.0', id, method, params }, '*');
      });
    }

    function notify(method, params) {
      window.parent.postMessage({ jsonrpc:'2.0', method, params }, '*');
    }

    window.addEventListener('message', (e) => {
      const msg = e.data;
      if (!msg?.jsonrpc) return;

      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? reject(msg.error) : resolve(msg.result);
        return;
      }

      if (msg.method === 'ui/notifications/tool-result' ||
          msg.method === 'ui/notifications/tool-input') {
        const sc = msg.params?.structuredContent || msg.params?.arguments || {};
        if (sc.pdfBase64) {
          pdfBase64 = sc.pdfBase64;
          pdfFileName = sc.fileName || 'report.pdf';
          loadPdf(sc);
        }
      }
    });

    /* -------- helpers -------- */
    function esc(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
    function formatBytes(b) {
      if (b < 1024) return b + ' B';
      if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
      return (b / 1048576).toFixed(1) + ' MB';
    }
    function setStatus(msg, cls) {
      const el = document.getElementById('statusBar');
      el.textContent = msg;
      el.className = 'status' + (cls ? ' ' + cls : '');
    }

    /* -------- load & render PDF -------- */
    async function loadPdf(sc) {
      setStatus('Loading PDF...');
      try {
        const binary = atob(sc.pdfBase64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

        pdfDoc = await pdfjsLib.getDocument({ data: bytes }).promise;
        totalPages = pdfDoc.numPages;
        currentPage = 1;

        // Show viewer
        document.getElementById('toolbar').style.display = 'flex';
        document.getElementById('canvasContainer').style.display = 'flex';
        document.getElementById('bottomBar').style.display = 'flex';
        document.getElementById('loadingOverlay').classList.add('hidden');

        // Fill info
        document.getElementById('pdfTitle').textContent = '📄 ' + esc(sc.title || 'Sales Report');
        document.getElementById('pdfSubtitle').textContent = '';
        document.getElementById('fileName').textContent = esc(sc.fileName || 'report.pdf');
        document.getElementById('fileSize').textContent = formatBytes(sc.fileSize || 0);

        renderPage();
      } catch (err) {
        setStatus('❌ Error loading PDF: ' + err.message, 'error');
      }
    }

    async function renderPage() {
      if (!pdfDoc || rendering) {
        pendingPage = currentPage;
        return;
      }
      rendering = true;
      pendingPage = null;

      try {
        const page = await pdfDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale });
        const canvas = document.getElementById('pdfCanvas');
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        canvas.style.width = viewport.width + 'px';
        canvas.style.height = viewport.height + 'px';
        ctx.scale(dpr, dpr);

        await page.render({ canvasContext: ctx, viewport }).promise;

        // Update controls
        document.getElementById('pageInfo').textContent = currentPage + ' / ' + totalPages;
        document.getElementById('prevBtn').disabled = currentPage <= 1;
        document.getElementById('nextBtn').disabled = currentPage >= totalPages;
        document.getElementById('zoomLevel').textContent = Math.round(scale * 100) + '%';
      } catch (err) {
        setStatus('❌ Render error: ' + err.message, 'error');
      } finally {
        rendering = false;
        if (pendingPage !== null && pendingPage !== currentPage) {
          currentPage = pendingPage;
          renderPage();
        }
      }
    }

    /* -------- navigation -------- */
    document.getElementById('prevBtn').addEventListener('click', () => {
      if (currentPage > 1) { currentPage--; renderPage(); }
    });
    document.getElementById('nextBtn').addEventListener('click', () => {
      if (currentPage < totalPages) { currentPage++; renderPage(); }
    });
    document.getElementById('zoomInBtn').addEventListener('click', () => {
      scale = Math.min(scale + 0.25, 3.0); renderPage();
    });
    document.getElementById('zoomOutBtn').addEventListener('click', () => {
      scale = Math.max(scale - 0.25, 0.5); renderPage();
    });

    /* -------- keyboard -------- */
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowLeft': case 'PageUp':
          if (currentPage > 1) { currentPage--; renderPage(); }
          e.preventDefault(); break;
        case 'ArrowRight': case 'PageDown':
          if (currentPage < totalPages) { currentPage++; renderPage(); }
          e.preventDefault(); break;
        case '+': case '=':
          scale = Math.min(scale + 0.25, 3.0); renderPage();
          e.preventDefault(); break;
        case '-':
          scale = Math.max(scale - 0.25, 0.5); renderPage();
          e.preventDefault(); break;
      }
    });

    /* -------- download -------- */
    document.getElementById('downloadBtn').addEventListener('click', async () => {
      if (!pdfBase64) return;
      try {
        // Use ui/download-file to ask the host to save the PDF (sandboxed iframes can't download directly)
        const result = await request('ui/download-file', {
          contents: [{
            type: 'resource',
            resource: {
              uri: 'file:///' + pdfFileName,
              mimeType: 'application/pdf',
              blob: pdfBase64
            }
          }]
        });
        if (result?.isError) {
          setStatus('Download was cancelled', 'error');
        } else {
          setStatus('✅ PDF downloaded!', 'success');
        }
      } catch (err) {
        setStatus('❌ Download failed: ' + err.message, 'error');
      }
    });

    /* -------- init MCP handshake -------- */
    async function initialize() {
      try {
        await request('ui/initialize', {
          protocolVersion: '2025-11-21',
          capabilities: {},
          clientInfo: { name:'sales-pdf-report', version:'1.0.0' }
        });
        notify('ui/notifications/initialized', {});
      } catch(e) { /* standalone */ }
    }
    initialize();
  <\/script>
</body>
</html>`;
}
