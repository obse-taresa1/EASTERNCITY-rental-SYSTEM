// src/config/db.js
const { PrismaClient } = require('@prisma/client');

/**
 * Instantiate PrismaClient with Neon-aware retry logic.
 * Neon free-tier databases auto-suspend after a period of inactivity.
 * This wrapper retries failed queries up to 3 times with backoff so the
 * first request after a cold-start succeeds instead of returning a 503.
 */
const prisma = new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Wrap every Prisma query with automatic retry on connection errors.
const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 800;

function isConnectionError(err) {
  return (
    err?.code === 'P1001' ||
    err?.code === 'P1008' ||
    /Can't reach database|connection.*refused|ECONNREFUSED|ENOTFOUND|socket hang up/i.test(
      String(err?.message || '')
    )
  );
}

/**
 * Wraps a Prisma operation (a function that returns a promise) with retry logic.
 * @param {() => Promise<any>} operation
 * @param {number} [retries]
 * @returns {Promise<any>}
 */
async function withRetry(operation, retries = MAX_RETRIES) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (err) {
      lastError = err;
      if (!isConnectionError(err) || attempt === retries) throw err;
      const delay = INITIAL_DELAY_MS * Math.pow(2, attempt); // exponential back-off
      console.warn(`[DB] Connection error (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms…`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw lastError;
}

// Attach helper so controllers can use it: prisma.$withRetry(() => prisma.listing.findMany())
prisma.$withRetry = withRetry;

module.exports = prisma;
