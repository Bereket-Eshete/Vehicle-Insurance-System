import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const [
      activePolicies,
      registeredVehicles,
      claimsInProgress,
      recentPayment,
    ] = await Promise.all([
      prisma.policy.count({
        where: {
          customerId: userId,
          status: "active",
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
          status: "pending",
        },
      }),
      prisma.payment.findFirst({
        where: {
          customerId: userId,
          status: "completed",
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
      success: true,
      data: {
        activePolicies,
        registeredVehicles,
        claimsInProgress,
        recentPaymentAmount: recentPayment?.amount || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const getStats = async (req, res) => {
  try {
    // Fetch total users
    const totalUsers = await prisma.user.count();

    // Fetch active policies
    const activePolicies = await prisma.policy.count({
      where: { status: "active" },
    });

    // Fetch registered vehicles
    const registeredVehicles = await prisma.vehicle.count();

    // Fetch monthly revenue
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const monthlyRevenue = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        date: { gte: currentMonthStart },
      },
    });

    // Format the response
    const statsData = {
      totalUsers: {
        title: "Total Users",
        value: totalUsers.toString(),
        change: "+12%",
        trend: "up",
        icon: "Users",
        color: "bg-primary",
        sparkline: [40, 45, 42, 48, 52, 49, 55], // Mock sparkline data
      },
      activePolicies: {
        title: "Active Policies",
        value: activePolicies.toString(),
        change: "+8%",
        trend: "up",
        icon: "FileText",
        color: "bg-green-500",
        sparkline: [30, 35, 38, 40, 45, 48, 50], // Mock sparkline data
      },
      registeredVehicles: {
        title: "Registered Vehicles",
        value: registeredVehicles.toString(),
        change: "+15%",
        trend: "up",
        icon: "Car",
        color: "bg-purple-500",
        sparkline: [25, 28, 32, 35, 38, 42, 45], // Mock sparkline data
      },
      monthlyRevenue: {
        title: "Monthly Revenue",
        value: `$${monthlyRevenue._sum.amount?.toFixed(2) || "0.00"}`,
        change: "+23%",
        trend: "up",
        icon: "DollarSign",
        color: "bg-yellow-500",
        sparkline: [20, 25, 30, 28, 35, 40, 45], // Mock sparkline data
      },
    };

    res.status(200).json(statsData);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
