// import jwt from "jsonwebtoken";

// export const generateTokenAndSetCookie = (res, user) => {
//   const tokenPayload = {
//     userId: user.id,
//     role: user.role,
//     isVerified: user.isVerified,
//     email: user.email, // For potential email-based operations
//   };

//   const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
//     expiresIn: "7d",
//     issuer: "your-insurance-app", // Good practice for JWT
//   });

//   res.cookie("token", token, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "Lax", // Changed from strict for better cross-site compatibility
//     path: "/",
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//     domain: process.env.COOKIE_DOMAIN || undefined, // For production
//   });

//   return token;
// };
import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, user) => {
  if (!user?.id) {
    throw new Error("User ID is required for token generation");
  }

  const tokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    iss: "your-insurance-app",
    iat: Math.floor(Date.now() / 1000),
  };

  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // Set cookie with secure options
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    domain: process.env.COOKIE_DOMAIN || undefined,
  });

  return token;
};
