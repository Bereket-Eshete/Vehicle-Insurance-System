import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getRecentActivity = async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Fetch data from multiple tables in parallel
    const [payments, policies, notifications, claims] = await Promise.all([
      prisma.payment.findMany({
        where: { customerId: userId },
        orderBy: { date: "desc" }, // Using 'date' field from Payment model
        take: 5,
      }),
      prisma.policy.findMany({
        where: { customerId: userId },
        orderBy: { startDate: "desc" }, // Using 'startDate' instead of createdAt
        take: 5,
      }),
      prisma.notification.findMany({
        where: { customerId: userId },
        orderBy: { sentDate: "desc" }, // Using 'sentDate' from Notification model
        take: 5,
      }),
      prisma.claim.findMany({
        where: { customerId: userId },
        orderBy: { date: "desc" }, // Using 'date' from Claim model
        take: 5,
      }),
    ]);

    // Transform data into a unified activity format
    const activities = [
      ...payments.map((payment) => ({
        id: payment.payNo,
        type: "payment",
        message: `Payment of $${payment.amount.toFixed(2)} made`,
        date: payment.date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        amount: payment.amount,
      })),
      ...policies.map((policy) => ({
        id: policy.id,
        type: "renewal",
        message: `Policy ${policy.name} ${policy.status === "ACTIVE" ? "activated" : "updated"}`,
        date: policy.startDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      })),
      ...notifications.map((notification) => ({
        id: notification.id,
        type: "notification",
        message: notification.message,
        date: notification.sentDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      })),
      ...claims.map((claim) => ({
        id: claim.id,
        type: "claim",
        message: `Claim ${claim.status === "APPROVED" ? "approved" : "submitted"}`,
        date: claim.date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      })),
    ];

    // Sort by date (newest first)
    activities.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    res.json({
      success: true,
      data: activities.slice(0, 10), // Return top 10 most recent activities
    });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
