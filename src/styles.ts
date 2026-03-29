/**
 * Shared Styles for UI components
 *
 * All CSS used by the sales UI templates, extracted from the
 * individual ui/ files into a single source of truth.
 */

// ---------------------------------------------------------------------------
// Shared color palette
// ---------------------------------------------------------------------------

export const CHART_COLORS = [
  '#0078d4', '#4ec9b0', '#ddb76f', '#f44747', '#c586c0',
  '#569cd6', '#d7ba7d', '#608b4e', '#ce9178', '#9cdcfe',
  '#b5cea8', '#d4d4d4', '#6a9955', '#dcdcaa',
];

// ---------------------------------------------------------------------------
// Base styles: variables, reset, buttons, toggles, spinner, status
// ---------------------------------------------------------------------------

export const baseStyles = `
    /* --- CSS Variables --- */
    :root {
      --bg: #1e1e1e;
      --surface: #252526;
      --surface2: #2d2d30;
      --border: #3c3c3c;
      --text: #cccccc;
      --muted: #858585;
      --accent: #0078d4;
      --accent-hover: #1c8ae6;
      --success: #4ec9b0;
      --warning: #ddb76f;
      --error: #f44747;
      --font: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      --mono: 'SF Mono', Consolas, monospace;
    }
    @media (prefers-color-scheme: light) {
      :root {
        --bg: #ffffff;
        --surface: #f8f8f8;
        --surface2: #f0f0f0;
        --border: #e0e0e0;
        --text: #1e1e1e;
        --muted: #666666;
      }
    }

    /* --- Reset --- */
    * { margin: 0; padding: 0; box-sizing: border-box; }

    /* --- Primary button --- */
    button.btn-primary {
      padding: 6px 14px;
      font: inherit; font-size: 11px;
      border: none; border-radius: 4px;
      cursor: pointer; font-weight: 500;
      background: var(--accent); color: white;
      transition: background 0.2s;
    }
    button.btn-primary:hover { background: var(--accent-hover); }
    button.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    /* --- Secondary button --- */
    button.btn-secondary {
      padding: 4px 10px;
      font: inherit; font-size: 10px;
      background: var(--surface2);
      color: var(--text);
      border: 1px solid var(--border);
      border-radius: 3px;
      cursor: pointer;
    }
    button.btn-secondary:hover { background: var(--border); }

    /* --- Toggle group --- */
    .toggle-group {
      display: flex;
      border: 1px solid var(--border);
      border-radius: 4px;
      overflow: hidden;
      background: var(--surface);
    }
    .toggle-btn {
      flex: 1;
      padding: 5px 12px;
      font: inherit; font-size: 10px;
      border: none;
      background: transparent;
      color: var(--text);
      cursor: pointer;
      transition: all 0.2s;
    }
    .toggle-btn:hover { background: var(--surface2); }
    .toggle-btn.active { background: var(--accent); color: white; }
    .toggle-btn:not(:last-child) { border-right: 1px solid var(--border); }

    /* --- Loading spinner --- */
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: var(--muted);
      font-size: 13px;
    }
    .loading-spinner {
      width: 20px; height: 20px;
      border: 2px solid var(--border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-right: 8px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* --- Status text --- */
    .status {
      font-size: 10px; color: var(--muted);
      text-align: center;
    }
    .status.success { color: var(--success); }
    .status.error   { color: var(--error); }

    /* --- Common layout --- */
    body {
      font-family: var(--font);
      background: var(--bg);
      color: var(--text);
      display: flex;
      flex-direction: column;
    }
    .header {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }
    .title {
      font-weight: 600;
      display: flex;
      align-items: center;
    }
    .subtitle {
      font-size: 10px;
      color: var(--muted);
    }
`;

// ---------------------------------------------------------------------------
// Page-specific styles
// ---------------------------------------------------------------------------

/** india-sales.ts */
export const indiaSalesStyles = `
    body {
      font: 10px/1.3 var(--font);
      padding: 6px;
      max-height: 100vh;
      overflow: hidden;
      gap: 6px;
    }

    /* Header */
    .header {
      gap: 8px;
    }
    .title {
      font-size: 11px;
      gap: 4px;
    }
    .header-info {
      margin-left: auto;
      font-size: 9px;
      color: var(--muted);
    }

    /* Controls section */
    .controls {
      display: flex;
      gap: 6px;
      flex-shrink: 0;
      align-items: flex-end;
    }

    .metric-selector {
      flex: 1;
      min-width: 0;
    }

    .period-toggle {
      flex-shrink: 0;
      min-width: 0;
    }

    /* Metric selector */
    .metric-selector,
    .period-toggle {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .section-label {
      font-size: 8px;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.3px;
      font-weight: 600;
    }
    .metric-selector select {
      padding: 4px 6px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 3px;
      color: var(--text);
      font: inherit;
      cursor: pointer;
    }
    .metric-selector select:focus {
      outline: none;
      border-color: var(--accent);
    }

    /* Search box */
    .search-box {
      margin-bottom: 4px;
    }
    .search-box input {
      width: 100%;
      padding: 4px 6px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 3px;
      color: var(--text);
      font: inherit;
    }
    .search-box input:focus {
      outline: none;
      border-color: var(--accent);
    }
    .search-box input::placeholder {
      color: var(--muted);
    }

    /* States grid */
    .states-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    .states-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .select-actions {
      display: flex;
      gap: 4px;
    }
    .select-actions button {
      padding: 2px 6px;
      font-size: 8px;
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 2px;
      color: var(--text);
      cursor: pointer;
    }
    .select-actions button:hover {
      background: var(--border);
    }

    .states-grid {
      flex: 1;
      overflow-y: auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 4px;
      padding: 6px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 3px;
      align-content: start;
      max-height: 240px;
    }

    .state-card {
      padding: 5px 7px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 3px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .state-card:hover {
      border-color: var(--accent);
      background: var(--surface2);
    }
    .state-card.selected {
      background: color-mix(in srgb, var(--accent) 15%, transparent);
      border-color: var(--accent);
    }
    .state-check {
      width: 14px;
      height: 14px;
      border: 1px solid var(--border);
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      color: transparent;
      flex-shrink: 0;
    }
    .state-card.selected .state-check {
      background: var(--accent);
      border-color: var(--accent);
      color: white;
    }
    .state-info {
      min-width: 0;
    }
    .state-name {
      font-size: 10px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .state-code {
      font-size: 8px;
      color: var(--muted);
      font-family: var(--mono);
    }

    /* Footer */
    .footer {
      display: flex;
      align-items: center;
      gap: 6px;
      padding-top: 6px;
      border-top: 1px solid var(--border);
      flex-shrink: 0;
    }
    .selected-count {
      font-size: 9px;
      color: var(--muted);
    }
    .selected-count strong {
      color: var(--text);
      font-weight: 600;
    }
    .status-bar {
      font-size: 9px;
      color: var(--muted);
      margin-left: auto;
    }
    .status-bar.success { color: var(--success); }
    .status-bar.error { color: var(--warning); }

    /* Empty state */
    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--muted);
      gap: 8px;
    }
    .empty-icon {
      font-size: 24px;
      opacity: 0.5;
    }
    .empty-text {
      font-size: 10px;
    }

    /* Mobile responsiveness */
    @media (max-width: 768px) {
      body {
        padding: 8px;
        gap: 8px;
      }

      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }

      .header-info {
        margin-left: 0;
        font-size: 9px;
      }

      .controls {
        gap: 4px;
      }

      .metric-selector {
        flex: 1;
        min-width: 100px;
      }

      .period-toggle {
        flex-shrink: 1;
      }

      .states-grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 4px;
        padding: 6px;
      }

      .state-card {
        padding: 6px 8px;
      }

      .footer {
        flex-wrap: wrap;
        gap: 6px;
      }

      .selected-count {
        flex: 1 1 100%;
        order: -1;
      }

      button.btn-primary,
      button.btn-secondary {
        flex: 1;
      }

      .status-bar {
        flex: 1 1 100%;
        margin-left: 0;
        text-align: center;
      }
    }

    @media (max-width: 480px) {
      .title {
        font-size: 12px;
      }

      .controls {
        gap: 3px;
      }

      .section-label {
        font-size: 7px;
      }

      .toggle-btn {
        padding: 3px 4px;
        font-size: 9px;
      }

      .metric-selector select,
      #yearSelect {
        padding: 3px 4px !important;
        font-size: 9px !important;
      }

      .states-grid {
        grid-template-columns: 1fr;
      }

      .states-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
      }

      .select-actions {
        width: 100%;
        justify-content: space-between;
      }

      .select-actions button {
        flex: 1;
      }

      .footer {
        gap: 4px;
      }

      button.btn-primary,
      button.btn-secondary {
        padding: 8px 12px;
        font-size: 10px;
      }
    }`;

/** sales-pdf-report.ts */
export const salesPdfReportStyles = `
    body {
      font: 12px/1.4 var(--font);
      padding: 0;
      gap: 0;
      height: 100vh;
      overflow: hidden;
    }

    /* ---------- toolbar ---------- */
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 10px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
      gap: 8px;
    }
    .toolbar-left { display: flex; align-items: center; gap: 6px; min-width: 0; }
    .toolbar-center { display: flex; align-items: center; gap: 4px; }
    .toolbar-right { display: flex; align-items: center; gap: 4px; }
    .pdf-title {
      font-size: 11px; font-weight: 600; color: var(--text);
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      max-width: 200px;
    }
    .pdf-subtitle { font-size: 9px; color: var(--muted); white-space: nowrap; }
    .nav-btn, .zoom-btn {
      width: 24px; height: 24px;
      display: flex; align-items: center; justify-content: center;
      font-size: 11px; border: 1px solid var(--border); border-radius: 3px;
      background: var(--surface2); color: var(--text); cursor: pointer;
    }
    .nav-btn:hover, .zoom-btn:hover { background: var(--border); }
    .nav-btn:disabled, .zoom-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .page-info { font-size: 10px; color: var(--muted); white-space: nowrap; }
    .zoom-level { font-size: 10px; color: var(--muted); min-width: 32px; text-align: center; }

    /* ---------- canvas container ---------- */
    .canvas-container {
      flex: 1;
      overflow: auto;
      display: flex;
      justify-content: center;
      background: var(--surface2);
      padding: 8px;
    }
    .page-wrapper {
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      background: #fff;
      line-height: 0;
    }
    .page-wrapper canvas { display: block; }

    /* ---------- bottom bar ---------- */
    .bottom-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 10px;
      background: var(--surface);
      border-top: 1px solid var(--border);
      flex-shrink: 0;
    }
    .file-info { display: flex; align-items: center; gap: 8px; }
    .file-name { font-size: 10px; font-weight: 600; color: var(--text); }
    .file-size { font-size: 9px; color: var(--muted); }
    .download-btn { padding: 5px 12px; font-size: 10px; }

    /* ---------- loading / status ---------- */
    .loading-overlay {
      position: absolute; inset: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      background: var(--bg); z-index: 10;
      gap: 8px;
    }
    .loading-overlay.hidden { display: none; }
    .status {
      font-size: 10px; color: var(--muted);
      text-align: center; padding: 4px;
    }
    .status.success { color: var(--success); }
    .status.error   { color: var(--error); }`;

/** sales-visualization.ts */
export const salesVisualizationStyles = `
    body {
      font: 12px/1.4 var(--font);
      padding: 12px;
      gap: 10px;
    }

    .header {
      justify-content: space-between;
    }
    .title {
      font-size: 13px;
      gap: 6px;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      flex-shrink: 0;
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 10px;
      text-align: center;
    }
    .card-label {
      font-size: 9px;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-bottom: 4px;
    }
    .card-value {
      font-size: 16px;
      font-weight: 700;
      color: var(--text);
    }
    .card-trend {
      font-size: 10px;
      margin-top: 2px;
    }
    .card-trend.up { color: var(--success); }
    .card-trend.down { color: var(--error); }

    .chart-controls {
      display: flex;
      gap: 6px;
      align-items: center;
      flex-shrink: 0;
    }
    .charts-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      flex: 1;
      min-height: 0;
    }
    .chart-box {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      min-height: 220px;
    }
    .chart-box.full-width {
      grid-column: 1 / -1;
    }
    .chart-title {
      font-size: 10px;
      font-weight: 600;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.3px;
      margin-bottom: 8px;
    }
    .chart-canvas-wrap {
      flex: 1;
      position: relative;
      min-height: 0;
    }
    .chart-canvas-wrap canvas {
      width: 100% !important;
      height: 100% !important;
    }

    @media (max-width: 600px) {
      .summary-cards { grid-template-columns: repeat(2, 1fr); }
      .charts-container { grid-template-columns: 1fr; }
    }`;

