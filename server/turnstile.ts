import dotenv from "dotenv";

dotenv.config({ path: [".env.local", ".env"] });

const secret = process.env.TURNSTILE_SECRET!;

export default async function turnstileVerify(token: string, ip: string) {
  // Validate the token by calling the
  // "/siteverify" API endpoint.
  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", token);
  formData.append("remoteip", ip);

  const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const res = await axios.post<{ success: boolean }>(url, formData);
  return res.data?.success;
}
