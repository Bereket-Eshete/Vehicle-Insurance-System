import express from "express";
import { verifyToken } from "../midleware/verifyToken.js";
import {
  updateProfile,
  getMyProfile,
  getAllCustomers,
  getUserDashboardData,
  updateAdminProfile,
  getAdminProfile,
  getUsers,
  updateUser,
  createUser,
  deleteUser,
} from "../controllers/userControllers.js";
import { verifyAdmin } from "../midleware/verifyAdmin.js";
const route = express.Router();
route.put("/update/:id", updateUser);
route.put("/updateprofile", verifyToken, updateProfile);
route.put("/admin/profile", updateAdminProfile);

route.get("/getmyprofile", getMyProfile);
route.get("/getAllCustomer", verifyToken, verifyAdmin, getAllCustomers);
route.get("/getdata", verifyToken, getUserDashboardData);
route.get("/admin/profile", getAdminProfile);

route.get("/getUser", getUsers);
route.delete("/delete/:id", deleteUser);

route.post("/create", createUser);
export default route;
