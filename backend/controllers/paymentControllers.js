// import { PrismaClient, Prisma } from "@prisma/client";
// const prisma = new PrismaClient();
// import bcrypt from "bcryptjs";

// export const processPayment = async (req, res) => {
//   try {
//     const {
//       userId,
//       policyId,
//       quoteId,
//       amount,
//       cardholderName,
//       billingAddress,
//       city,
//       zipCode,
//       password,
//     } = req.body;

//     // Validate required fields
//     if (!userId || !amount || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields: userId, amount, or password",
//       });
//     }

//     // Validate either policyId or quoteId exists
//     if (!policyId && !quoteId) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Either policyId (for existing policy) or quoteId (for new policy) must be provided",
//       });
//     }

//     // Verify user exists
//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: {
//         id: true,
//         email: true,
//         password: true,
//         firstName: true,
//         lastName: true,
//         profile: true,
//       },
//     });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User account not found",
//       });
//     }

//     // Verify password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({
//         success: false,
//         message: "Incorrect password",
//       });
//     }

//     // Handle existing policy payment
//     if (policyId) {
//       const policy = await prisma.policy.findUnique({
//         where: { id: policyId },
//         select: {
//           id: true,
//           name: true,
//           premiumAmount: true,
//           status: true,
//           customerId: true,
//         },
//       });

//       if (!policy) {
//         return res.status(404).json({
//           success: false,
//           message: "Policy not found",
//         });
//       }

//       if (policy.customerId !== userId) {
//         return res.status(403).json({
//           success: false,
//           message: "You are not authorized to pay for this policy",
//         });
//       }

//       const payment = await prisma.payment.create({
//         data: {
//           name: `Payment for ${policy.name}`,
//           date: new Date(),
//           status: "completed",
//           method: "online",
//           type: "premium",
//           amount: parseFloat(amount),
//           reason: "Policy premium payment",
//           description: `Payment for policy ${policyId}`,
//           referenceNo: `PAY-${Date.now()}`,
//           customerId: userId,
//           policyId: policyId,
//         },
//       });

//       return res.status(200).json({
//         success: true,
//         message: "Policy payment processed successfully",
//         paymentId: payment.payNo,
//         policyId: policyId,
//       });
//     }

//     // Handle new policy from quote
//     if (quoteId) {
//       const quote = await prisma.quote.findUnique({
//         where: { id: quoteId },
//         include: {
//           vehicle: true,
//           user: {
//             select: {
//               id: true,
//               email: true,
//               firstName: true,
//               lastName: true,
//             },
//           },
//           additionalDrivers: true,
//         },
//       });

//       if (!quote) {
//         return res.status(404).json({
//           success: false,
//           message: "Quote not found",
//         });
//       }

//       if (quote.userId && quote.userId !== userId) {
//         return res.status(403).json({
//           success: false,
//           message: "You are not authorized to purchase this quote",
//         });
//       }

//       // Update or create user profile
//       const profileData = {
//         phone: quote.phone,
//         address: quote.address,
//         dateOfBirth: new Date(
//           new Date().setFullYear(new Date().getFullYear() - quote.age)
//         ),
//         country: "Ethiopia", // Default as per your schema
//         city: city || undefined,
//         subCity: undefined, // Can be added if available
//         gender: undefined, // Can be added if available
//       };

//       await prisma.profile.upsert({
//         where: { userId },
//         update: profileData,
//         create: {
//           ...profileData,
//           userId,
//         },
//       });
//       const purchaseDate = quote.purchaseDate
//         ? new Date(quote.purchaseDate)
//         : new Date(new Date().setFullYear(new Date().getFullYear() - 1)); // Default to 1 year ago if not provided
//       // Create or update vehicle
//       let vehicle;
//       if (quote.vehicleId) {
//         // Update existing vehicle
//         vehicle = await prisma.vehicle.update({
//           where: { id: quote.vehicleId },
//           data: {
//             name: `${quote.vehicleMake} ${quote.vehicleModel}`,
//             model: quote.vehicleModel,
//             brand: quote.vehicleMake,
//             year: quote.vehicleYear,
//             vin: quote.vehicleVin || undefined,
//             status: "active",
//             fuelType: undefined, // Can be added if available
//             vehicleType: quote.vehicleType,
//             marketValue: quote.estimatedValue || undefined,
//             odometerReading: quote.odometerReading || undefined,
//             color: undefined, // Can be added if available
//             purchaseDate: undefined, // Can be added if available
//             isCommercial: quote.vehicleUsage === "commercial",
//             customerId: userId,
//           },
//         });
//       } else {
//         // Create new vehicle
//         vehicle = await prisma.vehicle.create({
//           data: {
//             name: `${quote.vehicleMake} ${quote.vehicleModel}`,
//             model: quote.vehicleModel,
//             brand: quote.vehicleMake,
//             year: quote.vehicleYear,
//             vin: quote.vehicleVin || `TEMP-VIN-${Date.now()}`,
//             status: "active",
//             fuelType: "Electric", // Can be added if available
//             vehicleType: quote.vehicleType,
//             marketValue: quote.estimatedValue || undefined,
//             odometerReading: quote.odometerReading || undefined,
//             color: "Black", // Can be added if available
//             purchaseDate: purchaseDate, // Can be added if available
//             isCommercial: quote.vehicleUsage === "commercial",
//             customerId: userId,
//           },
//         });
//       }

//       // Default features for new policy
//       const defaultFeatures = {
//         collisionCoverage: quote.collisionCoverage || false,
//         comprehensiveCoverage: quote.comprehensiveCoverage || false,
//         liabilityCoverage: quote.liabilityCoverage || true,
//         roadsideAssistance: quote.roadsideAssistance || false,
//         rentalReimbursement: quote.rentalReimbursement || false,
//       };

//       // Create new policy with all required fields
//       const newPolicy = await prisma.policy.create({
//         data: {
//           name: `Auto Policy for ${quote.vehicleMake} ${quote.vehicleModel}`,
//           type: "auto",
//           premiumAmount: parseFloat(amount),
//           startDate: new Date(),
//           endDate: new Date(
//             new Date().setFullYear(new Date().getFullYear() + 1)
//           ),
//           status: "active",
//           coverageDetails: "Standard auto coverage",
//           customerId: userId,
//           vehicleId: vehicle.id,
//           quoteId: quoteId,
//           coverageAmount: quote.monthlyPremium * 12,
//           termsAndConditions: "Standard terms and conditions apply",
//           gracePeriod: 30,
//           basePrice: quote.monthlyPremium,
//           description: "Auto insurance policy",
//           longDescription: "Comprehensive auto insurance coverage",
//           features: defaultFeatures,
//           premiumBreakdown: {
//             base: quote.monthlyPremium,
//             discounts: 0,
//             taxes: 0,
//             total: parseFloat(amount),
//           },
//           vehicleType: quote.vehicleType,
//         },
//       });

//       // Create payment record
//       const payment = await prisma.payment.create({
//         data: {
//           name: `Initial payment for Policy ${newPolicy.id}`,
//           date: new Date(),
//           status: "completed",
//           method: "online",
//           type: "initial",
//           amount: parseFloat(amount),
//           reason: "New policy purchase",
//           description: `Payment for new policy from quote ${quoteId}`,
//           referenceNo: `PAY-${Date.now()}`,
//           customerId: userId,
//           policyId: newPolicy.id,
//         },
//       });

//       // Generate receipt
//       const receipt = {
//         paymentId: payment.payNo,
//         amount: payment.amount,
//         date: payment.date,
//         policyNumber: newPolicy.id,
//         policyName: newPolicy.name,
//         customerName: `${user.firstName} ${user.lastName}`,
//         customerEmail: user.email,
//         cardholderName,
//         billingAddress: `${billingAddress}, ${city}, ${zipCode}`,
//         receiptNumber: `RCPT-${Date.now()}`,
//         timestamp: new Date().toISOString(),
//         vehicleDetails: {
//           make: quote.vehicleMake,
//           model: quote.vehicleModel,
//           year: quote.vehicleYear,
//           vin: vehicle.vin,
//         },
//       };

//       // Update payment with receipt
//       await prisma.payment.update({
//         where: { payNo: payment.payNo },
//         data: { receipt: JSON.stringify(receipt) },
//       });

//       return res.status(200).json({
//         success: true,
//         message: "New policy created and payment processed",
//         paymentId: payment.payNo,
//         newPolicyId: newPolicy.id,
//         vehicleId: vehicle.id,
//         receipt,
//       });
//     }
//   } catch (error) {
//     console.error("Payment processing error:", error);

//     let statusCode = 500;
//     let message = "Payment processing failed";

//     // Proper error handling with imported Prisma
//     // if (error instanceof Prisma.PrismaClientKnownRequestError) {
//     //   if (error.code === "P2002") {
//     //     message = "Duplicate payment detected";
//     //     statusCode = 400;
//     //   } else if (error.code === "P2025") {
//     //     message = "Related record not found";
//     //     statusCode = 404;
//     //   }
//     // } else if (error instanceof Prisma.PrismaClientValidationError) {
//     //   message = "Validation error - missing required fields";
//     //   statusCode = 400;
//     // }

//     res.status(statusCode).json({
//       success: false,
//       message,
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };
// export const getPaymentHistory = async (req, res) => {
//   try {
//     const payments = await prisma.payment.findMany({
//       where: { customerId: req.user.id },
//       orderBy: { date: "desc" },
//       include: { policy: true },
//     });

//     res.status(200).json(payments);
//   } catch (error) {
//     res.status(500).json({
//       message: "Failed to fetch payment history",
//       error: error.message,
//     });
//   }
// };

// export const getPaymentReceipt = async (req, res) => {
//   try {
//     const payment = await prisma.payment.findUnique({
//       where: { payNo: req.params.paymentId },
//     });

//     if (!payment || payment.customerId !== req.user.id) {
//       return res.status(404).json({ message: "Receipt not found" });
//     }

//     res.status(200).json(JSON.parse(payment.receipt || "{}"));
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Failed to fetch receipt", error: error.message });
//   }
// };

// export const recentPayment = async (req, res) => {
//   try {
//     const { customerId } = req.query;

//     // Validate customerId
//     if (!customerId || typeof customerId !== "string") {
//       return res.status(400).json({
//         success: false,
//         message: "Valid customerId is required as query parameter",
//       });
//     }

//     // Fetch recent payments for the customer
//     const payments = await prisma.payment.findMany({
//       where: {
//         customerId: customerId,
//       },
//       orderBy: {
//         date: "desc", // Sort by most recent payments first
//       },
//       take: 5, // Limit to 5 recent payments
//       select: {
//         payNo: true,
//         date: true,
//         amount: true,
//         status: true,
//         method: true,
//         policyId: true,
//       },
//     });

//     // Debug: Log the fetched payments
//     console.log(
//       `Found ${payments.length} recent payments for customerId: ${customerId}`
//     );

//     // Return the payments
//     res.status(200).json({
//       success: true,
//       count: payments.length,
//       data: payments.map((payment) => ({
//         id: payment.payNo,
//         date: payment.date.toISOString().split("T")[0], // Format date as YYYY-MM-DD
//         amount: `$${payment.amount.toFixed(2)}`, // Format amount as currency
//         policyNumber: payment.policyId,
//         status: payment.status,
//         method: payment.method,
//       })),
//     });
//   } catch (error) {
//     console.error("Error fetching recent payments:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to retrieve recent payments",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };
import { createPolicyDocument } from "../service/policyDocumentService.js";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  generatePaymentId,
  generateReceiptId,
  generateProfileId,
  generateVehicleId,
  generatePolicyId,
} from "../utils/idGenerator.js"; // Import custom ID generator

const prisma = new PrismaClient();

export const processPayment = async (req, res) => {
  try {
    const {
      userId,
      policyId,
      quoteId,
      amount,
      cardholderName,
      billingAddress,
      city,
      zipCode,
      password,
    } = req.body;

    // Validate required fields
    if (!userId || !amount || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, amount, or password",
      });
    }

    // Validate either policyId or quoteId exists
    if (!policyId && !quoteId) {
      return res.status(400).json({
        success: false,
        message:
          "Either policyId (for existing policy) or quoteId (for new policy) must be provided",
      });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        profile: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Handle existing policy payment
    if (policyId) {
      const policy = await prisma.policy.findUnique({
        where: { id: policyId },
        select: {
          id: true,
          name: true,
          premiumAmount: true,
          status: true,
          customerId: true,
        },
      });

      if (!policy) {
        return res.status(404).json({
          success: false,
          message: "Policy not found",
        });
      }

      if (policy.customerId !== userId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to pay for this policy",
        });
      }

      // Generate custom payment ID
      const paymentId = generatePaymentId();

      const payment = await prisma.payment.create({
        data: {
          payNo: paymentId, // Use custom payment ID
          name: `Payment for ${policy.name}`,
          date: new Date(),
          status: "completed",
          method: "online",
          type: "premium",
          amount: parseFloat(amount),
          reason: "Policy premium payment",
          description: `Payment for policy ${policyId}`,
          referenceNo: paymentId, // Use the same custom ID for reference
          customerId: userId,
          policyId: policyId,
        },
      });

      return res.status(200).json({
        success: true,
        message: "Policy payment processed successfully",
        paymentId: payment.payNo,
        policyId: policyId,
      });
    }

    // Handle new policy from quote
    if (quoteId) {
      const quote = await prisma.quote.findUnique({
        where: { id: quoteId },
        include: {
          vehicle: true,
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          additionalDrivers: true,
        },
      });

      if (!quote) {
        return res.status(404).json({
          success: false,
          message: "Quote not found",
        });
      }

      if (quote.userId && quote.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to purchase this quote",
        });
      }

      // Update or create user profile
      const profileData = {
        phone: quote.phone,
        address: quote.address,
        dateOfBirth: new Date(
          new Date().setFullYear(new Date().getFullYear() - quote.age)
        ),
        country: "Ethiopia", // Default as per your schema
        city: city || undefined,
        subCity: undefined, // Can be added if available
        gender: undefined, // Can be added if available
      };

      await prisma.profile.upsert({
        where: { userId },
        update: profileData,
        create: {
          ...profileData,
          id: generateProfileId(), // Generate a custom ID for the profile
          userId,
        },
      });

      const purchaseDate = quote.purchaseDate
        ? new Date(quote.purchaseDate)
        : new Date(new Date().setFullYear(new Date().getFullYear() - 1)); // Default to 1 year ago if not provided

      // Create or update vehicle
      let vehicle;
      if (quote.vehicleId) {
        // Update existing vehicle
        vehicle = await prisma.vehicle.update({
          where: { id: quote.vehicleId },
          data: {
            name: `${quote.vehicleMake} ${quote.vehicleModel}`,
            model: quote.vehicleModel,
            brand: quote.vehicleMake,
            year: quote.vehicleYear,
            vin: quote.vehicleVin || undefined,
            status: "active",
            fuelType: undefined, // Can be added if available
            vehicleType: quote.vehicleType,
            marketValue: quote.estimatedValue || undefined,
            odometerReading: quote.odometerReading || 0,
            color: undefined, // Can be added if available
            purchaseDate: undefined, // Can be added if available
            isCommercial: quote.vehicleUsage === "commercial",
            customerId: userId,
          },
        });
      } else {
        // Create new vehicle with custom ID
        vehicle = await prisma.vehicle.create({
          data: {
            id: generateVehicleId(), // Generate a custom ID for the vehicle
            name: `${quote.vehicleMake} ${quote.vehicleModel}`,
            model: quote.vehicleModel,
            brand: quote.vehicleMake,
            year: quote.vehicleYear,
            vin: quote.vehicleVin || `TEMP-VIN-${Date.now()}`,
            status: "active",
            fuelType: "Electric", // Can be added if available
            vehicleType: quote.vehicleType,
            marketValue: quote.estimatedValue || undefined,
            odometerReading: quote.odometerReading || 0,
            color: "Black", // Can be added if available
            purchaseDate: purchaseDate, // Can be added if available
            isCommercial: quote.vehicleUsage === "commercial",
            customerId: userId,
          },
        });
      }
      // Default features for new policy
      const defaultFeatures = {
        collisionCoverage: quote.collisionCoverage || false,
        comprehensiveCoverage: quote.comprehensiveCoverage || false,
        liabilityCoverage: quote.liabilityCoverage || true,
        roadsideAssistance: quote.roadsideAssistance || false,
        rentalReimbursement: quote.rentalReimbursement || false,
      };

      // Create new policy with all required fields
      const newPolicy = await prisma.policy.create({
        data: {
          id: generatePolicyId(), // Generate custom policy ID
          name: `Auto Policy for ${quote.vehicleMake} ${quote.vehicleModel}`,
          type: "auto",
          premiumAmount: parseFloat(amount),
          startDate: new Date(),
          endDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ),
          status: "active",
          coverageDetails: "Standard auto coverage",
          customerId: userId,
          vehicleId: vehicle.id,
          quoteId: quoteId,
          coverageAmount: quote.monthlyPremium * 12,
          termsAndConditions: "Standard terms and conditions apply",
          gracePeriod: 30,
          basePrice: quote.monthlyPremium,
          description: "Auto insurance policy",
          longDescription: "Comprehensive auto insurance coverage",
          features: defaultFeatures,
          premiumBreakdown: {
            base: quote.monthlyPremium,
            discounts: 0,
            taxes: 0,
            total: parseFloat(amount),
          },
          vehicleType: quote.vehicleType,
        },
      });
      await createPolicyDocument(newPolicy, userId);
      // Generate custom payment ID
      const paymentId = generatePaymentId();

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          payNo: paymentId, // Use custom payment ID
          name: `Initial payment for Policy ${newPolicy.id}`,
          date: new Date(),
          status: "completed",
          method: "online",
          type: "initial",
          amount: parseFloat(amount),
          reason: "New policy purchase",
          description: `Payment for new policy from quote ${quoteId}`,
          referenceNo: paymentId, // Use the same custom ID for reference
          customerId: userId,
          policyId: newPolicy.id,
        },
      });

      // Generate custom receipt ID
      const receiptId = generateReceiptId();

      // Generate receipt
      const receipt = {
        paymentId: payment.payNo,
        amount: payment.amount,
        date: payment.date,
        policyNumber: newPolicy.id,
        policyName: newPolicy.name,
        customerName: `${user.firstName} ${user.lastName}`,
        customerEmail: user.email,
        cardholderName,
        billingAddress: `${billingAddress}, ${city}, ${zipCode}`,
        receiptNumber: receiptId, // Use custom receipt ID
        timestamp: new Date().toISOString(),
        vehicleDetails: {
          make: quote.vehicleMake,
          model: quote.vehicleModel,
          year: quote.vehicleYear,
          vin: vehicle.vin,
        },
      };

      // Update payment with receipt
      await prisma.payment.update({
        where: { payNo: payment.payNo },
        data: { receipt: JSON.stringify(receipt) },
      });

      return res.status(200).json({
        success: true,
        message: "New policy created and payment processed",
        paymentId: payment.payNo,
        newPolicyId: newPolicy.id,
        vehicleId: vehicle.id,
        receipt,
        documentUrl: newPolicy.documentUrl || null, // Include document URL if available
      });
    }
  } catch (error) {
    console.error("Payment processing error:", error);
    let statusCode = 500;
    let message = "Payment processing failed";

    res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Remaining functions (getPaymentHistory, getPaymentReceipt, recentPayment) remain unchanged
export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { customerId: req.user.id },
      orderBy: { date: "desc" },
      include: { policy: true },
    });

    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch payment history",
      error: error.message,
    });
  }
};

export const getPaymentReceipt = async (req, res) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { payNo: req.params.paymentId },
    });

    if (!payment || payment.customerId !== req.user.id) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    res.status(200).json(JSON.parse(payment.receipt || "{}"));
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch receipt",
      error: error.message,
    });
  }
};

export const recentPayment = async (req, res) => {
  try {
    const { customerId } = req.query;

    // Validate customerId
    if (!customerId || typeof customerId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Valid customerId is required as query parameter",
      });
    }

    // Fetch recent payments for the customer
    const payments = await prisma.payment.findMany({
      where: {
        customerId: customerId,
      },
      orderBy: {
        date: "desc", // Sort by most recent payments first
      },
      take: 5, // Limit to 5 recent payments
      select: {
        payNo: true,
        date: true,
        amount: true,
        status: true,
        method: true,
        policyId: true,
      },
    });

    // Debug: Log the fetched payments
    console.log(
      `Found ${payments.length} recent payments for customerId: ${customerId}`
    );

    // Return the payments
    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments.map((payment) => ({
        id: payment.payNo,
        date: payment.date.toISOString().split("T")[0], // Format date as YYYY-MM-DD
        amount: `$${payment.amount.toFixed(2)}`, // Format amount as currency
        policyNumber: payment.policyId,
        status: payment.status,
        method: payment.method,
      })),
    });
  } catch (error) {
    console.error("Error fetching recent payments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve recent payments",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
