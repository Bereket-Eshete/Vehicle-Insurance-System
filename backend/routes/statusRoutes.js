import express from "express";
import {
  getDashboardStats,
  getStats,
} from "../controllers/statusControllers.js";

const router = express.Router();

router.get("/dashboard-stats", getDashboardStats);
router.get("/stats", getStats);

export default router;
