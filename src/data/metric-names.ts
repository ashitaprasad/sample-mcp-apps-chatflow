/**
 * Metric Name Mappings
 *
 * Display names for sales metrics, used across UI components and the server.
 */

/** Full display names (e.g. "Total Revenue") — used in the metric selector and report text */
export const metricDisplayNames: Record<string, string> = {
    revenue: 'Total Revenue',
    orders: 'Total Orders',
    aov: 'Average Order Value',
    conversion: 'Conversion Rate',
    clv: 'Customer Lifetime Value',
    growth: 'Growth Rate',
    returns: 'Return Rate',
    cart_value: 'Average Cart Value',
    new_customers: 'New Customers',
    repeat_rate: 'Repeat Purchase Rate',
};

/** Short display names (e.g. "Revenue") — used in charts and compact UI */
export const metricShortNames: Record<string, string> = {
    revenue: 'Revenue',
    orders: 'Orders',
    aov: 'AOV',
    conversion: 'Conversion Rate',
    clv: 'CLV',
    growth: 'Growth Rate',
    returns: 'Return Rate',
    cart_value: 'Cart Value',
    new_customers: 'New Customers',
    repeat_rate: 'Repeat Rate',
};
