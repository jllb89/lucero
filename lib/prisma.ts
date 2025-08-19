import { PrismaClient } from "@prisma/client/edge"; // ✅ Use Prisma Edge client
import { withAccelerate } from "@prisma/extension-accelerate";
import "dotenv/config";

const prismaClient = new PrismaClient().$extends(withAccelerate());

// Cast to unknown first, then to PrismaClient to ensure type compatibility
export const prisma = prismaClient as unknown as PrismaClient;