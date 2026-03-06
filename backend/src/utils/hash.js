import crypto from "node:crypto";
import stableStringify from "json-stable-stringify";

export function canonicalizeData(payload) {
  return stableStringify(payload);
}

export function computeSha256(payload) {
  return crypto.createHash("sha256").update(payload).digest("hex");
}

export function hashPayload(payload) {
  const canonical = canonicalizeData(payload);
  return {
    canonical,
    hash: computeSha256(canonical)
  };
}
