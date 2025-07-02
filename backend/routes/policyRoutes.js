// src/routes/policyRoutes.js
import express from "express";
import {
  getAllPolicies,
  getPolicyById,
  getCustomerPolicies,
  getAllPoliciesWithCustomers,
} from "../controllers/policyControllers.js";
const route = express.Router();

route.get("/get", getAllPolicies);
route.get("/:id", getPolicyById);
route.get("/user-policies", getCustomerPolicies);
route.get("/all-with-customers", getAllPoliciesWithCustomers);
export default route;
