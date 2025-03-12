const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Ensure ADMIN users exist
  const admin = await prisma.user.upsert({
    where: { email: "lcastr60@gmail.com" },
    update: {},
    create: {
      email: "lcastr60@gmail.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const superAdmin = await prisma.user.upsert({
    where: { email: "lopezb.jl@gmail.com" },
    update: {},
    create: {
      email: "lopezb.jl@gmail.com",
      name: "Super Admin User",
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });

  console.log("✅ Admin users seeded!");

  // Generate 10 users
  const users = [];
  for (let i = 1; i <= 10; i++) {
    users.push(
      prisma.user.upsert({
        where: { email: `user${i}@example.com` },
        update: {},
        create: {
          email: `user${i}@example.com`,
          name: `User ${i}`,
          password: await bcrypt.hash(`password${i}`, 10),
          role: "USER",
        },
      })
    );
  }

  await Promise.all(users);
  console.log("✅ 10 users seeded!");

  // Generate 10 books
  const books = [];
  for (let i = 1; i <= 10; i++) {
    books.push(
      prisma.book.create({
        data: {
          id: uuidv4(),
          title: `Book Title ${i}`,
          author: `Author ${i}`,
          description: `Description for Book ${i}.`,
          digitalPrice: parseFloat((Math.random() * 50 + 10).toFixed(2)),
          physicalPrice: parseFloat((Math.random() * 60 + 20).toFixed(2)),
          stock: Math.floor(Math.random() * 100),
          images: [`https://via.placeholder.com/150?text=Book+${i}`],
          bookFile: `https://example.com/book${i}.pdf`,
        },
      })
    );
  }

  await Promise.all(books);
  console.log("✅ 10 books seeded!");

  // Generate 10 orders
  const orders = [];
  for (let i = 1; i <= 10; i++) {
    const total = parseFloat((Math.random() * 100).toFixed(2));
    const user = await prisma.user.findFirst({ where: { email: `user${i}@example.com` } });

    if (user) {
      orders.push(
        prisma.order.create({
          data: {
            userId: user.id, // Using the correct user ID
            total, // 🔥 Changed from `totalAmount` to `total`
            createdAt: new Date(),
          },
        })
      );
    }
  }

  await Promise.all(orders);
  console.log("✅ 10 orders seeded!");

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
