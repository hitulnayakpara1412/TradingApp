import express from "express";
import {
  getAllStocks,
  getStockBySymbol,
  registerStock,
} from "../controllers/stock/stocks.js";
import { getOrder } from "../controllers/stock/order.js";
import {
  buyStock,
  getAllHoldings,
  sellStock,
} from "../controllers/stock/holding.js";

const router = express.Router();

// Stock Routes
router.get("/stock", getStockBySymbol);
router.get("/register", registerStock);
// Allow GET /stocks to return all stocks (also keep POST for existing clients)
router.get("/", getAllStocks);
router.post("", getAllStocks);
router.post("/buy", buyStock);
router.post("/sell", sellStock);
// Support both GET and POST for holdings and orders
router.get("/holding", getAllHoldings);
router.get("/order", getOrder);

export default router;
