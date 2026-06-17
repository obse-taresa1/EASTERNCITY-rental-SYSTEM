export const paymentMethods = [
  {
    id: "telebirr",
    name: "Telebirr",
  },
  {
    id: "cbe-birr",
    name: "CBE Birr",
  },
  {
    id: "e-birr",
    name: "E-birr",
  },
];

export async function processTelebirrPayment(paymentDetails) {
  return simulatePayment("Telebirr", paymentDetails);
}

export async function processCBEBirrPayment(paymentDetails) {
  return simulatePayment("CBE Birr", paymentDetails);
}

export async function processEBirrPayment(paymentDetails) {
  return simulatePayment("E-birr", paymentDetails);
}

export async function processPayment(paymentMethod, paymentDetails) {
  // Error 9: Handle case sensitivity
  const method = paymentMethod?.toLowerCase();
  
  // Error 6: Validate paymentDetails
  if (!paymentDetails) {
    throw new Error("Payment details are required.");
  }
  
  // Error 7: Validate amount
  if (!paymentDetails.amount || paymentDetails.amount <= 0) {
    throw new Error("Invalid payment amount.");
  }

  // Use the paymentMethods array to find the method
  const validMethod = paymentMethods.find(
    (pm) => pm.id === method || pm.name.toLowerCase() === method
  );

  if (!validMethod) {
    throw new Error(`Unsupported payment method: ${paymentMethod}`);
  }

  // Map to the correct function
  const paymentFunctions = {
    "telebirr": processTelebirrPayment,
    "cbe-birr": processCBEBirrPayment,
    "e-birr": processEBirrPayment,
  };

  const paymentFunction = paymentFunctions[method];
  if (!paymentFunction) {
    throw new Error("Payment method not implemented.");
  }

  return paymentFunction(paymentDetails);
}

// Error 5: Make async
async function simulatePayment(method, paymentDetails) {
  // Error 8: Add error simulation (10% chance of failure for realism)
  const shouldFail = Math.random() < 0.1; // 10% failure rate
  
  // Error 1, 2, 3: Fix template literals
  const transactionId = `${method.replace(/ /g, "-").toUpperCase()}-${Date.now()}`;
  
  if (shouldFail) {
    return Promise.reject({
      success: false,
      error: "Payment failed. Please try again.",
      method,
      amount: paymentDetails.amount,
    });
  }
  
  return {
    success: true,
    transactionId: transactionId,
    method,
    amount: paymentDetails.amount,
    timestamp: new Date().toISOString(),
    message: `${method} payment simulated successfully.`,
  };
}