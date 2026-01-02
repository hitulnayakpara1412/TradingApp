import jwt from "jsonwebtoken";
import { UnAuthenticatedError, NotFoundError } from "../errors/index.js";
import User from "../models/User.js";

const authenticateSocketUser = async (socket, next) => {
  try {
    const token = socket.handshake.headers.access_token;
    if (!token) {
      throw new UnAuthenticatedError("Authentication token missing");
    }

    const decoded = jwt.verify(token, process.env.SOCKET_TOKEN_SECRET);
    if (!decoded) {
      throw new UnAuthenticatedError("Invalid token");
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    socket.user = user;
    next();
  } catch (error) {
    throw new UnAuthenticatedError("Authentication failed");
  }
};

export default authenticateSocketUser;
