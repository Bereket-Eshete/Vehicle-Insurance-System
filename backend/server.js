import express from "express";
import { testDb } from "./config/db.js";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

//middelwares
app.use(express.json());
app.use(cors());
//helemt is a security middelware that helps you protect your app by setting various Http headers
app.use(helmet());
//log the request
app.use(morgan("dev"));
//used to parse the cookie from the request
app.use(cookieParser());
//endpoints
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.listen(PORT, () => {
  testDb();
  console.log("server running on port " + PORT);
});
