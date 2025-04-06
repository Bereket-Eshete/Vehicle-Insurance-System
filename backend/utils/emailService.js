import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.API_KEY);

export const sendVerificationEmail = async (email, code) => {
  try {
    const response = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: email,
      subject: "Email Verification Code",
      html: `
        <h2>Almost There!</h2>
        <p>Your verification code is:</p>
        <p style="font-size: 24px; font-weight: bold;">${code}</p>
        <p>This code expires in 24 hours.</p>`,
    });

    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Propagate error for proper handling
  }
};
