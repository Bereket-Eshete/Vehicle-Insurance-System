import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.API_KEY);

export const sendVerificationEmail = async (email, code) => {
  try {
    const verifyLink = `http://localhost:8080/verify-email?token=${code}`;

    const response = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: email,
      subject: "Verify your Email",
      html: `
        <h2>Welcome to Acme!</h2>
        <p>Click the button below to verify your email address:</p>
        <a href="${verifyLink}" style="padding: 10px 20px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${verifyLink}</p>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    console.log("Verification email sent:", response);
    return response;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};
