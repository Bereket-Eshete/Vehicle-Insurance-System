import { PrismaClient } from "@prisma/client";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const Signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    if (!firstName || !lastName || !email || !password) {
      throw new Error("All fields are required!");
    }
    const userAlreadyExist = await prisma.user.findUnique({
      where: { email: email },
    });
    if (userAlreadyExist) {
      return res
        .status(400)
        .json({ succes: false, message: "user already exists" });
    }
    const hashePassword = await bcrypt.hash(password, 10);
    const verificationToken = Math.floor(
      1000000 + Math.random() * 900000
    ).toString();
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashePassword,
        verificationToken,
        verificationTokenExpiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000), //after 24 hours
        profile: {
          create: {},
        },
      },
      include: { profile: true },
    });
    generateTokenAndSetCookie(res, newUser.id, newUser.role);
    res.status(201).json({
      succes: true,
      message: "user created succesfully",
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(400).json({ succes: false, message: error.message });
  }
};
