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
// controllers/policyController.ts
export const getCustomerPolicies = async (req, res) => {
  try {
    const { userId } = req.query;

    console.log("Received request for userId:", userId); // Debug log

    if (!userId || typeof userId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Valid user ID is required",
      });
    }

    // Debug: Log the exact query we'll make to Prisma
    console.log(`Querying policies for userId: ${userId}`);

    const policies = await prisma.policy.findMany({
      where: {
        customerId: userId, // Ensure this matches your DB column exactly
      },
      include: {
        vehicle: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(`Found ${policies.length} policies`); // Debug log

    return res.status(200).json({
      success: true,
      data: policies.map((policy) => ({
        ...policy,
        startDate: policy.startDate.toISOString(),
        endDate: policy.endDate.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch policies",
    });
  }
};
// controllers/policyController.ts
export const getAllPoliciesWithCustomers = async (req, res) => {
  try {
    console.log("Fetching all policies with customerId");

    const policies = await prisma.policy.findMany({
      where: {
        customerId: {
          not: null, // Only policies with customerId
          not: "", // And not empty string
        },
      },
      include: {
        vehicle: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });

    console.log(`Found ${policies.length} policies with customers`);

    return res.status(200).json({
      success: true,
      data: policies.map((policy) => ({
        ...policy,
        startDate: policy.startDate.toISOString(),
        endDate: policy.endDate.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch policies",
    });
  }
};
