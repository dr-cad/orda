import type { Request } from "express";
import type { RateLimitInfo } from "express-rate-limit";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import { combineMiddleware } from ".";

// 100 requests per day
const maxDay = 100;
// 20 requests per hour
const maxHour = 10;
// 25 requests per day slow down
const slowDay = 25;

const getMessage = (req: Request, limit: number, w: "d" | "h") => {
  let message = "";
  const day = (req as any).limiterDay as RateLimitInfo;
  const ly = w === "d" ? "daily " : w === "h" ? "hourly " : undefined;
  message += `You have already spend your ${limit} ${ly} credits. `;
  if (day) {
    const remainingTillSlow = day.remaining - maxDay + slowDay + 1;
    if (remainingTillSlow > 0) message += `${remainingTillSlow} credits left for today. `;
  }
  message += "Upgrade Pro to bypass limits and get 500+ daily credits and faster processing.";
  return message;
};

const limiterDay = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: maxDay,
  handler: (req, res, next, options) => {
    res.status(options.statusCode).send({ error: getMessage(req, maxDay, "d") });
  },
  requestPropertyName: "limiterDay",
});

const limiterHour = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: maxHour,
  handler: (req, res, next, options) => {
    res.status(options.statusCode).send({ error: getMessage(req, maxHour, "h") });
  },
  requestPropertyName: "limiterHour",
});

const slowdownDay = slowDown({
  windowMs: 24 * 60 * 60 * 1000,
  delayAfter: slowDay,
  delayMs: () => 10_000,
});

export const aiLimiter = combineMiddleware([limiterDay, limiterHour, slowdownDay]);
