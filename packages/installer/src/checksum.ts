import * as crypto from "crypto";

export async function verifyChecksum(data: Buffer, expectedChecksum: string): Promise<boolean> {
  const hash = crypto.createHash("sha256").update(data).digest("hex");
  return hash === expectedChecksum;
}

export async function calculateChecksum(data: Buffer): Promise<string> {
  return crypto.createHash("sha256").update(data).digest("hex");
}
