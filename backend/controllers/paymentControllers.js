import { PrismaClient, Prisma } from "@prisma/client";
const prisma = new PrismaClient();
import bcrypt from "bcryptjs";

// controllers/paymentController.js

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

      const payment = await prisma.payment.create({
        data: {
          name: `Payment for ${policy.name}`,
          date: new Date(),
          status: "completed",
          method: "online",
          type: "premium",
          amount: parseFloat(amount),
          reason: "Policy premium payment",
          description: `Payment for policy ${policyId}`,
          referenceNo: `PAY-${Date.now()}`,
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
          vehicleId: quote.vehicleId || undefined,
          quoteId: quoteId,
          coverageAmount: quote.monthlyPremium * 12,
          termsAndConditions: "Standard terms and conditions apply",
          gracePeriod: 30,
          basePrice: quote.monthlyPremium,
          description: "Auto insurance policy",
          longDescription: "Comprehensive auto insurance coverage",
          features: defaultFeatures, // Added features field
          premiumBreakdown: {
            // Added premium breakdown
            base: quote.monthlyPremium,
            discounts: 0,
            taxes: 0,
            total: parseFloat(amount),
          },
        },
      });

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          name: `Initial payment for Policy ${newPolicy.id}`,
          date: new Date(),
          status: "completed",
          method: "online",
          type: "initial",
          amount: parseFloat(amount),
          reason: "New policy purchase",
          description: `Payment for new policy from quote ${quoteId}`,
          referenceNo: `PAY-${Date.now()}`,
          customerId: userId,
          policyId: newPolicy.id,
        },
      });

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
        receiptNumber: `RCPT-${Date.now()}`,
        timestamp: new Date().toISOString(),
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
        receipt,
      });
    }
  } catch (error) {
    console.error("Payment processing error:", error);

    let statusCode = 500;
    let message = "Payment processing failed";

    // Proper error handling with imported Prisma
    // if (error instanceof Prisma.PrismaClientKnownRequestError) {
    //   if (error.code === "P2002") {
    //     message = "Duplicate payment detected";
    //     statusCode = 400;
    //   } else if (error.code === "P2025") {
    //     message = "Related record not found";
    //     statusCode = 404;
    //   }
    // } else if (error instanceof Prisma.PrismaClientValidationError) {
    //   message = "Validation error - missing required fields";
    //   statusCode = 400;
    // }

    res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

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
    res
      .status(500)
      .json({ message: "Failed to fetch receipt", error: error.message });
  }
};
