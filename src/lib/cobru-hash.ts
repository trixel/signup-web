import { createHmac } from "crypto";

const DEFAULT_HASH_KEY =
  "e58a219892b0795a629b84a1279ea4702581c0cacfb1b2432327a080";

function getCobruHashKey(): string {
  return process.env.COBRU_HASH_KEY ?? DEFAULT_HASH_KEY;
}

/** Firma HMAC-SHA1 para subida de archivos a Cobru (`file_type`). */
export function getHashKey(fileType = ""): string {
  const dateNow = new Date().toISOString().split("T")[0];
  const hashKey = getCobruHashKey();
  const dataToSign = `${dateNow}-${hashKey}-${fileType}`;

  return createHmac("sha1", hashKey).update(dataToSign).digest("hex");
}
