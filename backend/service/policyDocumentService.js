import { savePolicyPDF } from "../utils/policyPdfGenerator.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export const createPolicyDocument = async (policy, userId) => {
  try {
    // Fetch related data
    const [user, vehicle] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.vehicle.findUnique({
        where: { id: policy.vehicleId || undefined },
      }),
    ]);

    if (!user || !vehicle) {
      throw new Error("User or vehicle not found");
    }

    // Generate and save PDF
    const documentUrl = await savePolicyPDF(policy, user, vehicle);

    // Update policy with document URL
    await prisma.policy.update({
      where: { id: policy.id },
      data: { documentUrl },
    });
  } catch (error) {
    console.error("Error creating policy document:", error);
    throw error;
  }
};

export const getPolicyDocumentUrl = async (policyId, userId) => {
  const policy = await prisma.policy.findFirst({
    where: { id: policyId, customerId: userId },
    select: { documentUrl: true },
  });

  if (!policy?.documentUrl) {
    throw new Error("Policy document not found");
  }

  return policy.documentUrl;
};
