import { StatusCodes } from "http-status-codes";
import { BadRequestError } from "../../errors/index.js";
import Order from "../../models/Order.js";
import jwt from "jsonwebtoken";

const getOrder = async (req, res) => {
  const accessToken = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.verify(accessToken, process.env.SOCKET_TOKEN_SECRET);
  const userId = decodedToken.userId;

  try {
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password -biometricKey -login_pin",
      })
      .populate({
        path: "stock",
        select: "symbol companyName iconUrl lastDayTradedPrice currentPrice",
      });
    return res
      .status(StatusCodes.OK)
      .json({ message: "Orders retrieved successfully", data: orders });
  } catch (error) {
    throw new BadRequestError(error.message);
  }
};

export { getOrder };
