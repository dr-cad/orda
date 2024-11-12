import type { RateLimitInfo } from "express-rate-limit";

export {};

declare global {
  namespace Express {
    interface Request {
      context: {
        limiterDay?: Partial<RateLimitInfo>;
        limiterHour?: Partial<RateLimitInfo>;
        limiterMinute?: Partial<RateLimitInfo>;
      };
    }
  }
}
