import { randomBytes, scryptSync } from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

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

await prisma.$disconnect();
