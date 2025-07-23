// import { PrismaClient } from "@prisma/client";
// import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
// import { sendVerificationEmail } from "../utils/emailService.js";
// import { sendPassResetEmail } from "../utils/sendPasswordResetEmail.js";
// import dotenv from "dotenv";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";
// dotenv.config();
// const prisma = new PrismaClient();

// export const Signup = async (req, res) => {
//   const { firstName, lastName, email, password } = req.body;
//   try {
//     if (!firstName || !lastName || !email || !password) {
//       throw new Error("All fields are required!");
//     }
//     const userAlreadyExist = await prisma.user.findUnique({
//       where: { email: email },
//     });
//     if (userAlreadyExist) {
//       return res
//         .status(400)
//         .json({ success: false, message: "user already exists" });
//     }
//     const hashePassword = await bcrypt.hash(password, 10);
//     const verificationToken = Math.floor(
//       1000000 + Math.random() * 900000
//     ).toString();
//     const newUser = await prisma.user.create({
//       data: {
//         firstName,
//         lastName,
//         email,
//         password: hashePassword,
//         verificationToken,
//         verificationTokenExpiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000), //after 24 hours
//         profile: {
//           create: {},
//         },
//       },
//       include: { profile: true },
//     });
//     generateTokenAndSetCookie(res, newUser.id, newUser.role);
//     sendVerificationEmail(email, verificationToken);
//     res.status(201).json({
//       succes: true,
//       message: "Verify your Email",
//     });
//   } catch (error) {
//     res.status(400).json({ succes: false, message: error.message });
//   }
// };
// export const verifyEmail = async (req, res) => {
//   const { token } = req.query;
//   try {
//     const user = await prisma.user.findFirst({
//       where: {
//         verificationToken: token,
//         verificationTokenExpiredAt: { gt: new Date() },
//       },
//     });

//     if (!user) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid or expired token" });
//     }

//     await prisma.user.update({
//       where: { id: user.id },
//       data: {
//         isVerified: true,
//         verificationToken: null,
//         verificationTokenExpiredAt: null,
//       },
//     });

//     res.status(200).json({
//       success: true,
//       message: "Email verified successfully",
//       user: {
//         id: user.id,
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         role: user.role,
//         isVerified: true,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // controllers/authController.js
// export const resendCode = async (req, res) => {
//   const { email } = req.body;
//   console.log(email);

//   try {
//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required",
//       });
//     }

//     const user = await prisma.user.findUnique({
//       where: { email },
//     });

//     if (!user) {
//       // For security, don't reveal if email doesn't exist
//       return res.status(200).json({
//         success: true,
//         message: "If this email exists, a new verification link has been sent",
//       });
//     }

//     if (user.isVerified) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is already verified",
//       });
//     }

//     const verificationToken = jwt.sign(
//       { userId: user.id },
//       process.env.JWT_SECRET,
//       { expiresIn: "24h" }
//     );

//     await prisma.user.update({
//       where: { id: user.id },
//       data: {
//         verificationToken,
//         verificationTokenExpiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
//       },
//     });

//     const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

//     await resend.emails.send({
//       from: "Your App <no-reply@yourdomain.com>",
//       to: email,
//       subject: "Verify Your Email Address",
//       html: `
//         <h2>Email Verification</h2>
//         <p>Click the link below to verify your email address:</p>
//         <a href="${verificationLink}">Verify Email</a>
//         <p>This link expires in 24 hours.</p>
//         <p>If you didn't request this, please ignore this email.</p>
//       `,
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Verification email resent successfully",
//     });
//   } catch (error) {
//     console.error("Error resending verification email:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to resend verification email",
//     });
//   }
// };
// export const Login = async (req, res) => {
//   const { email, password } = req.body;
//   try {
//     if (!email || !password) {
//       throw new Error("All fields are required!");
//     }

//     const user = await prisma.user.findUnique({
//       where: { email },
//     });

//     if (!user) {
//       return res.status(400).json({
//         // ✅ Added return
//         success: false,
//         message: "Invalid email or password",
//       });
//     }

//     if (!user.isVerified) {
//       return res.status(400).json({
//         // ✅ Added return
//         success: false,
//         message: "Please verify your email first",
//       });
//     }

//     const isPassword = await bcrypt.compare(password, user.password);
//     if (!isPassword) {
//       return res.status(400).json({
//         // ✅ Added return
//         success: false,
//         message: "Invalid email or password",
//       });
//     }

//     const token = generateTokenAndSetCookie(res, user.id, user.role);
//     return res.status(200).json({
//       // ✅ Added return (optional but good practice)
//       success: true, // Fixed typo: "succes" → "success"
//       message: "Logged in successfully",
//       user: {
//         id: user.id,
//         email: user.email,
//         role: user.role,
//       },
//       token,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       // ✅ Added return
//       success: false,
//       message: error.message,
//     });
//   }
// };
// export const Logout = async (req, res) => {
//   res.clearCookie("token", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//   });

//   res.status(200).json({
//     success: true,
//     message: "Logged out succesfully",
//   });
// };
// export const forgetPassword = async (req, res) => {
//   const { email } = req.body;

//   try {
//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required",
//       });
//     }

//     const response = await sendPassResetEmail(email);

//     if (!response.success) {
//       return res.status(400).json(response);
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Password reset link sent to your email",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// export const resetPassword = async (req, res) => {
//   const { token, password } = req.body;

//   try {
//     // 1. Validate input
//     if (!token || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Token and password are required",
//       });
//     }

//     // 2. Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (!decoded?.userId) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid token",
//       });
//     }

//     // 3. Find user and validate token
//     const user = await prisma.user.findUnique({
//       where: { id: decoded.userId },
//     });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     if (!user.resetPasswordToken || user.resetPasswordToken !== token) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid token",
//       });
//     }

//     if (new Date() > new Date(user.resetPasswordExpiredAt)) {
//       return res.status(400).json({
//         success: false,
//         message: "Token has expired",
//       });
//     }

//     // 4. Update password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     await prisma.user.update({
//       where: { id: user.id },
//       data: {
//         password: hashedPassword,
//         resetPasswordToken: null,
//         resetPasswordExpiredAt: null,
//       },
//     });

//     return res.status(200).json({
//       success: true,
//       message: "Password reset successfully",
//     });
//   } catch (error) {
//     console.error("Reset password error:", error);

//     if (error instanceof jwt.TokenExpiredError) {
//       return res.status(400).json({
//         success: false,
//         message: "Token has expired",
//       });
//     }

//     if (error instanceof jwt.JsonWebTokenError) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid token",
//       });
//     }

//     return res.status(500).json({
//       success: false,
//       message: "An error occurred while resetting password",
//     });
//   }
// };
// // In your authController.js

// // authController.js
// export const validateToken = async (req, res) => {
//   try {
//     // 1. Get token from cookies
//     const token = req.cookies.token;

//     if (!token) {
//       return res.status(401).json({ success: false });
//     }

//     // 2. Verify the token using your JWT secret
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // 3. Optional: Verify user exists in database
//     const user = await prisma.user.findUnique({
//       where: { id: decoded.userId },
//       select: {
//         id: true,
//         email: true,
//         firstName: true,
//         lastName: true,
//         role: true,
//         isVerified: true,
//       },
//     });

//     if (!user) {
//       return res.status(401).json({ success: false });
//     }

//     // 4. Return success with user data
//     return res.status(200).json({
//       success: true,
//       user,
//     });
//   } catch (error) {
//     console.error("Token validation error:", error);
//     return res.status(401).json({ success: false });
//   }
// };

import { PrismaClient } from "@prisma/client";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail } from "../utils/emailService.js";
import { sendPassResetEmail } from "../utils/sendPasswordResetEmail.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { generateProfileId, generateUserId } from "../utils/idGenerator.js";
dotenv.config();
const prisma = new PrismaClient();
const userId = generateUserId();
const profileId = generateProfileId();

export const Signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    if (!firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });
    }

    const userAlreadyExist = await prisma.user.findUnique({
      where: { email: email },
    });

    if (userAlreadyExist) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashePassword = await bcrypt.hash(password, 10);
    const verificationToken = Math.floor(
      1000000 + Math.random() * 900000
    ).toString();

    const newUser = await prisma.user.create({
      data: {
        id: userId,
        firstName,
        lastName,
        email,
        password: hashePassword,
        verificationToken,
        verificationTokenExpiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        profile: {
          create: {
            id: profileId,
          },
        },
      },
      include: { profile: true },
    });

    const token = generateTokenAndSetCookie(res, newUser);
    sendVerificationEmail(email, verificationToken);

    return res.status(201).json({
      success: true,
      message: "Verify your Email",
      token, // Return token for immediate frontend use
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// export const verifyEmail = async (req, res) => {
//   const { token } = req.query;
//   try {
//     const user = await prisma.user.findFirst({
//       where: {
//         verificationToken: token,
//         verificationTokenExpiredAt: { gt: new Date() },
//       },
//     });

//     if (!user) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid or expired token" });
//     }

//     const updatedUser = await prisma.user.update({
//       where: { id: user.id },
//       data: {
//         isVerified: true,
//         verificationToken: null,
//         verificationTokenExpiredAt: null,
//       },
//     });

//     // Generate new token with verified status
//     const newToken = generateTokenAndSetCookie(res, updatedUser);

//     return res.status(200).json({
//       success: true,
//       message: "Email verified successfully",
//       user: {
//         id: updatedUser.id,
//         email: updatedUser.email,
//         firstName: updatedUser.firstName,
//         lastName: updatedUser.lastName,
//         role: updatedUser.role,
//         isVerified: true,
//       },
//       token: newToken,
//     });
//   } catch (error) {
//     console.error("Email verification error:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };
export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "Token is required" });
  }

  try {
    // Log the received token and current time for debugging
    console.log("Verification attempt - Token:", token);
    console.log("Current server time:", new Date());

    // Find the user with a matching token that hasn't expired
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiredAt: { gt: new Date() }, // Checks if expiration is in the future
      },
    });

    if (!user) {
      // Additional debug: Check if the token exists without expiration check
      const userWithTokenOnly = await prisma.user.findFirst({
        where: { verificationToken: token },
      });

      if (userWithTokenOnly) {
        console.log(
          "Token exists but is expired. Expiry time:",
          userWithTokenOnly.verificationTokenExpiredAt
        );
      } else {
        console.log("Token not found in database");
      }

      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token" });
    }

    // Update user to mark as verified and clear token fields
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiredAt: null,
      },
    });

    // Generate new JWT token with verified status
    const newToken = generateTokenAndSetCookie(res, updatedUser);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        isVerified: true,
      },
      token: newToken,
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const resendCode = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If this email exists, a new verification link has been sent",
      });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email is already verified" });
    }

    const verificationToken = Math.floor(
      1000000 + Math.random() * 900000
    ).toString();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await sendVerificationEmail(email, verificationToken);

    return res.status(200).json({
      success: true,
      message: "Verification email resent successfully",
    });
  } catch (error) {
    console.error("Resend code error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to resend verification email" });
  }
};

export const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Please verify your email first" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }

    const token = generateTokenAndSetCookie(res, user);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const Logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
      domain: process.env.COOKIE_DOMAIN || undefined,
    });

    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If this email exists, a password reset link has been sent",
      });
    }

    const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiredAt: new Date(Date.now() + 3600000), // 1 hour
      },
    });

    await sendPassResetEmail(email, resetToken);

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  try {
    if (!token || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Token and password are required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.userId) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user || user.resetPasswordToken !== token) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    if (new Date() > new Date(user.resetPasswordExpiredAt)) {
      return res
        .status(400)
        .json({ success: false, message: "Token has expired" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiredAt: null,
      },
    });

    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);

    if (error instanceof jwt.TokenExpiredError) {
      return res
        .status(400)
        .json({ success: false, message: "Token has expired" });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ success: false, message: "Invalid token" });
    }

    return res.status(500).json({
      success: false,
      message: "An error occurred while resetting password",
    });
  }
};

export const validateToken = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.userId) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    // Optional: Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user,
      token, // Return the same token for frontend use
    });
  } catch (error) {
    console.error("Token validation error:", error);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ success: false, message: "Token expired" });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
