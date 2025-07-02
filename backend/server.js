import express from "express";
import { testDb } from "./config/db.js";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import policyRoutes from "./routes/policyRoutes.js";
import quoteRoutes from "./routes/quoteRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import satusRoutes from "./routes/statusRoutes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

//middelwares
app.use(express.json());

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:8080", // your frontend URL
    credentials: true, // 🔐 this is required for cookies to be sent
  })
);
//helemt is a security middelware that helps you protect your app by setting various Http headers
app.use(helmet());
//log the request
app.use(morgan("dev"));
//used to parse the cookie from the request
app.use(cookieParser());
//endpoints
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/vehicle", vehicleRoutes);
app.use("/api/policy", policyRoutes);
app.use("/api/quote", quoteRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/status", satusRoutes);
app.listen(PORT, () => {
  testDb();
  console.log("server running on port " + PORT);
});
