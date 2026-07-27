import crypto from "node:crypto";

const encode = (value) => Buffer.from(value).toString("base64url");

export function createSession() {
  const payload = encode(JSON.stringify({ role: "commissioner", exp: Date.now() + 1000 * 60 * 60 * 24 * 7 }));
  const signature = crypto.createHmac("sha256", process.env.SESSION_SECRET).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function isAuthorized(request) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = crypto.createHmac("sha256", process.env.SESSION_SECRET).update(payload).digest("base64url");
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString());
    return decoded.role === "commissioner" && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

export function passwordMatches(candidate = "") {
  const expected = process.env.COMMISSIONER_PASSWORD || "";
  const a = Buffer.from(String(candidate));
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
