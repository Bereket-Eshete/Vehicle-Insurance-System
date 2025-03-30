import express from "express";
import { testDb } from "./config/db.js";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

//middelwares
app.use(express.json());
app.use(cors());
//helemt is a security middelware that helps you protect your app by setting various Http headers
app.use(helmet());
app.use(morgan("dev")); //log the request

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  testDb();
  console.log("server running on port " + PORT);
});
