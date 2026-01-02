import { NotFoundError } from "../errors/index.js";
import Stock from "../models/Stock.js";

const roundToTwoDecimals = (num) => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

const generateStockData = async (symbol) => {
  const stock = await Stock.findOne({ symbol });
  if (!stock) {
    throw new NotFoundError(`Stock with symbol ${symbol} not found`);
  }

  const now = new Date();
  const minChange = -0.2;
  const maxChange = 0.2;
  const trendChange = 0.005;
  const currentPrice = stock.currentPrice;

  const trendType = Math.random();
  let trendModifier = 0;

  if (trendType < 0.33) {
    trendModifier = 0;
  } else if (trendType < 0.66) {
    trendModifier = trendChange;
  } else {
    trendModifier = -trendChange;
  }

  const changePercentage =
    Math.random() * (maxChange - minChange) + minChange + trendModifier;
  const close = roundToTwoDecimals(currentPrice * (1 + changePercentage));

  const patternType = Math.random();
  let high, low;
  if (patternType < 0.15) {
    // Marubozu pattern
    high = Math.max(currentPrice, close);
    low = Math.min(currentPrice, close);
  } else if (patternType < 0.3) {
    // hammer pattern
    high = Math.max(currentPrice, close);
    low = Math.min(currentPrice, close) - Math.random() * 2;
  } else if (patternType < 0.45) {
    // Inverted hammer pattern
    high = Math.max(currentPrice, close) + Math.random() * 2;
    low = Math.min(currentPrice, close);
  } else if (patternType < 0.6) {
    // Shooting star pattern
    high = Math.max(currentPrice, close) + Math.random() * 2;
    low = Math.min(currentPrice, close) - Math.random();
  } else {
    if (Math.random() < 0.5) {
      high = close + Math.random() * 4; // Long bulish candle
      low = close - Math.random() * 2;
    } else {
      high = close + Math.random() * 2;
      low = close - Math.random() * 4; // Long bearish candle
    }
  }

  high = roundToTwoDecimals(high);
  low = roundToTwoDecimals(low);

  const timestamp = now.toISOString();
  const time = now.getTime() / 1000;
  const lastItem = stock.dayTimeSeries[stock.dayTimeSeries.length - 1];

  if (!lastItem || now - new Date(lastItem.timestamp) > 1 * 60 * 1000) {
    stock.dayTimeSeries.push({
      timestamp,
      time,
      _internal_originalTime: time,
      open: roundToTwoDecimals(currentPrice),
      high,
      low,
      close: roundToTwoDecimals(close),
    });
  } else {
    const updateHigh = Math.max(lastItem.high, close + Math.random() * 1);
    const updateLow = Math.min(lastItem.low, close - Math.random() * 1);
    const updateCandle = {
      high: roundToTwoDecimals(updateHigh),
      low: roundToTwoDecimals(updateLow),
      close: roundToTwoDecimals(close),
      open: lastItem.open,
      timestamp: lastItem.timestamp,
      time: lastItem.time,
      _internal_originalTime: lastItem._internal_originalTime,
    };
    stock.dayTimeSeries[stock.dayTimeSeries.length - 1] = updateCandle;
  }

  stock.dayTimeSeries = stock.dayTimeSeries.slice(-390); // Keep only last 390 entries (6.5 hours of trading at 1-min intervals)
  stock.currentPrice = roundToTwoDecimals(close);
  try {
    await stock.save();
  } catch (error) {
    console.log("skipping conflict error", error);
  }
};

const store10Min = async (symbol) => {
  const stock = await Stock.findOne({ symbol });
  if (!stock) {
    throw new NotFoundError(`Stock with symbol ${symbol} not found`);
  }

  const now = new Date();
  const currentPrice = stock.currentPrice;
  const lastItem = stock.tenMinTimeSeries[stock.tenMinTimeSeries.length - 1];
  const timestamp = now.toISOString();
  const time = now.getTime() / 1000;

  stock.tenMinTimeSeries.push({
    timestamp,
    time,
    _internal_originalTime: time,
    open: roundToTwoDecimals(currentPrice),
    high: roundToTwoDecimals(lastItem.high),
    low: roundToTwoDecimals(lastItem.low),
    close: roundToTwoDecimals(lastItem.close),
  });

  try {
    await stock.save();
  } catch (error) {
    console.log("skipping conflict error", error);
  }
};

export { generateStockData, store10Min };
