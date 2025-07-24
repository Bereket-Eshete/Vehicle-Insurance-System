// import express from "express";
// import {
//   Signup,
//   verifyEmail,
//   Login,
//   Logout,
//   resendCode,
//   resetPassword,
//   forgetPassword,
//   validateToken,
// } from "../controllers/authController.js";
// const route = express.Router();

// route.post("/signup", Signup);
// route.get("/verifyemail", verifyEmail);
// route.post("/resend-code", resendCode);
// route.post("/login", Login);
// route.post("/logout", Logout);
// route.post("/forget-password", forgetPassword);
// route.post("/reset-password", resetPassword);
// route.get("/validate", validateToken);
// export default route;

import express from "express";
import {
  Signup,
  verifyEmail,
  Login,
  Logout,
  resendCode,
  resetPassword,
  forgetPassword,
  validateToken,
} from "../controllers/authController.js";

const router = express.Router();

// Public routes
router.get("/verifyemail", verifyEmail);
router.post("/signup", Signup);

router.post("/resend-code", resendCode);
router.post("/login", Login);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);

// Protected routes
router.post("/logout", Logout);
router.get("/validate", validateToken);

export default router;
