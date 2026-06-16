export function formatETB(amount) {
  return `ETB ${Number(amount || 0).toLocaleString("en-ET", {
    maximumFractionDigits: 0,
  })}`;
}

function simulatePayment(method, payload = {}) {
  return Promise.resolve({
    success: true,
    method,
    amount: payload.amount || 0,
    bookingId: payload.bookingId || "",
    currency: "ETB",
    locale: "Ethiopia",
    transactionId: `${method.replace(/\W+/g, "").toUpperCase()}-${Date.now()}`,
    processedAt: new Date().toISOString(),
  });
}

export function processTelebirrPayment(payload) {
  return simulatePayment("Telebirr", payload);
}

export function processCBEBirrPayment(payload) {
  return simulatePayment("CBE Birr", payload);
}

export function processEBirrPayment(payload) {
  return simulatePayment("E-birr", payload);
}

export function processPayment(method, payload) {
  if (method === "Telebirr") return processTelebirrPayment(payload);
  if (method === "CBE Birr") return processCBEBirrPayment(payload);
  if (method === "E-birr") return processEBirrPayment(payload);

  throw new Error("Unsupported Ethiopian payment method.");
}
