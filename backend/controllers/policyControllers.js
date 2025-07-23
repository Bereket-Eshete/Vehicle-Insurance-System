// src/controllers/policyController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { getPolicyDocumentUrl } from "../service/policyDocumentService.js";
import fs from "fs";
import path from "path";
// const userId = "71ce959c-cf1a-47bd-9455-ea7bc3c5a783";
export const getAllPoliciess = async (req, res) => {
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
export const downloadPolicyDocument = async (req, res) => {
  try {
    const { policyId } = req.params;

    // Verify policy exists and user has access
    const policy = await prisma.policy.findFirst({
      where: { id: policyId, customerId: req.user.id },
      include: { user: true, vehicle: true },
    });

    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }

    // Generate or get the PDF
    const pdfBuffer = await generatePolicyPDF(
      policy,
      policy.user,
      policy.vehicle
    );

    // Set headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", pdfBuffer.length);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="policy_${policyId}.pdf"`
    );
    res.setHeader("Content-Transfer-Encoding", "binary");

    // Send the PDF
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF serve error:", error);
    res.status(500).json({ error: "Failed to generate PDF document" });
  }
};
// Get all policies for admin dashboard
export const getAllPolicies = async (req, res) => {
  try {
    const policies = await prisma.policy.findMany({
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            model: true,
            brand: true,
            year: true,
            vin: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });

    const formattedPolicies = policies.map((policy) => {
      // Format customer name
      const customerName = policy.customer
        ? `${policy.customer.firstName || ""} ${policy.customer.lastName || ""}`.trim()
        : "No customer assigned";

      // Format vehicle information
      const vehicleModel = policy.vehicle
        ? `${policy.vehicle.brand || ""} ${policy.vehicle.model || ""} ${policy.vehicle.year || ""}`.trim()
        : "No vehicle assigned";

      return {
        id: policy.id,
        policyName: policy.name,
        customerName: customerName,
        customerEmail: policy.customer?.email || "",
        vehicleModel: vehicleModel,
        vin: policy.vehicle?.vin || "N/A", // Using VIN instead of license plate
        coverage: `$${policy.coverageAmount?.toLocaleString() || "0"}`,
        premium: `$${policy.premiumAmount?.toLocaleString() || "0"}/year`,
        status: policy.status || "Unknown",
        startDate: policy.startDate?.toISOString().split("T")[0] || "N/A",
        endDate: policy.endDate?.toISOString().split("T")[0] || "N/A",
        documentUrl: policy.documentUrl || null,
        customerId: policy.customer?.id || null,
        vehicleId: policy.vehicle?.id || null,
      };
    });

    res.json({
      success: true,
      data: formattedPolicies,
      count: policies.length,
    });
  } catch (error) {
    console.error("Error fetching policies:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch policies",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// Create new policy (admin)
export const createPolicy = async (req, res) => {
  try {
    const {
      name,
      type,
      premiumAmount,
      coverageAmount,
      status,
      startDate,
      endDate,
      customerId,
      vehicleId,
      coverageDetails,
      termsAndConditions,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !type ||
      !premiumAmount ||
      !coverageAmount ||
      !status ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const newPolicy = await prisma.policy.create({
      data: {
        name,
        type,
        premiumAmount: parseFloat(premiumAmount),
        coverageAmount: parseFloat(coverageAmount),
        status,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        coverageDetails: coverageDetails || "",
        termsAndConditions: termsAndConditions || "",
        customerId: customerId || null,
        vehicleId: vehicleId || null,
      },
    });

    res.status(201).json({
      success: true,
      data: newPolicy,
      message: "Policy created successfully",
    });
  } catch (error) {
    console.error("Error creating policy:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create policy",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update policy (admin)
export const updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      status,
      startDate,
      endDate,
      premiumAmount,
      coverageAmount,
      customerId,
      vehicleId,
    } = req.body;

    // Check if policy exists
    const existingPolicy = await prisma.policy.findUnique({
      where: { id },
    });

    if (!existingPolicy) {
      return res.status(404).json({
        success: false,
        message: "Policy not found",
      });
    }

    const updatedPolicy = await prisma.policy.update({
      where: { id },
      data: {
        name: name || existingPolicy.name,
        status: status || existingPolicy.status,
        startDate: startDate ? new Date(startDate) : existingPolicy.startDate,
        endDate: endDate ? new Date(endDate) : existingPolicy.endDate,
        premiumAmount: premiumAmount
          ? parseFloat(premiumAmount)
          : existingPolicy.premiumAmount,
        coverageAmount: coverageAmount
          ? parseFloat(coverageAmount)
          : existingPolicy.coverageAmount,
        customerId:
          customerId !== undefined ? customerId : existingPolicy.customerId,
        vehicleId:
          vehicleId !== undefined ? vehicleId : existingPolicy.vehicleId,
      },
    });

    res.json({
      success: true,
      data: updatedPolicy,
      message: "Policy updated successfully",
    });
  } catch (error) {
    console.error("Error updating policy:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update policy",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete policy (admin)
export const deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if policy exists
    const existingPolicy = await prisma.policy.findUnique({
      where: { id },
    });

    if (!existingPolicy) {
      return res.status(404).json({
        success: false,
        message: "Policy not found",
      });
    }

    await prisma.policy.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Policy deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting policy:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete policy",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get policy by ID for admin
// export const getPolicyById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const policy = await prisma.policy.findUnique({
//       where: { id },
//       include: {
//         customer: {
//           select: {
//             id: true,
//             firstName: true,
//             lastName: true,
//             email: true,
//           },
//         },
//         vehicle: {
//           select: {
//             id: true,
//             model: true,
//             brand: true,
//             year: true,
//             licensePlate: true,
//           },
//         },
//       },
//     });

//     if (!policy) {
//       return res.status(404).json({
//         success: false,
//         message: "Policy not found",
//       });
//     }

//     const formattedPolicy = {
//       id: policy.id,
//       name: policy.name,
//       type: policy.type,
//       premiumAmount: policy.premiumAmount,
//       coverageAmount: policy.coverageAmount,
//       status: policy.status,
//       startDate: policy.startDate.toISOString().split("T")[0],
//       endDate: policy.endDate.toISOString().split("T")[0],
//       coverageDetails: policy.coverageDetails,
//       termsAndConditions: policy.termsAndConditions,
//       documentUrl: policy.documentUrl,
//       customer: policy.customer
//         ? {
//             id: policy.customer.id,
//             name: `${policy.customer.firstName || ""} ${policy.customer.lastName || ""}`.trim(),
//             email: policy.customer.email,
//           }
//         : null,
//       vehicle: policy.vehicle
//         ? {
//             id: policy.vehicle.id,
//             model: `${policy.vehicle.brand || ""} ${policy.vehicle.model || ""} ${policy.vehicle.year || ""}`.trim(),
//             licensePlate: policy.vehicle.licensePlate,
//           }
//         : null,
//     };

//     res.json({
//       success: true,
//       data: formattedPolicy,
//     });
//   } catch (error) {
//     console.error("Error fetching policy:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch policy",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };
