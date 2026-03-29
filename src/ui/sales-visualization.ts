/**
 * Sales Visualization UI
 * 
 * Interactive chart visualization for sales report data.
 * Renders bar charts, line charts, and pie charts using Chart.js.
 * Receives data via structuredContent from the sales_visualize tool.
 */

import { baseStyles, CHART_COLORS, salesVisualizationStyles } from '../styles';
import { metricShortNames } from '../data/metric-names';
import { indianStates } from '../data/indian-states';
import { metricConfig } from '../data/sales-data';

export function SALES_VISUALIZATION_UI(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sales Data Visualization</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js"><\/script>
  <style>
    ${baseStyles}
    ${salesVisualizationStyles}
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title">📊 Sales Visualization</div>
      <div class="subtitle" id="reportSubtitle">Loading data...</div>
    </div>
    <div class="chart-controls">
      <div class="toggle-group">
        <button class="toggle-btn active" data-type="bar" onclick="switchPeriodChart('bar')">Stacked Bar</button>
        <button class="toggle-btn" data-type="line" onclick="switchPeriodChart('line')">Line</button>
      </div>
    </div>
  </div>

  <div class="summary-cards" id="summaryCards">
    <div class="card">
      <div class="card-label">Total</div>
      <div class="card-value" id="totalValue">—</div>
    </div>
    <div class="card">
      <div class="card-label">Average</div>
      <div class="card-value" id="avgValue">—</div>
    </div>
    <div class="card">
      <div class="card-label">Trend</div>
      <div class="card-value" id="trendValue">—</div>
      <div class="card-trend" id="trendDir"></div>
    </div>
    <div class="card">
      <div class="card-label">Top State</div>
      <div class="card-value" id="topStateValue">—</div>
      <div class="card-trend" id="topStateName" style="color:var(--muted)"></div>
    </div>
  </div>

  <div class="charts-container">
    <div class="chart-box full-width">
      <div class="chart-title" id="periodChartTitle">Period Breakdown</div>
      <div class="chart-canvas-wrap">
        <canvas id="periodChart"></canvas>
      </div>
    </div>
    <div class="chart-box">
      <div class="chart-title">State Distribution</div>
      <div class="chart-canvas-wrap">
        <canvas id="stateDonut"></canvas>
      </div>
    </div>
    <div class="chart-box">
      <div class="chart-title">State Comparison</div>
      <div class="chart-canvas-wrap">
        <canvas id="stateBar"></canvas>
      </div>
    </div>
  </div>

  <script>
    // MCP communication
    const pending = new Map();
    let nextId = 1;
    let reportData = null;
    let selections = null;
    let periodChartInstance = null;
    let stateDonutInstance = null;
    let stateBarInstance = null;
    let currentPeriodChartType = 'bar';

    const CHART_COLORS = ${JSON.stringify(CHART_COLORS)};

    function request(method, params) {
      const id = nextId++;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        window.parent.postMessage({ jsonrpc: '2.0', id, method, params }, '*');
      });
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

      if (msg.method === 'ui/notifications/tool-input') {
        // Also handle data from tool-input (arguments or structuredContent)
        const sc = msg.params?.structuredContent || msg.params?.arguments;
        if (sc && sc.report) {
          reportData = sc.report;
          selections = sc.selections;
          renderDashboard();
        }
      }
    });

    const metricNames = ${JSON.stringify(metricShortNames)};

    const METRIC_FORMAT = ${JSON.stringify(
    Object.fromEntries(
      Object.entries(metricConfig).map(([k, v]) => [k, { prefix: v.prefix, unit: v.unit }])
    )
  )};

    function formatValue(val) {
      const fmt = METRIC_FORMAT[selections?.metric] || {};
      const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]/g, '')) || 0;
      return (fmt.prefix || '') + num.toLocaleString() + (fmt.unit || '');
    }

    function renderDashboard() {
      if (!reportData || !selections) return;

      const metricName = metricNames[selections.metric] || selections.metric;
      const periodText = selections.period === 'monthly' ? 'Monthly' : 'Quarterly';

      // Header
      document.getElementById('reportSubtitle').textContent =
        metricName + ' · ' + periodText + ' · ' + selections.year + ' · ' + selections.states.join(', ');

      // Summary cards
      document.getElementById('totalValue').textContent = reportData.summary.total;
      document.getElementById('avgValue').textContent = reportData.summary.average;
      document.getElementById('trendValue').textContent = reportData.summary.trend;

      const trendDir = document.getElementById('trendDir');
      if (reportData.summary.trend.includes('↑')) {
        trendDir.textContent = 'Increasing';
        trendDir.className = 'card-trend up';
      } else {
        trendDir.textContent = 'Decreasing';
        trendDir.className = 'card-trend down';
      }

      document.getElementById('topStateValue').textContent = reportData.topState.value;
      document.getElementById('topStateName').textContent = reportData.topState.name;

      // Period chart title
      document.getElementById('periodChartTitle').textContent = periodText + ' ' + metricName + ' Breakdown';

      // Render charts
      renderPeriodChart(currentPeriodChartType);
      renderStateDonut();
      renderStateBar();
    }

    function getChartColors() {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return {
        gridColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        textColor: isDark ? '#cccccc' : '#333333',
        bgColors: CHART_COLORS.map(c => c + '99'),
        borderColors: CHART_COLORS,
      };
    }

    const STATE_CODE_TO_NAME = ${JSON.stringify(
    Object.fromEntries(indianStates.map(s => [s.code, s.name]))
  )};

    function renderPeriodChart(type) {
      if (periodChartInstance) periodChartInstance.destroy();

      const ctx = document.getElementById('periodChart').getContext('2d');
      const labels = reportData.periods.map(p => p.period.split(' ')[0]);
      const colors = getChartColors();
      const metricLabel = metricNames[selections.metric] || selections.metric;

      // Derive state keys from the first period's stateValues (codes like "MH", "TN")
      const stKeys = Object.keys((reportData.periods[0] || {}).stateValues || {});

      // Build per-state datasets
      const datasets = stKeys.map((key, idx) => ({
        label: STATE_CODE_TO_NAME[key] || key,
        data: reportData.periods.map(p => parseNumericValue((p.stateValues || {})[key] || '0')),
        backgroundColor: colors.bgColors[idx % colors.bgColors.length],
        borderColor: colors.borderColors[idx % colors.borderColors.length],
        borderWidth: 1,
        stack: 'states',
        type: type,
        fill: false,
        tension: 0.3,
        pointRadius: type === 'line' ? 3 : 0,
        order: 2,
      }));

      // Total line overlay
      datasets.push({
        label: 'Total',
        data: reportData.periods.map(p => parseNumericValue(p.total || p.value || '0')),
        backgroundColor: 'transparent',
        borderColor: '#8B5CF6',
        borderWidth: 2,
        stack: '',
        type: 'line',
        fill: false,
        tension: 0.3,
        pointRadius: 4,
        order: 1,
      });

      periodChartInstance = new Chart(ctx, {
        type: type,
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: { color: colors.textColor, font: { size: 9 }, boxWidth: 10, padding: 6 },
            },
            tooltip: {
              backgroundColor: 'rgba(30,30,30,0.95)',
              titleColor: '#fff',
              bodyColor: '#ccc',
              padding: 8,
              cornerRadius: 4,
              callbacks: {
                label: (ctx) => ctx.dataset.label + ': ' + formatValue(ctx.parsed.y),
              },
            }
          },
          scales: {
            x: {
              stacked: type === 'bar',
              grid: { color: colors.gridColor },
              ticks: { color: colors.textColor, font: { size: 9 } }
            },
            y: {
              stacked: type === 'bar',
              grid: { color: colors.gridColor },
              ticks: { color: colors.textColor, font: { size: 9 }, callback: (val) => formatValue(val) },
              beginAtZero: true,
            }
          }
        }
      });
    }

    function renderStateDonut() {
      if (stateDonutInstance) stateDonutInstance.destroy();

      const ctx = document.getElementById('stateDonut').getContext('2d');
      const labels = reportData.states.map(s => s.state);
      const values = reportData.states.map(s => parseFloat(s.percentage));
      const colors = getChartColors();

      stateDonutInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: colors.bgColors.slice(0, values.length),
            borderColor: colors.borderColors.slice(0, values.length),
            borderWidth: 1,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '55%',
          plugins: {
            legend: {
              position: 'right',
              labels: {
                color: getChartColors().textColor,
                font: { size: 9 },
                boxWidth: 10,
                padding: 6,
              }
            },
            tooltip: {
              backgroundColor: 'rgba(30,30,30,0.95)',
              callbacks: {
                label: (ctx) => ctx.label + ': ' + ctx.parsed + '%'
              }
            }
          }
        }
      });
    }

    function renderStateBar() {
      if (stateBarInstance) stateBarInstance.destroy();

      const ctx = document.getElementById('stateBar').getContext('2d');
      const labels = reportData.states.map(s => s.state);
      const values = reportData.states.map(s => parseNumericValue(s.value));
      const colors = getChartColors();

      stateBarInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: metricNames[selections.metric] || selections.metric,
            data: values,
            backgroundColor: colors.bgColors.slice(0, values.length),
            borderColor: colors.borderColors.slice(0, values.length),
            borderWidth: 1,
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(30,30,30,0.95)',
              callbacks: {
                label: (ctx) => formatValue(ctx.parsed.x),
              },
            }
          },
          scales: {
            x: {
              grid: { color: colors.gridColor },
              ticks: { color: colors.textColor, font: { size: 9 }, callback: (val) => formatValue(val) },
              beginAtZero: true,
            },
            y: {
              grid: { display: false },
              ticks: { color: colors.textColor, font: { size: 9 } }
            }
          }
        }
      });
    }

    function parseNumericValue(val) {
      if (typeof val === 'number') return val;
      // Remove currency symbols, commas, % signs, text like " orders", " customers"
      return parseFloat(String(val).replace(/[^0-9.-]/g, '')) || 0;
    }

    function switchPeriodChart(type) {
      currentPeriodChartType = type;
      document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.type === type);
      });
      if (reportData) renderPeriodChart(type);
    }

    async function initialize() {
      try {
        await request('ui/initialize', {
          protocolVersion: '2025-11-21',
          capabilities: {},
          clientInfo: { name: 'sales-visualization', version: '1.0.0' }
        });
        window.parent.postMessage({ jsonrpc: '2.0', method: 'ui/notifications/initialized' }, '*');
      } catch (e) {
        // standalone mode
      }
    }

    initialize();
  <\/script>
</body>
</html>`;
}
