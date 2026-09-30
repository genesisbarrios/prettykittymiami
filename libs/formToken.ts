import { createHmac, timingSafeEqual } from "crypto";

// Server-signed "form loaded at" token. The old timing trap trusted a
// formLoadedAt timestamp the browser sent, which a bot posting straight to
// /api/crm/contact can simply fake. This token is minted by our own server
// (GET /api/crm/form-token) when the form mounts, so a submission has to
// carry a token we signed at least MIN_AGE_MS earlier.
//
// Signed with FORM_TOKEN_SECRET, falling back to ADMIN_PASSWORD so it works
// without adding a new env var — both are server-only.
const SECRET = process.env.FORM_TOKEN_SECRET || process.env.ADMIN_PASSWORD || "";

const MIN_AGE_MS = 4_000;
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

function sign(issuedAt: number) {
  return createHmac("sha256", SECRET).update(`form:${issuedAt}`).digest("hex");
}

export function isFormTokenEnabled() {
  return SECRET !== "";
}

export function createFormToken() {
  const issuedAt = Date.now();
  return `${issuedAt}.${sign(issuedAt)}`;
}

export function isValidFormToken(token: unknown) {
  if (typeof token !== "string") return false;
  const [issuedAtRaw, signature] = token.split(".");
  const issuedAt = Number(issuedAtRaw);
  if (!issuedAt || !signature) return false;

  const age = Date.now() - issuedAt;
  if (age < MIN_AGE_MS || age > MAX_AGE_MS) return false;

  const expected = Buffer.from(sign(issuedAt), "hex");
  const actual = Buffer.from(signature, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
