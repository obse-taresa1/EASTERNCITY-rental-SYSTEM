export function formatCurrency(amount) {
  return `ETB ${Number(amount || 0).toLocaleString("en-US")}`;
}

export function formatDailyPrice(amount) {
  return `${formatCurrency(amount)}/day`;
}