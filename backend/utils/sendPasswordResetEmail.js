import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();
const prisma = new PrismaClient();
const resend = new Resend(process.env.API_KEY);
export const sendPassResetEmail = async (email) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        message: "If this email exists, we've sent a reset link",
      }; // Don't reveal if user doesn't exist for security
    }

    const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiredAt: new Date(Date.now() + 3600000),
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const response = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    return {
      success: true,
      message: "Password reset link sent",
    };
  } catch (error) {
    console.error("Error sending reset email:", error);
    return {
      success: false,
      message: "Failed to send reset email",
    };
  }
};
