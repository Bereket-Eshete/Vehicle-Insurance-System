import { PrismaClient } from "@prisma/client";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail } from "../utils/emailService.js";
import { sendPassResetEmail } from "../utils/sendPasswordResetEmail.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
dotenv.config();
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
    //send verfication email
    sendVerificationEmail(email, verificationToken);
    res.status(201).json({
      succes: true,
      message: "Verify your Email",
    });
  } catch (error) {
    res.status(400).json({ succes: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { email, code } = req.body;
  try {
    const user = await prisma.user.findFirst({
      where: {
        email,
        verificationToken: code,
        verificationTokenExpiredAt: { gt: new Date() },
      },
    });
    if (!user) {
      throw new Error("Invalid or expired verification code");
    }
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiredAt: null,
      },
    });
    res.status(200).json({
      success: true,
      message: "Email verified succesfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: true,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const resendCode = async (req, res) => {
  const { email } = req.body;
  try {
    const user = prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return res.status(400).json({
        succes: false,
        message: "Email not found",
      });
    }
    const newCode = Math.floor(1000000 + Math.random() * 900000).toString();
    const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await prisma.user.update({
      where: { id: user.id },
      verificationToken: newCode,
      verificationTokenExpiredAt: newExpiry,
    });
    //resend email
    sendVerificationEmail(email, verificationToken);
    res.status(200).json({
      succes: true,
      message: "New verfication code sent",
    });
  } catch (error) {
    res.status(500).json({
      succes: false,
      message: error.message,
    });
  }
};

export const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      throw new Error("All fields are required!");
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    if (!user.isVerified) {
      res.status(400).json({
        success: false,
        message: "please verfiy your email first",
      });
    }
    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword) {
      res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }
    generateTokenAndSetCookie(res, user.id, user.role);
    res.status(200).json({
      succes: true,
      message: "Logged in succesfully",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const Logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    success: true,
    message: "Logged out succesfully",
  });
};
export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  const response = await sendPassResetEmail(email);
  res.json(response);
};
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired Token",
      });
    }
    const user = await prisma.user.findUnique({
      where: { id: decode.userId },
    });
    if (!user || user.resetPasswordExpiredAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "expired token",
      });
    }
    const hashPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashPassword,
        resetPasswordToken: null,
        resetPasswordExpiredAt: null,
      },
    });
    res.status(200).json({
      success: true,
      message: "password reset succesfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
