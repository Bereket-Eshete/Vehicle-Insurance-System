import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createClaimNotification = async ({
  claimId,
  claimType,
  userName,
}) => {
  try {
    await prisma.notification.create({
      data: {
        title: "New Claim Submitted",
        message: `New ${claimType} claim by ${userName}`,
        type: "claim",
        status: "unread",
        claimId,
      },
    });
    return true;
  } catch (error) {
    console.error("Error creating claim notification:", error);
    return false;
  }
};

export const getAdminNotifications = async () => {
  try {
    return await prisma.notification.findMany({
      where: { type: "claim" },
      orderBy: { sentDate: "desc" },
      include: { claim: true },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

export const getUnreadNotificationCount = async () => {
  try {
    return await prisma.notification.count({
      where: {
        type: "claim",
        status: "unread",
      },
    });
  } catch (error) {
    console.error("Error getting notification count:", error);
    return 0;
  }
};

export const markNotificationsAsRead = async () => {
  try {
    await prisma.notification.updateMany({
      where: {
        type: "claim",
        status: "unread",
      },
      data: { status: "read" },
    });
    return true;
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return false;
  }
};
