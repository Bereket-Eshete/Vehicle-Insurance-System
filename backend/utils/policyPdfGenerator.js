import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generatePolicyPDF = async (policy, user, vehicle, quote) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      bufferPages: true,
      pdfVersion: "1.7",
      lang: "en-US",
      tagged: true,
      displayTitle: true,
      info: {
        Title: `Policy Document - ${policy.id}`,
        Author: "Your Insurance Company",
        Subject: "Insurance Policy",
        Keywords: "insurance,policy,contract",
        CreationDate: new Date(),
        ModDate: new Date(),
      },
    });

    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      // Verify PDF header
      if (!pdfData.slice(0, 5).equals(Buffer.from("%PDF-"))) {
        console.warn("Generated PDF has invalid header");
      }
      resolve(pdfData);
    });
    doc.on("error", reject);

    // Build the document
    generateHeader(doc);
    generatePolicyInfo(doc, policy, user, vehicle);
    generateCoverageDetails(doc, policy);
    generateTerms(doc, policy);
    generateFooter(doc);

    doc.flushPages();
    doc.end();
  });
};

const generateHeader = (doc) => {
  doc
    .fillColor("#444444")
    .fontSize(20)
    .text("INSURANCE COMPANY", 50, 50, { align: "center" })
    .fontSize(10)
    .text("123 Insurance Street", 50, 80, { align: "center" })
    .text("Addis Ababa, Ethiopia", 50, 95, { align: "center" })
    .moveDown();
};

const generatePolicyInfo = (doc, policy, user, vehicle) => {
  doc
    .fillColor("#444444")
    .fontSize(16)
    .text("Policy Information", 50, 130)
    .moveDown(0.5);

  doc
    .font("Helvetica")
    .fontSize(10)
    .text(`Policy Holder: ${user.firstName} ${user.lastName}`)
    .text(`Policy Number: ${policy.id}`)
    .text(`Issue Date: ${policy.startDate.toLocaleDateString()}`)
    .text(`Expiration Date: ${policy.endDate.toLocaleDateString()}`)
    .moveDown();

  doc.fontSize(12).text("Vehicle Information", { underline: true });
  doc
    .fontSize(10)
    .text(`Make: ${vehicle.brand}`)
    .text(`Model: ${vehicle.model}`)
    .text(`Year: ${vehicle.year}`)
    .text(`VIN: ${vehicle.vin || "N/A"}`)
    .moveDown();

  doc.fontSize(12).text("Premium Details", { underline: true });
  doc
    .fontSize(10)
    .text(`Base Premium: $${policy.basePrice?.toFixed(2) || "0.00"}`)
    .text(`Total Premium: $${policy.premiumAmount.toFixed(2)}`)
    .text(`Billing Cycle: Monthly`);
};

const generateCoverageDetails = (doc, policy) => {
  doc
    .addPage()
    .fillColor("#444444")
    .fontSize(16)
    .text("Coverage Details", 50, 50)
    .moveDown(0.5);

  let coverageDetails;
  try {
    coverageDetails =
      typeof policy.coverageDetails === "string"
        ? JSON.parse(policy.coverageDetails)
        : policy.coverageDetails || {};
  } catch {
    coverageDetails = { Standard: "Auto insurance coverage" };
  }

  doc.font("Helvetica").fontSize(10);
  for (const [key, value] of Object.entries(coverageDetails)) {
    doc.text(`${key}: ${String(value)}`);
  }

  if (policy.coverageAmount) {
    doc.text(`Coverage Limit: $${policy.coverageAmount.toFixed(2)}`);
  }
};

const generateTerms = (doc, policy) => {
  doc
    .addPage()
    .fillColor("#444444")
    .fontSize(16)
    .text("Terms and Conditions", 50, 50)
    .moveDown(0.5);

  const terms =
    policy.termsAndConditions ||
    `1. This policy is valid for the term specified above.
    2. Premium payments must be made on time to maintain coverage.
    3. Claims must be reported within 30 days of incident.
    4. Deductibles apply per claim as specified in your policy documents.
    5. Coverage is subject to the terms and limits outlined in this document.`;

  doc.font("Helvetica").fontSize(10).text(terms, { align: "justify" });
};

const generateFooter = (doc) => {
  doc
    .fontSize(8)
    .text(
      "Thank you for choosing our insurance services. For any questions, please contact our customer service at +251 123 456 789 or email support@insurance.com",
      50,
      750,
      { align: "center", width: 500 }
    );
};

export const savePolicyPDF = async (policy, user, vehicle, quote) => {
  try {
    const pdfBuffer = await generatePolicyPDF(policy, user, vehicle, quote);

    // Use process.cwd() for better reliability
    const docsDir = path.join(process.cwd(), "public", "policy-documents");

    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    const pdfPath = path.join(docsDir, `policy_${policy.id}.pdf`);
    fs.writeFileSync(pdfPath, pdfBuffer);

    // Verify the file was written
    if (!fs.existsSync(pdfPath)) {
      throw new Error("Failed to save PDF file");
    }

    return `/policy-documents/policy_${policy.id}.pdf`;
  } catch (error) {
    console.error("Error saving PDF:", error);
    throw error;
  }
};
