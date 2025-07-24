// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();

// export const calculateQuote = async (req, res) => {
//   try {
//     const {
//       fullName,
//       age,
//       email,
//       phone,
//       address,
//       driversLicenseNumber,
//       vehicleType,
//       vehicleMake,
//       vehicleModel,
//       vehicleYear,
//       vehicleVin,
//       ownershipType,
//       vehicleUsage,
//       primaryParkingLocation,
//       annualMileage,
//       odometerReading,
//       estimatedValue,
//       hasAntiTheftDevices,
//       collisionCoverage,
//       comprehensiveCoverage,
//       liabilityCoverage,
//       roadsideAssistance,
//       rentalReimbursement,
//       deductibleAmount,
//       coverageDuration,
//       startDate,
//       additionalDrivers,
//       coverageLevel,
//     } = req.body;

//     // Calculation logic remains the same...
//     const basePrice =
//       vehicleType === "luxury"
//         ? 200
//         : vehicleType === "suv"
//           ? 150
//           : vehicleType === "truck"
//             ? 170
//             : vehicleType === "motorcycle"
//               ? 100
//               : 120;

//     const ageMultiplier = age < 25 ? 1.5 : age > 65 ? 1.2 : 1;
//     const usageMultiplier = vehicleUsage === "commercial" ? 1.4 : 1;
//     const coverageMultiplier =
//       deductibleAmount === 250 ? 1.5 : deductibleAmount === 500 ? 1.2 : 1;

//     const discounts = [];
//     if (age > 30) discounts.push("Safe Driver");
//     if (vehicleYear > 2020) discounts.push("New Vehicle");
//     if (hasAntiTheftDevices) discounts.push("Anti-Theft Devices");

//     const monthlyPremium = parseFloat(
//       (
//         basePrice *
//         ageMultiplier *
//         usageMultiplier *
//         coverageMultiplier
//       ).toFixed(2)
//     );

//     const quote = await prisma.quote.create({
//       data: {
//         fullName,
//         age,
//         email,
//         phone,
//         address,
//         driversLicenseNumber: driversLicenseNumber || null,
//         vehicleType,
//         vehicleMake,
//         vehicleModel,
//         vehicleYear,
//         vehicleVin: vehicleVin || null,
//         ownershipType: ownershipType || null,
//         vehicleUsage,
//         primaryParkingLocation: primaryParkingLocation || null,
//         annualMileage: annualMileage || null,
//         odometerReading: odometerReading || null,
//         estimatedValue: estimatedValue || null,
//         hasAntiTheftDevices: hasAntiTheftDevices || false,
//         collisionCoverage: collisionCoverage || false,
//         comprehensiveCoverage: comprehensiveCoverage || false,
//         liabilityCoverage: liabilityCoverage || true,
//         roadsideAssistance: roadsideAssistance || false,
//         rentalReimbursement: rentalReimbursement || false,
//         deductibleAmount: parseInt(deductibleAmount, 10),
//         coverageDuration: parseInt(coverageDuration, 10),
//         startDate: new Date(startDate),
//         coverageLevel: coverageLevel || null,
//         monthlyPremium,
//         estimatedSavings: parseFloat((Math.random() * 300 + 100).toFixed(2)),
//         discounts: JSON.stringify(discounts),
//         additionalDrivers: {
//           create: additionalDrivers?.map((driver) => ({
//             name: driver.name,
//             age: driver.age,
//             drivingHistory: driver.drivingHistory,
//           })),
//         },
//       },
//     });

//     res.status(200).json({
//       success: true,
//       data: {
//         ...quote,
//         discounts: quote.discounts, // Return as-is (will be parsed in frontend)
//       },
//     });
//   } catch (error) {
//     console.error("Error calculating quote:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to calculate quote" });
//   }
// };

// export const saveTemporaryQuote = async (req, res) => {
//   try {
//     const { quoteData } = req.body;

//     if (!quoteData) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Quote data is required" });
//     }

//     const quoteId = quoteData.id || Math.random().toString(36).substring(2, 15);

//     await prisma.temporaryQuote.upsert({
//       where: { quoteId },
//       update: {
//         quoteData: JSON.stringify(quoteData),
//       },
//       create: {
//         quoteId,
//         quoteData: JSON.stringify(quoteData),
//       },
//     });

//     res.status(201).json({ success: true, quoteId });
//   } catch (error) {
//     console.error("Error saving temporary quote:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

// export const getTemporaryQuoteById = async (req, res) => {
//   try {
//     const { quoteId } = req.params;

//     if (!quoteId) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Quote ID is required" });
//     }

//     // First check regular quotes
//     const quote = await prisma.quote.findUnique({
//       where: { id: quoteId },
//     });

//     if (quote) {
//       return res.status(200).json({
//         success: true,
//         data: {
//           ...quote,
//           discounts:
//             typeof quote.discounts === "string"
//               ? JSON.parse(quote.discounts)
//               : quote.discounts,
//         },
//       });
//     }

//     // If not found in regular quotes, check temporary quotes
//     const temporaryQuote = await prisma.temporaryQuote.findUnique({
//       where: { quoteId },
//     });

//     if (!temporaryQuote) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Quote not found" });
//     }

//     const parsedQuoteData = JSON.parse(temporaryQuote.quoteData);
//     res.status(200).json({ success: true, data: parsedQuoteData });
//   } catch (error) {
//     console.error("Error fetching quote by ID:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

// // Add this to associate quotes with users after login
// export const associateQuoteWithUser = async (userId, quoteId) => {
//   const temporaryQuote = await prisma.temporaryQuote.findUnique({
//     where: { quoteId },
//   });

//   if (temporaryQuote) {
//     const quoteData = JSON.parse(temporaryQuote.quoteData);
//     await prisma.quote.create({
//       data: {
//         ...quoteData,
//         userId,
//         isTemporary: false,
//       },
//     });
//     await prisma.temporaryQuote.delete({
//       where: { quoteId },
//     });
//   }
// };

import { PrismaClient } from "@prisma/client";
import { generateQuoteId } from "../utils/idGenerator.js"; // Import custom ID generator

const prisma = new PrismaClient();

export const calculateQuote = async (req, res) => {
  try {
    const {
      fullName,
      age,
      email,
      phone,
      address,
      driversLicenseNumber,
      vehicleType,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleVin,
      ownershipType,
      vehicleUsage,
      primaryParkingLocation,
      annualMileage,
      odometerReading,
      estimatedValue,
      hasAntiTheftDevices,
      collisionCoverage,
      comprehensiveCoverage,
      liabilityCoverage,
      roadsideAssistance,
      rentalReimbursement,
      deductibleAmount,
      coverageDuration,
      startDate,
      additionalDrivers,
      coverageLevel,
    } = req.body;

    // Calculation logic remains the same...
    const basePrice =
      vehicleType === "luxury"
        ? 200
        : vehicleType === "suv"
          ? 150
          : vehicleType === "truck"
            ? 170
            : vehicleType === "motorcycle"
              ? 100
              : 120;

    const ageMultiplier = age < 25 ? 1.5 : age > 65 ? 1.2 : 1;
    const usageMultiplier = vehicleUsage === "commercial" ? 1.4 : 1;
    const coverageMultiplier =
      deductibleAmount === 250 ? 1.5 : deductibleAmount === 500 ? 1.2 : 1;

    const discounts = [];
    if (age > 30) discounts.push("Safe Driver");
    if (vehicleYear > 2020) discounts.push("New Vehicle");
    if (hasAntiTheftDevices) discounts.push("Anti-Theft Devices");

    const monthlyPremium = parseFloat(
      (
        basePrice *
        ageMultiplier *
        usageMultiplier *
        coverageMultiplier
      ).toFixed(2)
    );

    // Generate custom quote ID
    const quoteId = generateQuoteId();

    const quote = await prisma.quote.create({
      data: {
        id: quoteId, // Use custom quote ID
        fullName,
        age,
        email,
        phone,
        address,
        driversLicenseNumber: driversLicenseNumber || null,
        vehicleType,
        vehicleMake,
        vehicleModel,
        vehicleYear,
        vehicleVin: vehicleVin || null,
        ownershipType: ownershipType || null,
        vehicleUsage,
        primaryParkingLocation: primaryParkingLocation || null,
        annualMileage: annualMileage || null,
        odometerReading: odometerReading || null,
        estimatedValue: estimatedValue || null,
        hasAntiTheftDevices: hasAntiTheftDevices || false,
        collisionCoverage: collisionCoverage || false,
        comprehensiveCoverage: comprehensiveCoverage || false,
        liabilityCoverage: liabilityCoverage || true,
        roadsideAssistance: roadsideAssistance || false,
        rentalReimbursement: rentalReimbursement || false,
        deductibleAmount: parseInt(deductibleAmount, 10),
        coverageDuration: parseInt(coverageDuration, 10),
        startDate: new Date(startDate),
        coverageLevel: coverageLevel || null,
        monthlyPremium,
        estimatedSavings: parseFloat((Math.random() * 300 + 100).toFixed(2)),
        discounts: JSON.stringify(discounts),
        additionalDrivers: {
          create: additionalDrivers?.map((driver) => ({
            name: driver.name,
            age: driver.age,
            drivingHistory: driver.drivingHistory,
          })),
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        ...quote,
        discounts: quote.discounts, // Return as-is (will be parsed in frontend)
      },
    });
  } catch (error) {
    console.error("Error calculating quote:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to calculate quote" });
  }
};

export const saveTemporaryQuote = async (req, res) => {
  try {
    const { quoteData } = req.body;

    if (!quoteData) {
      return res
        .status(400)
        .json({ success: false, message: "Quote data is required" });
    }

    // Generate custom quote ID
    const quoteId = generateQuoteId();

    await prisma.temporaryQuote.upsert({
      where: { quoteId },
      update: {
        quoteData: JSON.stringify(quoteData),
      },
      create: {
        quoteId,
        quoteData: JSON.stringify(quoteData),
      },
    });

    res.status(201).json({ success: true, quoteId });
  } catch (error) {
    console.error("Error saving temporary quote:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getTemporaryQuoteById = async (req, res) => {
  try {
    const { quoteId } = req.params;

    if (!quoteId) {
      return res
        .status(400)
        .json({ success: false, message: "Quote ID is required" });
    }

    // First check regular quotes
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
    });

    if (quote) {
      return res.status(200).json({
        success: true,
        data: {
          ...quote,
          discounts:
            typeof quote.discounts === "string"
              ? JSON.parse(quote.discounts)
              : quote.discounts,
        },
      });
    }

    // If not found in regular quotes, check temporary quotes
    const temporaryQuote = await prisma.temporaryQuote.findUnique({
      where: { quoteId },
    });

    if (!temporaryQuote) {
      return res
        .status(404)
        .json({ success: false, message: "Quote not found" });
    }

    const parsedQuoteData = JSON.parse(temporaryQuote.quoteData);
    res.status(200).json({ success: true, data: parsedQuoteData });
  } catch (error) {
    console.error("Error fetching quote by ID:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Add this to associate quotes with users after login
export const associateQuoteWithUser = async (userId, quoteId) => {
  const temporaryQuote = await prisma.temporaryQuote.findUnique({
    where: { quoteId },
  });

  if (temporaryQuote) {
    const quoteData = JSON.parse(temporaryQuote.quoteData);
    await prisma.quote.create({
      data: {
        id: generateQuoteId(), // Generate a new custom ID when associating
        ...quoteData,
        userId,
        isTemporary: false,
      },
    });
    await prisma.temporaryQuote.delete({
      where: { quoteId },
    });
  }
};
