import express from "express";
import {
  Signup,
  verifyEmail,
  Login,
  Logout,
  resendCode,
  resetPassword,
  forgetPassword,
} from "../controllers/authController.js";
const route = express.Router();

route.post("/signup", Signup);
route.post("/verifyemail", verifyEmail);
route.post("/resendcode", resendCode);
route.post("/login", Login);
route.post("/logout", Logout);
route.post("/forgetpassword", forgetPassword);
route.post("/resetpassword", resetPassword);
export default route;
