import express from "express";
import { PrismaClient } from "@prisma/client";
import { generateProfileId } from "../utils/idGenerator.js";
const prisma = new PrismaClient();
export const getProfile = async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      profile: user.profile,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
};
const profileId = generateProfileId();
// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const { userId, profileData, userData } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Update user data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
      },
    });

    // Update or create profile
    const updatedProfile = await prisma.profile.upsert({
      where: { userId },
      update: {
        phone: profileData.phone,
        address: profileData.address,
        dateOfBirth: profileData.dateOfBirth,
        city: profileData.city,
        country: profileData.country,
        gender: profileData.gender,
        bio: profileData.bio,
      },
      create: {
        id: profileId,
        userId,
        phone: profileData.phone,
        address: profileData.address,
        dateOfBirth: profileData.dateOfBirth,
        city: profileData.city,
        country: profileData.country,
        gender: profileData.gender,
        bio: profileData.bio,
      },
    });

    res.status(200).json({
      success: true,
      user: updatedUser,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};
