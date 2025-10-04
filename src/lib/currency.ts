export function formatXOF(amount: number): string {
  try {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Fallback formatting
    const rounded = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${rounded} F CFA`;
  }
}