import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const updateProfile = async (req, res) => {
  const userId = req.user.userId;
  const { phone, address, dateOfBirth, avatar, bio } = req.body;

  try {
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: {
        phone,
        address,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        avatar,
        bio,
      },
      create: {
        userId,
        phone,
        address,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        avatar,
        bio,
      },
    });
    return res.status(200).json({
      success: true,
      message: "profile updated succesfully",
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "server error while updating profile",
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
