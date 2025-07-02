// controllers/statsController.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have authentication middleware

    // Fetch all stats in parallel
    const [
      activePolicies,
      registeredVehicles,
      claimsInProgress,
      recentPayments,
    ] = await Promise.all([
      prisma.policy.count({
        where: {
          customerId: userId,
          status: "ACTIVE",
        },
      }),
      prisma.vehicle.count({
        where: {
          customerId: userId,
        },
      }),
      prisma.claim.count({
        where: {
          customerId: userId,
          status: "IN_PROGRESS",
        },
      }),
      prisma.payment.findFirst({
        where: {
          customerId: userId,
          status: "COMPLETED",
        },
        orderBy: {
          date: "desc",
        },
        select: {
          amount: true,
        },
      }),
    ]);

    res.json({
      activePolicies,
      registeredVehicles,
      claimsInProgress,
      recentPaymentAmount: recentPayments?.amount || 0,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Error fetching dashboard statistics" });
  }
};
