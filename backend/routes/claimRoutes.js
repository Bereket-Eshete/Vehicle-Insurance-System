import express from "express";
import { createClaim, getUserClaims } from "../controllers/claimController.js";

const router = express.Router();
router.get("/getuserclaim", getUserClaims);
router.post("/create", createClaim);

export default router;
