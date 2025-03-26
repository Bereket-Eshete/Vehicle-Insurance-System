import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import helloBackendRoutes from "./routes/helloBackendRoutes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

//middelwares
app.use(express.json());
app.use(cors());
//helemt is a security middelware that helps you protect your app by setting various Http headers
app.use(helmet());
app.use(morgan("dev")); //log the request

app.use("/api/hello", helloBackendRoutes);
app.listen(PORT, () => {
  console.log("server runnimg on port " + PORT);
});
