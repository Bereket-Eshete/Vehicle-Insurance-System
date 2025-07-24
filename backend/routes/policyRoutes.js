// src/routes/policyRoutes.js
import express from "express";
import {
  getAllPoliciess,
  getPolicyById,
  getUserPolicies,
  getUserPoliciesForDashboard,
  getAllPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
  downloadPolicyDocument,
} from "../controllers/policyControllers.js";

const route = express.Router();

route.get("/user-policies", getUserPolicies);
route.get("/dashboard", getUserPoliciesForDashboard);
route.get("/get", getAllPoliciess);
// route.get("/:id", getPolicyById);
// route.get("/", getAllPolicies);
route.get("/:policyId/document", downloadPolicyDocument);

route.get("/", getAllPolicies);
route.get("/:id", getPolicyById);
route.post("/", createPolicy);
route.put("/:id", updatePolicy);
route.delete("/:id", deletePolicy);
export default route;
