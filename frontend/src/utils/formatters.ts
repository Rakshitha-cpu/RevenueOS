/**
 * Formatting and calculation utilities for RevenueOS Command Center
 */

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function calculateUplift(baselineAmount: number, recoveredAmount: number): number {
  if (baselineAmount <= 0) return 0;
  return Number((((recoveredAmount - baselineAmount) / baselineAmount) * 100).toFixed(1));
}

export function sanitizeMaskedVPA(vpa: string): string {
  const parts = vpa.split('@');
  if (parts.length !== 2) return '***@upi';
  const prefix = parts[0];
  const maskedPrefix = prefix.length > 2 
    ? prefix.substring(0, 2) + '*'.repeat(prefix.length - 2) 
    : prefix;
  return `${maskedPrefix}@${parts[1]}`;
}
