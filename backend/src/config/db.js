// src/config/db.js
const { PrismaClient } = require('@prisma/client');

/**
 * Instantiate PrismaClient.
 * In a production app, we ensure there is only one instance of PrismaClient
 * to prevent exhausting database connections.
 */
const prisma = new PrismaClient();

module.exports = prisma;
