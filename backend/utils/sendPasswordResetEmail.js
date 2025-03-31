import { Resend } from "resend";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();
const resend = new Resend(process.env.API_KEY);
export const sendPassResetEmail = async (email) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new Error("user not found");
    }
    const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    console.log(resetToken);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiredAt: new Date(Date.now() + 3600000),
      },
    });
    const resetLink = `http://localhost:3000/api/auth/resetpassword?token=${resetToken}`;
    const response = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: email,
      subject: "Email Verification Code",
      html: `
              <h2>Almost There!</h2>
              <p>Click The Link Below:</p>
              <a herf="${resetLink}">${resetLink}</a>
              <p>This code expires in 1 hour.</p>`,
    });

    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};
