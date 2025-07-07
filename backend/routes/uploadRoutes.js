// routes/uploadRoutes.js
import express from "express";
import { uploadFiles } from "../controllers/uploadController.js";
import multer from "multer";

const router = express.Router();
const upload = multer();

router.post("/", upload.array("files"), uploadFiles);

export default router;
