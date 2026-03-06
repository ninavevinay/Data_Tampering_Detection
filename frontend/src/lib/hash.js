export async function computeFileHash(file) {
  const arrayBuffer = await file.arrayBuffer();
  // Use SubtleCrypto to hash the file directly on the client
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // Convert array of bytes to a hex string
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}
