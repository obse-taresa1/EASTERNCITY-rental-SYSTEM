// prisma.config.ts for Prisma 7+ datasource configuration
import { defineConfig } from '@prisma/client';
export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
