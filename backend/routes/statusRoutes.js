// routes/statsRoutes.ts
import express from "express";
import { getDashboardStats } from "../controllers/statusControllers.js";
import { authMiddleware } from "../midleware/authmidleware.js";

const router = express.Router();

router.get("/dashboard-stats", authMiddleware, getDashboardStats);

export default router;
