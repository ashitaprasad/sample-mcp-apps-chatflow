/**
 * Indian States Data
 *
 * State definitions used by the sales metric selector UI.
 */

interface IndianState {
    name: string;
    code: string;
    region: string;
}

export const indianStates: IndianState[] = [
    { name: 'Maharashtra', code: 'MH', region: 'West' },
    { name: 'Tamil Nadu', code: 'TN', region: 'South' },
    { name: 'Karnataka', code: 'KA', region: 'South' },
    { name: 'Gujarat', code: 'GJ', region: 'West' },
    { name: 'Telangana', code: 'TS', region: 'South' },
    { name: 'Rajasthan', code: 'RJ', region: 'North' },
    { name: 'Andhra Pradesh', code: 'AP', region: 'South' },
    { name: 'Kerala', code: 'KL', region: 'South' },
    { name: 'Delhi', code: 'DL', region: 'North' },
    { name: 'Madhya Pradesh', code: 'MP', region: 'Central' },
    { name: 'Punjab', code: 'PB', region: 'North' },
    { name: 'Haryana', code: 'HR', region: 'North' },
    { name: 'Odisha', code: 'OD', region: 'East' },
    { name: 'Chhattisgarh', code: 'CG', region: 'Central' },
];

/** Top 5 states by GDP/commerce */
export const topStates: string[] = ['MH', 'TN', 'KA', 'GJ', 'TS'];
