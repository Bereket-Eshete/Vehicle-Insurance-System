import express from "express";
import {
  getAdminNotifications,
  getUnreadNotificationCount,
  markNotificationsAsRead,
} from "../service/notificationService.js";

const router = express.Router();

// Get all claim notifications
router.get("/", async (req, res) => {
  try {
    const notifications = await getAdminNotifications();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Failed to get notifications" });
  }
});

// Get unread notification count
router.get("/count", async (req, res) => {
  try {
    const count = await getUnreadNotificationCount();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: "Failed to get count" });
  }
});

// Mark all as read
router.put("/mark-as-read", async (req, res) => {
  try {
    await markNotificationsAsRead();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

export default router;
