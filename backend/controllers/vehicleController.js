import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const addVehicle = async (req, res) => {
  const {
    name,
    brand,
    model,
    vin,
    fuelType,
    vehicleType,
    odometerReading,
    purchaseDate,
    marketValue,
    isCommercial,
    color,
    year,
    status,
  } = req.body;

  const exisitingVehicle = await prisma.vehicle.findUnique({
    where: { vin },
  });
  if (exisitingVehicle) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  try {
    const newvehicle = await prisma.vehicle.create({
      data: {
        name,
        brand,
        model,
        vin,
        fuelType,
        vehicleType,
        color,
        odometerReading: parseInt(odometerReading),
        purchaseDate: new Date(purchaseDate),
        marketValue: parseFloat(marketValue),
        isCommercial,
        year,
        status,
        customer: { connect: { id: req.userId } },
      },
    });
    res.status(201).json({
      success: true,
      message: "vehicle added succesfully",
      vehicle: newvehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getMyVehicle = async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { customerId: req.userId },
    });
    res.status(200).json({
      success: true,
      vehicles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const updateVehicle = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    brand,
    model,
    vin,
    fuelType,
    vehicleType,
    odometerReading,
    purchaseDate,
    marketValue,
    isCommercial,
    color,
    year,
    status,
  } = req.body;
  try {
    const exisitingVehicle = await prisma.vehicle.findUnique({
      where: { id },
    });
    if (!exisitingVehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehicle not found in the database",
      });
    }
    const updateVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        name,
        brand,
        model,
        vin,
        fuelType,
        vehicleType,
        odometerReading: parseInt(odometerReading),
        purchaseDate: new Date(purchaseDate),
        marketValue: parseInt(marketValue),
        isCommercial,
        color,
        year,
        status,
      },
    });
    res.status(200).json({
      success: true,
      message: "vehicle updated succesfully",
      vehicle: updateVehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const deleteVehicle = async (req, res) => {
  const { id } = req.params;
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });
    if (!vehicle) {
      return res.status(400).json({
        success: false,
        message: "vehicle not found",
      });
    }
    await prisma.vehicle.delete({
      where: { id },
    });
    res.status(200).json({
      success: true,
      message: "vehicle deleted succesfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getVehicleDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        policies: true,
        claims: true,
      },
    });
    if (!vehicle) {
      return res.status(400).json({
        success: false,
        message: "Vehicle not found",
      });
    }
    res.status(200).json({
      success: true,
      vehicle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getVehicleWithoutPolicy = async (req, res) => {
  try {
    const currentDate = new Date();
    const uninsuredVehicles = await prisma.vehicle.findMany({
      where: {
        OR: [
          { policies: null },
          {
            policies: {
              endDate: {
                lt: currentDate,
              },
            },
          },
        ],
      },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        policies: true,
      },
    });
    res.status(200).json({
      success: true,
      vehicles: uninsuredVehicles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// routes/vehicles.js

export const fetchUserVehicle = async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const vehicles = await prisma.vehicle.findMany({
      where: { customerId: userId },
      select: {
        id: true,
        name: true,
        vin: true,
        brand: true,
        model: true,
        year: true,
        color: true,
        marketValue: true,
        isCommercial: true,
        vehicleType: true,
        purchaseDate: true,
        odometerReading: true,
        status: true,
      },
    });

    if (!vehicles || vehicles.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No vehicles found" });
    }

    res.status(200).json({ success: true, data: vehicles });
  } catch (error) {
    console.error("Error fetching user vehicles:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch vehicles" });
  }
};
