// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from cookies instead of headers
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Authentication required. Please log in.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });

    if (!user) {
      // Clear invalid token
      res.clearCookie("token");
      return res.status(401).json({
        message: "Your session is invalid. Please log in again.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    // Clear invalid token
    res.clearCookie("token");

    let message = "Authentication failed";
    if (error.name === "TokenExpiredError") {
      message = "Your session has expired. Please log in again.";
    } else if (error.name === "JsonWebTokenError") {
      message = "Invalid authentication token.";
    }

    res.status(401).json({
      message,
      error: error.message,
    });
  }
};
