// utils/priceUtils.js
export function formatPrice(value) {
  if (value == null) return '';
  const number = Number(value);
  if (isNaN(number)) return '';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(number);
}
