import axios from "axios";
import dotenv from "dotenv";
import type { Request } from "express";

dotenv.config({ path: [".env.local", ".env"] });

const dev = process.env.NODE_ENV === "development";
const secret = process.env.TURNSTILE_SECRET!;

export default async function turnstileVerify(req: Request) {
  if (dev) return true;

  const token = req.body.token;
  const ip = req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"];
  if (!token) return false;

  // Validate the token by calling the
  // "/siteverify" API endpoint.
  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", token);
  if (ip) formData.append("remoteip", Array.isArray(ip) ? ip[0] : ip);

  const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const res = await axios.post<{ success: boolean }>(url, formData);
  return res.data?.success;
}
