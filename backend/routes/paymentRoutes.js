import express from "express";
const router = express.Router();
import {
  processPayment,
  getPaymentHistory,
  getPaymentReceipt,
} from "../controllers/paymentControllers.js";
import { authMiddleware } from "../midleware/authmidleware.js";

// Process payment
router.post("/process", authMiddleware, processPayment);

// Get payment history
router.get("/history", authMiddleware, getPaymentHistory);

// Get payment receipt
router.get("/receipt/:paymentId", authMiddleware, getPaymentReceipt);
// routes/policyRoutes.ts

export default router;
