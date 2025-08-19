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

  // ✅ Generate 10 users
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
          phoneNumber: `555-10${i + 2}`, // Unique phone numbers
          address: `Address for User ${i}`,
          createdAt: new Date(),
        },
      })
    );
  }

  await Promise.all(users);
  console.log("✅ 10 users seeded!");

  // ✅ Seed Books
  const books = [];
  for (let i = 1; i <= 10; i++) {
    books.push(
      prisma.book.create({
        data: {
          id: uuidv4(),
          title: `Book Title ${i}`,
          author: `Author ${i}`,
          description: `Description for Book ${i}.`,
          digitalPrice: parseFloat((30 + i * 2).toFixed(2)), // ✅ Convert to float
          physicalPrice: parseFloat((50 + i * 3).toFixed(2)), // ✅ Convert to float
          stock: 10 + i,
          images: [`https://via.placeholder.com/150?text=Book+${i}`],
          bookFile: `https://example.com/book${i}.pdf`,
          bookCover: `https://via.placeholder.com/200x300?text=Cover+${i}`,
          category: Object.values(Category)[i % Object.values(Category).length], // ✅ Assign valid enum
        },
      })
    );
  }

  await Promise.all(books);
  console.log("✅ 10 books seeded!");

  // ✅ Retrieve all books from DB
  const allBooks = await prisma.book.findMany();
  
  // ✅ Generate 10 orders and assign books
  const orders = [];
  for (let i = 1; i <= 10; i++) {
    const total = parseFloat((Math.random() * 100).toFixed(2));
    const user = await prisma.user.findFirst({ where: { email: `user${i}@example.com` } });

    if (user) {
      const newOrder = await prisma.order.create({
        data: {
          userId: user.id,
          total,
          createdAt: new Date(),
        },
      });

      // ✅ Assign 1-3 random books to this order
      const randomBooks = allBooks
        .sort(() => 0.5 - Math.random()) // Shuffle books
        .slice(0, Math.floor(Math.random() * 3) + 1); // Pick 1-3 books

      await prisma.orderItem.createMany({
        data: randomBooks.map((book: { id: string }) => ({
          orderId: newOrder.id,
          bookId: book.id,
        })),
      });

      console.log(`📚 Order ${newOrder.id} assigned ${randomBooks.length} books.`);
    }
  }

  console.log("✅ 10 orders with books seeded!");
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
