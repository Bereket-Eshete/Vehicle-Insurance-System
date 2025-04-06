import express from "express";
import { verifyToken } from "../midleware/verifyToken.js";
import { updateProfile, getMyProfile } from "../controllers/userControllers.js";
const route = express.Router();

route.put("/updateprofile", verifyToken, updateProfile);
route.get("/getmyprofile", verifyToken, getMyProfile);
export default route;
