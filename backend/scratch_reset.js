const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  await prisma.user.updateMany({
    where: { role: 'SUPER_ADMIN' },
    data: { password: hashedPassword }
  });
  console.log("Super admin password reset to 'password123'");
}

main().finally(() => prisma.$disconnect());
