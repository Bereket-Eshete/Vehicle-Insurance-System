import express from "express";
import { verifyToken } from "../midleware/verifyToken.js";
import {
  updateProfile,
  getMyProfile,
  getAllCustomers,
  getUserDashboardData,
} from "../controllers/userControllers.js";
import { verifyAdmin } from "../midleware/verifyAdmin.js";
const route = express.Router();

route.put("/updateprofile", verifyToken, updateProfile);
route.get("/getmyprofile", getMyProfile);
route.get("/getAllCustomer", verifyToken, verifyAdmin, getAllCustomers);
route.get("/getdata", verifyToken, getUserDashboardData);
export default route;
