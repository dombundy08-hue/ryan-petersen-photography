/**
 * Password hashing for the admin portal — scrypt from Node's own crypto, no
 * dependency. Shared by the admin function (netlify/admin-core.mjs) and the
 * command-line helper that makes a hash (scripts/admin-password.mjs).
 *
 * Stored form: scrypt$N$r$p$<salt base64>$<key base64>. The parameters travel
 * with the hash, so they can be raised later without breaking old hashes.
 */
import crypto from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(crypto.scrypt);

// N = 2^15 costs ~32 MB and ~100 ms per check: slow enough to make guessing
// pointless, fast enough that signing in doesn't feel slow.
const PARAMS = { N: 32768, r: 8, p: 1 };
const MAXMEM = 64 * 1024 * 1024;
const KEY_LENGTH = 32;

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password, salt, KEY_LENGTH, { ...PARAMS, maxmem: MAXMEM });
  return ["scrypt", PARAMS.N, PARAMS.r, PARAMS.p, salt.toString("base64"), key.toString("base64")].join("$");
}

export async function verifyPassword(password, stored) {
  try {
    const [algorithm, N, r, p, salt, hash] = String(stored).split("$");
    if (algorithm !== "scrypt") return false;
    const expected = Buffer.from(hash, "base64");
    const key = await scrypt(String(password), Buffer.from(salt, "base64"), expected.length, {
      N: Number(N),
      r: Number(r),
      p: Number(p),
      maxmem: MAXMEM,
    });
    return crypto.timingSafeEqual(key, expected);
  } catch {
    return false;
  }
}
