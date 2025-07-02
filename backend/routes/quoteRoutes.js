import express from "express";
const route = express.Router();
import {
  calculateQuote,
  saveTemporaryQuote,
  getTemporaryQuoteById,
} from "../controllers/quoteController.js";

/**
 * POST /api/quote/calculate
 * Calculate an insurance quote.
 */
route.post("/calculate", calculateQuote);

/**
 * POST /api/quote/save-temporary
 * Save a temporary quote.
 */
route.post("/save-temporary", saveTemporaryQuote);

/**
 * GET /api/quote/get-by-id/:quoteId
 * Retrieve a temporary quote by its ID.
 */
route.get("/get-by-id/:quoteId", getTemporaryQuoteById);

export default route;
