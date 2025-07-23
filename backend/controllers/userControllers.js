import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateProfileId, generateUserId } from "../utils/idGenerator.js";
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

export const getAdminProfile = async (req, res) => {
  try {
    // Get user ID from query params (passed from frontend)
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const admin = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin profile not found",
      });
    }

    res.json({
      success: true,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      joinDate: admin.createdAt,
      profile: admin.profile || {
        phone: null,
        qualification: null,
        status: null,
      },
    });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin profile",
      error: error.message,
    });
  }
};
const profileId = generateProfileId();
export const updateAdminProfile = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { firstName, lastName, phone, qualification, status } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { firstName, lastName },
    });

    // Update or create profile
    const updatedProfile = await prisma.profile.upsert({
      where: { userId },
      update: { phone, qualification, status },
      create: {
        id: profileId,
        userId,
        phone,
        qualification,
        status,
      },
    });

    res.json({
      success: true,
      user: {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
      },
      profile: {
        phone: updatedProfile.phone,
        qualification: updatedProfile.qualification,
        status: updatedProfile.status,
      },
    });
  } catch (error) {
    console.error("Error updating admin profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// Get all users

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        policies: true,
        claimsAsCustomer: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      status: user.profile?.status || "Active",
      activePolicies: user.policies?.length || 0,
      recentClaim:
        user.claimsAsCustomer[0]?.createdAt?.toISOString().split("T")[0] ||
        null,
    }));

    res.json({ success: true, data: formattedUsers });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// Create new user
export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, status } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        id: generateUserId(),
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: "CUSTOMER",
        profile: {
          create: {
            status: status || "Active",
          },
        },
      },
      include: {
        profile: true,
        policies: true,
      },
    });

    res.json({
      success: true,
      data: {
        id: newUser.id,
        name: `${newUser.firstName} ${newUser.lastName}`,
        email: newUser.email,
        status: newUser.profile?.status || "Active",
        activePolicies: newUser.policies?.length || 0,
        recentClaim: null,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message:
        error.code === "P2002"
          ? "Email already exists"
          : "Failed to create user",
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, status } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        profile: {
          update: {
            status,
          },
        },
      },
      include: {
        profile: true,
        policies: true,
        claimsAsCustomer: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        name: `${updatedUser.firstName} ${updatedUser.lastName}`,
        email: updatedUser.email,
        status: updatedUser.profile?.status || "Active",
        activePolicies: updatedUser.policies?.length || 0,
        recentClaim:
          updatedUser.claimsAsCustomer[0]?.createdAt
            ?.toISOString()
            .split("T")[0] || null,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message:
        error.code === "P2002"
          ? "Email already exists"
          : "Failed to update user",
    });
  }
};

// Update user status
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await prisma.profile.update({
      where: { userId: id },
      data: { status },
    });

    res.json({
      success: true,
      message: "User status updated successfully",
    });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};
