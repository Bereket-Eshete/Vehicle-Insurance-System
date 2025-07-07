// src/controllers/policyController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
// const userId = "71ce959c-cf1a-47bd-9455-ea7bc3c5a783";
export const getAllPolicies = async (req, res) => {
  try {
    // Only get policies that don't have a customer assigned (public/available policies)
    const policies = await prisma.policy.findMany({
      where: {
        customerId: null, // This filters for only public/available policies
      },
      select: {
        id: true,
        name: true,
        type: true,
        premiumAmount: true,
        coverageDetails: true,
        features: true,
        vehicleType: true,
        // Include customerId to verify our filter is working
        customerId: true,
      },
      orderBy: {
        name: "asc", // Optional: sort by policy name
      },
    });

    // Optional: Log the count for debugging
    console.log(`Found ${policies.length} public policies`);

    // Parse the 'features' field if it's stored as JSON
    const parsedPolicies = policies.map((policy) => ({
      ...policy,
      features: policy.features || [], // Default to empty array if null
      // You might want to remove customerId from the final response
      // since it will always be null for these results
      customerId: undefined,
    }));

    res.status(200).json({
      success: true,
      count: policies.length,
      data: parsedPolicies,
    });
  } catch (error) {
    console.error("Error fetching public policies:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve available policies",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// Fetch a specific policy by ID
export const getPolicyById = async (req, res) => {
  const { id } = req.params;
  try {
    const policy = await prisma.policy.findUnique({
      where: { id },
    });

    if (!policy) {
      return res
        .status(404)
        .json({ success: false, message: "Policy not found" });
    }

    // Parse JSON fields if needed
    const parsedPolicy = {
      ...policy,
      features: policy.features || [],
      premiumBreakdown: policy.premiumBreakdown || {},
    };

    res.status(200).json({ success: true, data: parsedPolicy });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// controllers/policyController.ts

export const getCustomerPolicies = async (req, res) => {
  try {
    // Extract customerId from the request query
    // const { customerId } = req.query;

    // // Validate customerId
    // if (!customerId || typeof customerId !== "string") {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Valid customerId is required as a query parameter",
    //   });
    // }

    // Fetch policies associated with the specific customerId
    const policies = await prisma.policy.findMany({
      where: {
        customerId: "71ce959c-cf1a-47bd-9455-ea7bc3c5a783", // Filter for policies belonging to this
      },
      select: {
        id: true,
        name: true,
        type: true,
        premiumAmount: true,
        coverageDetails: true,
        features: true,
        vehicleType: true,
        startDate: true,
        endDate: true,
        vehicle: {
          select: {
            name: true, // Include vehicle details if needed
          },
        },
      },
      orderBy: {
        startDate: "asc", // Optional: sort by policy start date
      },
    });

    // Optional: Log the count for debugging
    console.log(
      `Found ${policies.length} policies for customerId: ${customerId}`
    );

    // Parse the 'features' field if it's stored as JSON
    const parsedPolicies = policies.map((policy) => ({
      ...policy,
      features: policy.features || [], // Default to empty array if null
    }));

    // Return the policies
    res.status(200).json({
      success: true,
      count: policies.length,
      parsedPolicies,
    });
  } catch (error) {
    console.error("Error fetching customer policies:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve customer policies",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
export const getUserPolicies = async (req, res) => {
  try {
    const { userId } = req.query;
    console.log("🔥 Reached getUserPolicies route");
    console.log("User ID from query:", userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const policies = await prisma.policy.findMany({
      where: {
        customerId: userId,
      },
      include: {
        vehicle: {
          select: {
            id: true,
            name: true,
            model: true,
            brand: true,
            year: true,
            vin: true,
          },
        },
        payments: {
          orderBy: {
            date: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        endDate: "asc",
      },
    });

    if (!policies || policies.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No policies found for this user",
      });
    }

    const formattedPolicies = policies.map((policy) => ({
      id: policy.id,
      policyNumber: policy.id,
      name: policy.name,
      type: policy.type,
      startDate: policy.startDate.toISOString(),
      endDate: policy.endDate.toISOString(),
      premiumAmount: policy.premiumAmount,
      coverageDetails: policy.coverageDetails,
      status: policy.status,
      vehicle: policy.vehicle
        ? {
            name: `${policy.vehicle.brand} ${policy.vehicle.model}`,
            model: policy.vehicle.model,
            brand: policy.vehicle.brand,
            year: policy.vehicle.year,
            vin: policy.vehicle.vin,
          }
        : null,
      lastPayment: policy.payments[0]
        ? {
            date: policy.payments[0].date.toISOString(),
            amount: policy.payments[0].amount,
          }
        : null,
    }));

    return res.status(200).json({
      success: true,
      data: formattedPolicies,
    });
  } catch (error) {
    console.error("Error fetching user policies:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// controllers/policyController.ts
// controllers/policyController.js
export const getUserPoliciesForDashboard = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const policies = await prisma.policy.findMany({
      where: { customerId: userId },
      include: {
        vehicle: true,
        payments: {
          orderBy: { date: "desc" },
          take: 1,
        },
      },
      orderBy: { endDate: "asc" },
    });

    const formattedPolicies = policies.map((policy) => {
      // Safely parse coverageDetails
      let coverageDetails = {};
      try {
        coverageDetails = policy.coverageDetails
          ? JSON.parse(policy.coverageDetails)
          : {};
      } catch (error) {
        console.error(
          `Error parsing coverageDetails for policy ${policy.id}:`,
          error
        );
        // Fallback to plain text if not valid JSON
        coverageDetails = {
          description: policy.coverageDetails,
        };
      }

      return {
        id: policy.id,
        name: policy.name,
        type: policy.type,
        startDate: policy.startDate.toISOString(),
        endDate: policy.endDate.toISOString(),
        premiumAmount: policy.premiumAmount,
        status: policy.status,
        vehicle: policy.vehicle
          ? {
              name: `${policy.vehicle.brand} ${policy.vehicle.model}`,
              model: policy.vehicle.model,
              brand: policy.vehicle.brand,
              year: policy.vehicle.year,
              vin: policy.vehicle.vin,
            }
          : null,
        coverageDetails, // Use the safely parsed version
        lastPayment: policy.payments[0]
          ? {
              amount: policy.payments[0].amount,
              date: policy.payments[0].date.toISOString(),
            }
          : null,
        vehicleId: policy.vehicleId,
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedPolicies,
    });
  } catch (error) {
    console.error("Error fetching policies:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
