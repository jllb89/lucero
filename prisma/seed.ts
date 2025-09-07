const { PrismaClient, Category } = require("@prisma/client");  // ✅ Import Category enum
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const hashedPassword = await bcrypt.hash("admin123", 10);

  // ✅ Ensure ADMIN user exists
  const admin = await prisma.user.upsert({
    where: { email: "lcastr60@gmail.com" },
    update: {},
    create: {
      email: "lcastr60@gmail.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
      phoneNumber: "555-1001",
      address: "123 Admin St",
      createdAt: new Date(),
    },
  });

  // ✅ Ensure SUPER_ADMIN user exists
  const superAdmin = await prisma.user.upsert({
    where: { email: "lopezb.jl@gmail.com" },
    update: {},
    create: {
      email: "lopezb.jl@gmail.com",
      name: "Super Admin User",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      phoneNumber: "555-1002",
      address: "456 SuperAdmin Ave",
      createdAt: new Date(),
    },
  });

  console.log("✅ Admin users seeded!");
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
