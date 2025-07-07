// src/routes/policyRoutes.js
import express from "express";
import {
  getAllPolicies,
  getPolicyById,
  getUserPolicies,
  getUserPoliciesForDashboard,
} from "../controllers/policyControllers.js";
const route = express.Router();

route.get("/user-policies", getUserPolicies);
route.get("/dashboard", getUserPoliciesForDashboard);
route.get("/get", getAllPolicies);
route.get("/:id", getPolicyById);
export default route;
