// controllers/uploadController.js
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

export const uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }

    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const urls = await Promise.all(
      req.files.map(async (file) => {
        const extension = path.extname(file.originalname);
        const filename = `${uuidv4()}${extension}`;
        const filepath = path.join(uploadDir, filename);

        await fs.promises.writeFile(filepath, file.buffer);
        return `/uploads/${filename}`;
      })
    );

    res.status(200).json({ success: true, urls });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ success: false, message: "Failed to upload files" });
  }
};
