import "express-async-errors";
import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import swaggerUI from "swagger-ui-express";
import YAML from "yamljs";
import cors from "cors";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/connect.js";
import authRouter from "./routes/auth.js";
import stockRouter from "./routes/stocks.js";
import notFoundMiddleware from "./middleware/not-found.js";
import errorHandlerMiddleware from "./middleware/error-handler.js";
import authenticateSocketUser from "./middleware/socketAuth.js";
import {
  scheduleDayReset,
  generateRandomDataEvery5Second,
  update10MinCandle,
} from "./services/cronJob.js";
import { Server } from "socket.io";
import socketHandShake from "./middleware/socketHandshake.js";
import Stock from "./models/Stock.js";
// import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

scheduleDayReset();
generateRandomDataEvery5Second();
update10MinCandle();

const holidays = [
  "2026-02-01",
  "2026-02-02",
  "2026-02-03",
  "2026-04-14",
  "2026-05-01",
];

const isTradingHour = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const isWeekDay = dayOfWeek > 0 && dayOfWeek < 6;
  const isTradingTime =
    (now.getHours() === 9 && now.getMinutes() >= 30) ||
    (now.getHours() > 9 && now.getHours() < 15) ||
    (now.getHours() === 15 && now.getMinutes() <= 30);
  const today = new Date().toISOString().slice(0, 10);
  const isTradingHour = isWeekDay && isTradingTime && !holidays.includes(today);
  // return isTradingHour;
  return true;
};

const app = express();
app.use(express.json());

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: process.env.WEBSERVER_URI || "http://localhost:3001",
    methods: ["GET", "POST"],
    allowedHeaders: ["access_token"],
    credentials: true,
  },
});
io.use(socketHandShake);

io.on("connection", (socket) => {
  console.log("New client connected", socket.id);
  socket.on("subscribeToStocks", async (stockSymbol) => {
    console.log(`Client ${socket.id} subscribed to stock: ${stockSymbol}`);
    const sendUpdates = async () => {
      try {
        const stock = await Stock.findOne({ symbol: stockSymbol });
        if (!stock) {
          console.error(`Stock with symbol ${stockSymbol} not found.`);
          return;
        } else {
          socket.emit(`${stockSymbol}`, stock);
        }
      } catch (error) {
        console.error("Error sending stock update: ", error);
      }
    };
    sendUpdates();

    const intervalId = setInterval(sendUpdates, 5000);

    if (!isTradingHour()) {
      clearInterval(intervalId);
    }
  });

  socket.on("subscribeToMultipleStocks", async (stockSymbols) => {
    console.log(
      `Client ${socket.id} subscribed to multiple stocks: ${stockSymbols}`
    );
    const sendUpdates = async () => {
      try {
        for (const symbol of stockSymbols) {
          const stock = await Stock.findOne({ symbol: symbol });
          if (!stock) {
            console.error(`Stock with symbol ${symbol} not found.`);
            continue;
          } else {
            socket.emit(`${symbol}`, stock);
          }
        }
      } catch (error) {
        console.error("Error sending stock update: ", error);
      }
    };
    sendUpdates();

    const intervalId = setInterval(sendUpdates, 5000);

    if (!isTradingHour()) {
      clearInterval(intervalId);
    }
  });

  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });
});

httpServer.listen(process.env.SOCKET_PORT || 4000, () => {
  console.log(
    "WebSocket server is running and listening on port",
    httpServer.address().port
  );
});

app.get("/", (req, res) => {
  res.send('<h1>Trading API</h1><a href="/api-docs">Documentation</a>');
});

// Swagger API Docs
const swaggerDocument = YAML.load(join(__dirname, "./docs/swagger.yaml"));
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

// Routes
app.use("/auth", authRouter);
app.use("/stocks", authenticateSocketUser, stockRouter);

// Middelware
app.use(cors());
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// Start Server
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    // // Drop admin and local collections
    // const db = mongoose.connection.db;

    // const dropCollectionSafely = async (collectionName) => {
    //   try {
    //     const collections = await db.listCollections().toArray();
    //     const collectionExists = collections.some((col) => col.name === collectionName);

    //     if (collectionExists) {
    //       await db.dropCollection(collectionName);
    //       console.log(`✓ Dropped '${collectionName}' collection`);
    //     } else {
    //       console.log(`- '${collectionName}' collection not found`);
    //     }
    //   } catch (error) {
    //     console.error(`✗ Error dropping '${collectionName}' collection:`, error.message);
    //   }
    // };

    // await dropCollectionSafely("admin");
    // await dropCollectionSafely("local");

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () =>
      console.log(`Server is listening on port ${PORT}...`)
    );
  } catch (error) {
    console.error(error);
  }
};

start();
