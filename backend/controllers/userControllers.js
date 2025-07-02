import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const updateProfile = async (req, res) => {
  const userId = req.user.userId;
  const {
    firstName,
    lastName,
    email,
    phone,
    address,
    city,
    state,
    zipCode,
    dateOfBirth,
    avatar,
    emergencyContactName,
    emergencyContactPhone,
  } = req.body;

  try {
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        phone,
        address,
        city,
        state,
        zipCode,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        avatar,
        emergencyContactName,
        emergencyContactPhone,
      },
      create: {
        userId,
        phone,
        address,
        city,
        state,
        zipCode,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        avatar,
        emergencyContactName,
        emergencyContactPhone,
      },
    });

    // Update user-specific fields in the User model
    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        email,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};

export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    res.status(200).json({
      success: true,
      userProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error featching profile",
    });
  }
};
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      include: { profile: true },
    });
    res.status(200).json({ success: true, customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// backend (e.g., controllers/userController.ts)
// controllers/userController.ts

export const getUserDashboardData = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        firstName: true,
        lastName: true,
        lastLogin: true, // Now this field exists
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update last login time (optional)
    await prisma.user.update({
      where: { id: req.user.id },
      data: { lastLogin: new Date() },
    });

    res.json({
      userName: `${user.firstName} ${user.lastName}`,
      lastLogin: user.lastLogin?.toISOString(),
    });
  } catch (error) {
    console.error("Error in getUserDashboardData:", error);
    res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
