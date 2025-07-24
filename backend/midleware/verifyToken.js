import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const verifyToken = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        role: true,
        isVerified: true,
        // isActive: true,
        // lockedUntil: true,
      },
    });

    // Check account status
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Account not found",
      });
    }

    // if (!user.isActive) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Account deactivated",
    //   });
    // }

    // if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Account temporarily locked",
    //   });
    // }

    // Attach user to request
    req.user = {
      id: user.id,
      role: user.role,
      isVerified: user.isVerified,
      email: decoded.email,
    };

    next();
  } catch (error) {
    let message = "Authentication failed";
    let status = 401;

    if (error instanceof jwt.TokenExpiredError) {
      message = "Session expired - Please login again";
    } else if (error instanceof jwt.JsonWebTokenError) {
      message = "Invalid token";
    } else {
      console.error("Auth Error:", error);
      status = 500;
      message = "Internal server error";
    }

    return res.status(status).json({ success: false, message });
  }
};
