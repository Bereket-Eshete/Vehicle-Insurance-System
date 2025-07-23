// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from cookies or Authorization header
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Make sure we have the userId in the decoded token
    if (!decoded.userId) {
      throw new Error("Invalid token payload");
    }

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
      res.clearCookie("token");
      return res.status(401).json({
        success: false,
        message: "User not found. Please log in again.",
      });
    }

    // Attach the full user object to the request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    next();
  } catch (error) {
    res.clearCookie("token");

    let message = "Authentication failed";
    if (error.name === "TokenExpiredError") {
      message = "Your session has expired. Please log in again.";
    } else if (error.name === "JsonWebTokenError") {
      message = "Invalid authentication token.";
    }

    res.status(401).json({
      success: false,
      message,
      error: error.message,
    });
  }
};
