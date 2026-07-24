const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'superadmin@example.com';
  const password = 'password123!';

  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log('User not found!');
    return;
  }
  console.log('User found:', user.email, 'Role:', user.role);

  const isMatch = await bcrypt.compare(password, user.password);
  console.log('Password match with password123!:', isMatch);

  const isMatchUpper = await bcrypt.compare('Password123!', user.password);
  console.log('Password match with Password123!:', isMatchUpper);
}

main().finally(() => prisma.$disconnect());
