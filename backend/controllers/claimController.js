import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// POST /api/claims

import { generateClaimId } from "../utils/idGenerator.js"; // Import your ID generator

// POST /api/claims
// export const createClaim = async (req, res) => {
//   try {
//     const {
//       type,
//       incidentDate,
//       incidentTime,
//       location,
//       description,
//       policyId,
//       currentMileage,
//       usePreferredShop,
//       customShopName,
//       customShopAddress,
//       contactPhone,
//       contactEmail,
//       supportingDocuments,
//     } = req.body;

//     // Validate required fields
//     if (
//       !type ||
//       !incidentDate ||
//       !incidentTime ||
//       !location ||
//       !description ||
//       !policyId
//     ) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields",
//       });
//     }

//     // Verify the policy exists and belongs to the user
//     const policy = await prisma.policy.findUnique({
//       where: { id: policyId },
//       include: { vehicle: true, customer: true },
//     });

//     if (!policy) {
//       return res.status(404).json({
//         success: false,
//         message: "Policy not found",
//       });
//     }

//     if (policy.customerId !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message: "You are not authorized to file a claim for this policy",
//       });
//     }

//     // Generate a unique claim ID
//     const claimId = generateClaimId();

//     // Create the claim in the database
//     const newClaim = await prisma.claim.create({
//       data: {
//         id: claimId, // Assign the generated claim ID
//         type,
//         status: "pending", // Default status for new claims
//         supportingDocument: supportingDocuments?.join(", "), // Store document names as a comma-separated string
//         date: new Date(`${incidentDate}T${incidentTime}:00Z`), // Combine date and time
//         reason: description,
//         amount: 0, // Placeholder amount (can be updated later)
//         customerId: req.user.id,
//         vehicleId: policy.vehicleId,
//         policyId: policy.id,
//         details: {
//           currentMileage,
//           usePreferredShop,
//           customShopName,
//           customShopAddress,
//           contactPhone,
//           contactEmail,
//         },
//       },
//     });

//     res.status(201).json({
//       success: true,
//       message: "Claim submitted successfully",
//       claim: newClaim,
//     });
//   } catch (error) {
//     console.error("Error creating claim:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to submit claim",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

export const createClaim = async (req, res) => {
  try {
    const {
      type,
      incidentDate,
      incidentTime,
      location,
      description,
      policyId,
      currentMileage,
      usePreferredShop,
      customShopName,
      customShopAddress,
      contactPhone,
      contactEmail,
      supportingDocuments,
      userId, // Get userId from request body
    } = req.body;

    // Validate required fields
    if (
      !type ||
      !incidentDate ||
      !incidentTime ||
      !location ||
      !description ||
      !policyId ||
      !userId // Add userId to required fields
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Verify the policy exists and belongs to the user
    const policy = await prisma.policy.findUnique({
      where: { id: policyId },
      include: { vehicle: true },
    });

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "Policy not found",
      });
    }

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if policy belongs to user (optional but recommended)
    if (policy.customerId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to file a claim for this policy",
      });
    }

    // Generate a unique claim ID
    const claimId = generateClaimId();

    // Create the claim
    const newClaim = await prisma.claim.create({
      data: {
        id: claimId,
        type,
        status: "pending",
        supportingDocument: supportingDocuments?.join(", ") || "",
        date: new Date(`${incidentDate}T${incidentTime}:00Z`),
        reason: description,
        amount: 0,
        customerId: userId, // Use the userId from request
        vehicleId: policy.vehicleId,
        policyId: policy.id,
        details: {
          currentMileage: currentMileage || "",
          usePreferredShop: Boolean(usePreferredShop),
          customShopName: customShopName || "",
          customShopAddress: customShopAddress || "",
          contactPhone: contactPhone || "",
          contactEmail: contactEmail || "",
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Claim submitted successfully",
      claim: newClaim,
    });
  } catch (error) {
    console.error("Error creating claim:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit claim",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
// controllers/claimController.ts

export const getUserClaims = async (req, res) => {
  try {
    // Get userId from query params instead of req.user
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const claims = await prisma.claim.findMany({
      where: { customerId: userId },
      include: {
        vehicle: true,
        policy: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    // Format the claims data to match your frontend structure
    const formattedClaims = claims.map((claim) => ({
      id: claim.id,
      policyId: claim.policyId,
      vehicle: claim.vehicle?.name || "Unknown Vehicle",
      claimType: claim.type,
      date: claim.date.toISOString().split("T")[0],
      amount: `$${claim.amount.toFixed(2)}`,
      status: claim.status.toLowerCase(),
      description: claim.reason,
      timeline: getClaimTimeline(claim),
    }));

    res.status(200).json({
      success: true,
      claims: formattedClaims,
    });
  } catch (error) {
    console.error("Error fetching claims:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch claims",
    });
  }
};

// Helper function to generate timeline based on claim status
function getClaimTimeline(claim) {
  const baseTimeline = [
    {
      date: claim.date.toISOString().split("T")[0],
      status: "Claim submitted",
      details: "Initial claim filed",
      completed: true,
    },
  ];

  switch (claim.status.toLowerCase()) {
    case "pending":
      return baseTimeline;
    case "processing":
      return [
        ...baseTimeline,
        {
          date: new Date(claim.date).toISOString().split("T")[0],
          status: "Under review",
          details: "Claim assigned to adjuster",
          completed: true,
        },
      ];
    case "approved":
      return [
        ...baseTimeline,
        {
          date: new Date(claim.date).toISOString().split("T")[0],
          status: "Under review",
          details: "Claim assigned to adjuster",
          completed: true,
        },
        {
          date: new Date(claim.date).toISOString().split("T")[0],
          status: "Approved",
          details: "Claim approved for processing",
          completed: true,
        },
      ];
    case "paid":
      return [
        ...baseTimeline,
        {
          date: new Date(claim.date).toISOString().split("T")[0],
          status: "Under review",
          details: "Claim assigned to adjuster",
          completed: true,
        },
        {
          date: new Date(claim.date).toISOString().split("T")[0],
          status: "Approved",
          details: "Claim approved for processing",
          completed: true,
        },
        {
          date: new Date(claim.date).toISOString().split("T")[0],
          status: "Paid",
          details: "Payment processed",
          completed: true,
        },
      ];
    case "denied":
      return [
        ...baseTimeline,
        {
          date: new Date(claim.date).toISOString().split("T")[0],
          status: "Under review",
          details: "Claim assigned to adjuster",
          completed: true,
        },
        {
          date: new Date(claim.date).toISOString().split("T")[0],
          status: "Denied",
          details: claim.details?.denialReason || "Claim denied",
          completed: true,
        },
      ];
    default:
      return baseTimeline;
  }
}
