import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/auth";

const prisma = new PrismaClient();

async function main() {
  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, checkoutPublic: false },
  });
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    await prisma.adminUser.upsert({
      where: { email },
      update: {},
      create: { email, passwordHash: hashPassword(password) },
    });
  }
}

main().finally(() => prisma.$disconnect());
