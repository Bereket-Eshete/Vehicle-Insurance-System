import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const testDb = async () => {
  try {
    await prisma.$connect();
    console.log("Database is Succesfully connected");
  } catch (error) {
    console.log("Database connection failed:", error);
  }
};
