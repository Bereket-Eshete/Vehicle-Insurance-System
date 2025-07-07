import express from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";

const route = express.Router();

route.get("/", getProfile);
route.put("/update", updateProfile);

export default route;
