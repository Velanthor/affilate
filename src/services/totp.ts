import crypto from "crypto";

/**
 * RFC 6238 compliant TOTP implementation using only Node's built-in crypto.
 * Used for optional two-factor authentication on affiliate accounts.
 */

function base32Encode(buffer: Buffer): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  let output = "";
  for (const byte of buffer) bits += byte.toString(2).padStart(8, "0");
  for (let i = 0; i + 5 <= bits.length; i += 5) {
    output += alphabet[parseInt(bits.substring(i, i + 5), 2)];
  }
  return output;
}

function base32Decode(encoded: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = encoded.toUpperCase().replace(/=+$/, "");
  let bits = "";
  for (const char of clean) {
    const idx = alphabet.indexOf(char);
    if (idx === -1) continue;
    bits += idx.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

export function generateTotpSecret(): string {
  return base32Encode(crypto.randomBytes(20));
}

function hotp(secret: Buffer, counter: number): string {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", secret).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (code % 1_000_000).toString().padStart(6, "0");
}

export function generateTotpCode(base32Secret: string, stepSeconds = 30, forTime = Date.now()): string {
  const counter = Math.floor(forTime / 1000 / stepSeconds);
  return hotp(base32Decode(base32Secret), counter);
}

/**
 * Verifies a submitted TOTP code, allowing +-1 time step of clock drift.
 */
export function verifyTotpCode(base32Secret: string, submittedCode: string, stepSeconds = 30): boolean {
  const now = Date.now();
  for (const drift of [-1, 0, 1]) {
    const candidate = generateTotpCode(base32Secret, stepSeconds, now + drift * stepSeconds * 1000);
    if (crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(submittedCode.padStart(6, "0")))) {
      return true;
    }
  }
  return false;
}

export function buildOtpAuthUrl(email: string, base32Secret: string): string {
  const issuer = encodeURIComponent("VELANTHOR");
  const label = encodeURIComponent(email);
  return `otpauth://totp/${issuer}:${label}?secret=${base32Secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
}
