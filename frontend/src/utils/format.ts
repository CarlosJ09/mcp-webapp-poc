/**
 * Format currency values
 */
export function formatCurrency(value: number): string {
  return `$${value.toLocaleString()}`;
}

/**
 * Format number with locale
 */
export function formatNumber(value: number): string {
  return value.toLocaleString();
}

/**
 * Format response time with unit
 */
export function formatResponseTime(value: number): string {
  return `${value}ms`;
}
