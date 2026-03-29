/**
 * Sales Metrics UI
 * 
 * Interactive selector for Indian states, sales metrics, and time periods.
 * Allows multi-select states, metric selection, and quarterly/monthly toggle.
 */

import { baseStyles, indiaSalesStyles } from '../styles';
import { indianStates, topStates } from '../data/indian-states';
import { metricDisplayNames } from '../data/metric-names';

export function SALES_UI(): string {
  const metricOptions = Object.entries(metricDisplayNames)
    .map(([value, label]) => `<option value="${value}">${label}</option>`)
    .join('\n        ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Regional Sales Metrics Selector</title>
  <style>
    ${baseStyles}
    ${indiaSalesStyles}
  </style>
</head>
<body>
  <div class="header">
    <span class="title">Select Metrics & Regions</span>
  </div>

  <div class="controls">
    <div class="metric-selector">
      <span class="section-label">Sales Metric</span>
      <select id="metricSelect">
        ${metricOptions}
      </select>
    </div>

    <div class="period-toggle">
      <span class="section-label">Time Period</span>
      <div class="toggle-group">
        <button class="toggle-btn active" data-period="monthly">Monthly</button>
        <button class="toggle-btn" data-period="quarterly">Quarterly</button>
      </div>
    </div>

    <div class="period-toggle">
      <span class="section-label">Year</span>
      <select id="yearSelect" style="padding: 4px 6px; background: var(--surface); border: 1px solid var(--border); border-radius: 3px; color: var(--text); font: inherit;">
        <option value="2026">2026</option>
        <option value="2025" selected>2025</option>
        <option value="2024">2024</option>
        <option value="2023">2023</option>
        <option value="2022">2022</option>
        <option value="2021">2021</option>
      </select>
    </div>
  </div>

  <div class="states-section">
    <div class="states-header">
      <span class="section-label">Select Region</span>
      <div class="select-actions">
        <button onclick="selectAll()">Select All</button>
        <button onclick="clearSelection()">Clear</button>
        <button onclick="selectTop()">Top 5</button>
      </div>
    </div>
    <div class="search-box">
      <input type="text" id="stateSearch" placeholder="Search states..." />
    </div>
    <div class="states-grid" id="statesGrid"></div>
  </div>

  <div class="footer">
    <span class="selected-count">
      <strong id="selectedCount">0</strong> state(s) selected
    </span>
    <button class="btn-secondary" onclick="resetAll()">Reset</button>
    <button class="btn-primary" id="generateBtn" onclick="fetchData()" disabled>
      Submit
    </button>
    <span class="status-bar" id="statusBar">Select states to continue</span>
  </div>

  <script>
    // Indian states data (injected from data module)
    const indianStates = ${JSON.stringify(indianStates)};

    // Top 5 states by GDP/commerce
    const topStates = ${JSON.stringify(topStates)};

    // State
    let selectedStates = new Set();
    let currentPeriod = 'monthly';
    let currentMetric = 'revenue';
    let currentYear = '2025';
    let searchTerm = '';

    // MCP communication
    let nextRequestId = 1;
    const pendingRequests = new Map();

    function sendRequest(method, params) {
      const id = nextRequestId++;
      return new Promise((resolve, reject) => {
        pendingRequests.set(id, { resolve, reject });
        window.parent.postMessage({ jsonrpc: '2.0', id, method, params: params || {} }, '*');
      });
    }

    function sendNotification(method, params) {
      window.parent.postMessage({ jsonrpc: '2.0', method, params: params || {} }, '*');
    }

    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (!msg || msg.jsonrpc !== '2.0') return;

      if (msg.id !== undefined && pendingRequests.has(msg.id)) {
        const { resolve, reject } = pendingRequests.get(msg.id);
        pendingRequests.delete(msg.id);
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
        return;
      }
    });

    function updateStatus(msg, type = '') {
      const el = document.getElementById('statusBar');
      el.textContent = msg;
      el.className = 'status-bar' + (type ? ' ' + type : '');
    }

    // Render states grid
    function renderStates() {
      const grid = document.getElementById('statesGrid');
      const filtered = indianStates.filter(s => 
        searchTerm === '' || 
        s.name.toLowerCase().includes(searchTerm) || 
        s.code.toLowerCase().includes(searchTerm)
      );

      if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-text">No states found</div></div>';
        return;
      }

      grid.innerHTML = filtered.map(state => {
        const selected = selectedStates.has(state.code) ? 'selected' : '';
        return \`
          <div class="state-card \${selected}" onclick="toggleState('\${state.code}')">
            <div class="state-check">✓</div>
            <div class="state-info">
              <div class="state-name">\${state.name}</div>
              <div class="state-code">\${state.code} • \${state.region}</div>
            </div>
          </div>
        \`;
      }).join('');

      updateCount();
    }

    function toggleState(code) {
      if (selectedStates.has(code)) {
        selectedStates.delete(code);
      } else {
        selectedStates.add(code);
      }
      renderStates();
    }

    function selectAll() {
      selectedStates = new Set(indianStates.map(s => s.code));
      renderStates();
    }

    function clearSelection() {
      selectedStates.clear();
      renderStates();
    }

    function selectTop() {
      selectedStates = new Set(topStates);
      renderStates();
    }

    function resetAll() {
      selectedStates.clear();
      currentMetric = 'revenue';
      currentPeriod = 'monthly';
      currentYear = '2025';
      searchTerm = '';
      document.getElementById('metricSelect').value = 'revenue';
      document.getElementById('yearSelect').value = '2025';
      document.getElementById('stateSearch').value = '';
      updatePeriodButtons();
      renderStates();
    }

    function updateCount() {
      document.getElementById('selectedCount').textContent = selectedStates.size;
      const btn = document.getElementById('generateBtn');
      btn.disabled = selectedStates.size === 0;
      
      // Update status based on selection
      if (selectedStates.size === 0) {
        updateStatus('Select states to continue');
      } else {
        updateStatus('Ready - Click "Submit" to fetch data & add it to chat context');
      }
    }

    function updatePeriodButtons() {
      document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.period === currentPeriod);
      });
    }

    // Generate report and send to chat
    async function fetchData() {
      if (selectedStates.size === 0) {
        updateStatus('⚠️ Please select at least one state', 'error');
        return;
      }

      updateStatus('📊 Fetching data...');
      document.getElementById('generateBtn').disabled = true;

      const selectedStateNames = Array.from(selectedStates)
        .map(code => indianStates.find(s => s.code === code))
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name));

      // Call the app-only get-sales-data tool to fetch report data
      let report = null;
      try {
        const toolResult = await sendRequest('tools/call', {
          name: 'get-sales-data',
          arguments: {
            states: Array.from(selectedStates),
            metric: currentMetric,
            period: currentPeriod,
            year: currentYear,
          }
        });
        report = toolResult.structuredContent || null;
        updateStatus('✅ Data fetched successfully...');
      } catch (e) {
        updateStatus('❌ Error fetching data: ' + e.message, 'error');
        document.getElementById('generateBtn').disabled = false;
        return;
      }

      updateStatus('{} Updating context...');
      try {
        await sendRequest('ui/update-model-context', {
          structuredContent: { 
            selections: {
              metric: currentMetric,
              period: currentPeriod,
              year: currentYear, 
              states: Array.from(selectedStates),
              selectedStateNames: selectedStateNames
            },
            report: report
          }
        });
        updateStatus('✅ Context updated successfully.');
      } catch (e) {
        updateStatus('❌ Error: ' + e.message, 'error');
        setTimeout(() => {
          updateCount(); // Restore ready state
        }, 3000);
      } finally {
        document.getElementById('generateBtn').disabled = false;
      }
    }

    // Event listeners
    document.getElementById('stateSearch').addEventListener('input', (e) => {
      searchTerm = e.target.value.toLowerCase();
      renderStates();
    });

    document.getElementById('metricSelect').addEventListener('change', (e) => {
      currentMetric = e.target.value;
    });

    document.getElementById('yearSelect').addEventListener('change', (e) => {
      currentYear = e.target.value;
    });

    document.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPeriod = btn.dataset.period;
        updatePeriodButtons();
      });
    });

    // Initialize
    async function initialize() {
      try {
        updateStatus('Connecting...');
        await sendRequest('ui/initialize', {
          protocolVersion: '2025-11-21',
          capabilities: {},
          clientInfo: { name: 'india-sales-metrics', version: '1.0.0' }
        });
        sendNotification('ui/notifications/initialized', {});
        updateStatus('Ready');
      } catch (e) {
        updateStatus('Standalone mode');
      }
      renderStates();
    }

    initialize();

    // After ui/initialize handshake completes
    sendNotification("ui/notifications/size-changed", {
      width: document.body.scrollWidth,
      height: document.body.scrollHeight + 150
    });
  <\/script>
</body>
</html>`;
}
