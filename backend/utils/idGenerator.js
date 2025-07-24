const generateCustomId = (prefix) => {
  const year = new Date().getFullYear();
  const randomNumber = Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0"); // Ensure 5 digits (e.g., 00123)
  return `${prefix}-${year}-${randomNumber}`;
};

export const generateUserId = () => generateCustomId("USER");
export const generateProfileId = () => generateCustomId("PRF");
export const generateVehicleId = () => generateCustomId("VEH");
export const generateTransactionId = () => generateCustomId("TRX");
export const generateClaimId = () => generateCustomId("CLM");
export const generateNotificationId = () => generateCustomId("NOT");
export const generateReportId = () => generateCustomId("RPT");
export const generateQuoteId = () => generateCustomId("QTE");
export const generateDriverId = () => generateCustomId("DRV");
export const generatePolicyId = () => generateCustomId("POL");
export const generatePaymentId = () => generateCustomId("PAY");
export const generateReceiptId = () => generateCustomId("RCPT");
