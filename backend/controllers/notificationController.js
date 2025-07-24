import express from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Get unread notifications count for admin
export const getNotification = async (req, res) => {
  try {
    const adminId = req.query.userId; // Assuming you have authentication middleware
    const count = await prisma.notification.count({
      where: {
        customerId: adminId,
        status: "unread",
      },
    });
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch notifications count" });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        customerId: userId,
      },
      orderBy: {
        sentDate: "desc",
      },
    });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

export const getNotificationCount = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const count = await prisma.notification.count({
      where: {
        customerId: userId,
        status: "unread",
      },
    });

    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching notification count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notification count",
    });
  }
};

export const markNotificationsAsRead = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    await prisma.notification.updateMany({
      where: {
        customerId: userId,
        status: "unread",
      },
      data: {
        status: "read",
      },
    });

    res.status(200).json({
      success: true,
      message: "Notifications marked as read",
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
    });
  }
};
