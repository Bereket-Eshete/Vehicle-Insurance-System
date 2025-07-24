import express from "express";
import { verifyToken } from "../midleware/verifyToken.js";
import { verifyAdmin } from "../midleware/verifyAdmin.js";
import {
  getMyVehicle,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleWithoutPolicy,
  getVehicleDetails,
  fetchUserVehicle,
} from "../controllers/vehicleController.js";

const route = express.Router();
route.get("/user-vehicles", fetchUserVehicle);
route.post("/addvehicle", verifyToken, addVehicle);
route.get("/getvehicle", verifyToken, getMyVehicle);
route.put("/updatevehicle/:id", verifyToken, verifyAdmin, updateVehicle);
route.delete("/deletevehicle/:id", verifyToken, verifyAdmin, deleteVehicle);
route.get("/withoutpolicy", verifyToken, verifyAdmin, getVehicleWithoutPolicy);
route.get("/details/:id", verifyToken, getVehicleDetails);

export default route;
