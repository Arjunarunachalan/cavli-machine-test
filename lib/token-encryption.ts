
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "crypto";

function getEncryptionKey(): Buffer {
  const key = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;

  if (!key) {
    throw new Error("GOOGLE_TOKEN_ENCRYPTION_KEY is missing");
  }

  const buffer = Buffer.from(key, "base64");

  if (buffer.length !== 32) {
    throw new Error("Encryption key must decode to exactly 32 bytes");
  }

  return buffer;
}

export function encryptToken(token: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(".");
}

export function decryptToken(encryptedToken: string): string {
  const [ivEncoded, tagEncoded, dataEncoded] = encryptedToken.split(".");

  if (!ivEncoded || !tagEncoded || !dataEncoded) {
    throw new Error("Invalid encrypted token format");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(ivEncoded, "base64")
  );

  decipher.setAuthTag(Buffer.from(tagEncoded, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataEncoded, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
