import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../../errors/index.js";
import Holding from "../../models/Holding.js";
import User from "../../models/User.js";
import Order from "../../models/Order.js";
import jwt from "jsonwebtoken";
import Stock from "../../models/Stock.js";

const buyStock = async (req, res) => {
  const { stock_id, quantity } = req.body;
  if (!stock_id || !quantity) {
    throw new BadRequestError("Please provide all values");
  }

  const accessToken = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(accessToken, process.env.SOCKET_TOKEN_SECRET);
  const userId = decodedToken.userId;

  try {
    const stock = await Stock.findById(stock_id);
    const buyPrice = stock.currentPrice;
    const totalPrice = buyPrice * quantity;
    const currentUser = await User.findById(userId);

    if (currentUser.balance < totalPrice) {
      throw new BadRequestError(
        "Insufficient balance to complete the purchase"
      );
    }
    currentUser.balance -= totalPrice;
    await currentUser.save();

    const newHolding = await Holding.create({
      user: userId,
      stock: stock_id,
      quantity,
      buyPrice,
    });
    await newHolding.save();

    const newOrder = await Order.create({
      user: userId,
      stock: stock_id,
      quantity,
      type: "buy",
      remainingBalance: currentUser.balance,
      price: buyPrice,
    });
    await newOrder.save();

    return res
      .status(StatusCodes.CREATED)
      .json({ message: "Stock purchased successfully", data: newHolding });
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const sellStock = async (req, res) => {
  const { holdingId, quantity } = req.body;
  if (!holdingId || !quantity) {
    throw new BadRequestError("Please provide all values");
  }

  try {
    const holding = await Holding.findById(holdingId);
    if (!holding) {
      throw new NotFoundError("Holding not found");
    }
    if (quantity > holding.quantity) {
      throw new BadRequestError("Insufficient stock quantity to sell");
    }

    const stock = await Stock.findById(holding.stock);
    const sellPrice = quantity * stock.currentPrice;
    holding.quantity -= quantity;

    if (holding.quantity <= 0) {
      await Holding.findByIdAndDelete(holdingId);
    } else {
      await holding.save();
    }

    const currentUser = await User.findById(holding.user);
    if (!currentUser) {
      throw new NotFoundError("User not found");
    }
    currentUser.balance += sellPrice;
    await currentUser.save();

    const newOrder = await Order.create({
      user: holding.user,
      stock: holding.stock,
      quantity,
      type: "sell",
      remainingBalance: currentUser.balance,
      price: stock.currentPrice,
    });
    await newOrder.save();

    return res.status(StatusCodes.OK).json({
      message: "Stock sold successfully",
      data: { orderId: newOrder._id, sellPrice },
    });
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

const getAllHoldings = async (req, res) => {
  const accessToken = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(accessToken, process.env.SOCKET_TOKEN_SECRET);
  const userId = decodedToken.userId;

  try {
    const holdings = await Holding.find({ user: userId }).populate({
      path: "stock",
      select: "-dayTimeSeries -tenMinuteTimeSeries",
    });

    return res
      .status(StatusCodes.OK)
      .json({ message: "Holdings retrieved successfully", data: holdings });
  } catch (error) {
    throw new BadRequestError("Failed to retrieve holdings " + error.message);
  }
};

export { buyStock, sellStock, getAllHoldings };
