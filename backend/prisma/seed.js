require('dotenv').config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function upsertSuperAdmin() {
  const email = process.env.SEED_SUPER_ADMIN_EMAIL;
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD;
  const name = process.env.SEED_SUPER_ADMIN_NAME || "Super Admin";

  console.log(`Debug: Using email=${email}, password_length=${password ? password.length : 0}`);

  if (!email || !password) {
    console.log("Skipping super admin seed. Set SEED_SUPER_ADMIN_EMAIL and SEED_SUPER_ADMIN_PASSWORD to create one.");
    return null;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: passwordHash,
      role: "SUPER_ADMIN",
    },
    create: {
      name,
      email,
      password: passwordHash,
      role: "SUPER_ADMIN",
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });
}

async function main() {
  const superAdmin = await upsertSuperAdmin();
  if (superAdmin) {
    console.log("Super admin ready:", superAdmin.email);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });