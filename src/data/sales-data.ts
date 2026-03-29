/**
 * Sales Report Generator
 * 
 * Generates sales report data based on selected states, metrics, period, and year.
 */

interface SalesReportSummary {
  total: string;
  average: string;
  trend: string;
  totalRaw: number;
  averageRaw: number;
}

interface TopState {
  name: string;
  code: string;
  value: string;
  percentage: string;
}

interface PeriodData {
  period: string;
  total: string;
  stateValues: Record<string, number>;  // stateName -> formatted value
}

interface StateData {
  state: string;
  value: string;
  percentage: string;
}

interface SalesReport {
  summary: SalesReportSummary;
  topState: TopState;
  periods: PeriodData[];
  states: StateData[];
  stateNames: string[];  // ordered state names for column headers
}

const stateNames: Record<string, string> = {
  'MH': 'Maharashtra', 'DL': 'Delhi', 'KA': 'Karnataka', 'TN': 'Tamil Nadu',
  'GJ': 'Gujarat', 'RJ': 'Rajasthan', 'AP': 'Andhra Pradesh', 'TS': 'Telangana',
  'KL': 'Kerala', 'PB': 'Punjab', 'HR': 'Haryana', 'OD': 'Odisha',
  'MP': 'Madhya Pradesh', 'CG': 'Chhattisgarh'
};

export const metricConfig: Record<string, { unit: string; prefix: string; multiplier: number }> = {
  revenue: { unit: '', prefix: '₹', multiplier: 100000 },
  orders: { unit: ' orders', prefix: '', multiplier: 1000 },
  aov: { unit: '', prefix: '₹', multiplier: 2000 },
  conversion: { unit: '%', prefix: '', multiplier: 3 },
  clv: { unit: '', prefix: '₹', multiplier: 50000 },
  growth: { unit: '%', prefix: '', multiplier: 5 },
  returns: { unit: '%', prefix: '', multiplier: 2 },
  cart_value: { unit: '', prefix: '₹', multiplier: 3000 },
  new_customers: { unit: ' customers', prefix: '', multiplier: 500 },
  repeat_rate: { unit: '%', prefix: '', multiplier: 25 }
};

/**
 * Generate sales report data based on selections
 * 
 * @param states - Array of state codes (e.g., ['MH', 'TN', 'KA'])
 * @param metric - Metric type (revenue, orders, aov, etc.)
 * @param period - Time period granularity (monthly or quarterly)
 * @param year - Year for the report
 * @returns Structured sales report data
 */
export function getData(
  states: string[],
  metric: string,
  period: 'monthly' | 'quarterly',
  year: string
): SalesReport {
  const config = metricConfig[metric] || { unit: '', prefix: '', multiplier: 1000 };
  const periodsCount = period === 'monthly' ? 12 : 4;

  // Build ordered state name list
  const orderedStateNames = states.map(code => stateNames[code] || code);

  // Generate per-state weight (some states contribute more)
  const stateWeights: Record<string, number> = {};
  states.forEach(code => {
    stateWeights[code] = 0.5 + Math.random() * 1.0; // 0.5 – 1.5
  });
  const weightSum = Object.values(stateWeights).reduce((a, b) => a + b, 0);

  // Generate period-level data with per-state breakdown
  const periods: Array<{ period: string; total: number; stateRaw: Record<string, number> }> = [];
  const stateTotals: Record<string, number> = {};
  states.forEach(code => { stateTotals[stateNames[code] || code] = 0; });

  let grandTotal = 0;

  for (let i = 0; i < periodsCount; i++) {
    const periodName = period === 'monthly'
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]
      : `Q${i + 1}`;

    // Base value for this period
    const periodBase = config.multiplier * (1 + Math.sin(i / 2) * 0.3 + Math.random() * 0.2);

    // Split across states according to weights + small random noise
    const stateRaw: Record<string, number> = {};
    let periodTotal = 0;
    states.forEach(code => {
      const name = stateNames[code] || code;
      const noise = 0.85 + Math.random() * 0.3; // ±15%
      const val = Math.round((periodBase * (stateWeights[code] / weightSum)) * noise);
      stateRaw[code] = val;
      stateTotals[name] += val;
      periodTotal += val;
    });

    grandTotal += periodTotal;
    periods.push({ period: `${periodName} ${year}`, total: periodTotal, stateRaw });
  }

  // Format period data
  const formattedPeriods: PeriodData[] = periods.map(p => {
    const sv: Record<string, number> = {};
    states.forEach(code => {
      sv[code] = p.stateRaw[code];
    });
    return {
      period: p.period,
      total: `${config.prefix}${p.total.toLocaleString()}${config.unit}`,
      stateValues: sv,
    };
  });

  // Build state aggregate data
  const stateData = orderedStateNames.map(name => {
    const raw = stateTotals[name];
    const pct = ((raw / grandTotal) * 100).toFixed(1);
    return {
      state: name,
      value: `${config.prefix}${raw.toLocaleString()}${config.unit}`,
      percentage: pct,
      rawValue: raw,
    };
  });
  stateData.sort((a, b) => b.rawValue - a.rawValue);

  const topState = stateData[0];

  // Summary
  const average = Math.round(grandTotal / periodsCount);
  const recentAvg = periods.slice(-3).reduce((s, p) => s + p.total, 0) / 3;
  const earlierAvg = periods.slice(0, 3).reduce((s, p) => s + p.total, 0) / 3;
  const trendPercent = (((recentAvg - earlierAvg) / earlierAvg) * 100).toFixed(1);
  const trend = parseFloat(trendPercent) > 0 ? `↑ ${trendPercent}%` : `↓ ${Math.abs(parseFloat(trendPercent))}%`;

  return {
    summary: {
      total: `${config.prefix}${grandTotal.toLocaleString()}${config.unit}`,
      average: `${config.prefix}${average.toLocaleString()}${config.unit}`,
      trend,
      totalRaw: grandTotal,
      averageRaw: average,
    },
    topState: {
      name: topState.state,
      code: states[orderedStateNames.indexOf(topState.state)] || '',
      value: topState.value,
      percentage: topState.percentage,
    },
    periods: formattedPeriods,
    states: stateData.map(({ state, value, percentage }) => ({ state, value, percentage })),
    stateNames: orderedStateNames,
  };
}
