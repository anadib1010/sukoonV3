// ─── ECDH + AES-GCM SECURITY KIT ──────────────────────────────────────────
export const SecurityKit = {
  generateKeys: async () => {
    return await window.crypto.subtle.generateKey(
      { name: "ECDH", namedCurve: "P-256" }, true, ["deriveKey", "deriveBits"]
    );
  },
  exportPublicKey: async (publicKey) => {
    const exported = await window.crypto.subtle.exportKey("spki", publicKey);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  },
  importPublicKey: async (base64) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return await window.crypto.subtle.importKey(
      "spki", bytes, { name: "ECDH", namedCurve: "P-256" }, true, []
    );
  },
  exportPrivateKeyToVault: async (privateKey) => {
    const jwk = await window.crypto.subtle.exportKey("jwk", privateKey);
    return JSON.stringify(jwk);
  },
  importPrivateKeyFromVault: async (jwkString) => {
    const jwk = JSON.parse(jwkString);
    return await window.crypto.subtle.importKey(
      "jwk", jwk, { name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]
    );
  },
  deriveSecretBits: async (myPrivateKey, theirPublicKey) => {
    return await window.crypto.subtle.deriveBits(
      { name: "ECDH", public: theirPublicKey }, myPrivateKey, 256
    );
  },
  createAESKey: async (sharedSecretBits) => {
    return await window.crypto.subtle.importKey(
      "raw", sharedSecretBits, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]
    );
  },
  encryptText: async (text, aesKey) => {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(text);
    const cipherText = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, encoded);
    return {
      cipherText: btoa(String.fromCharCode(...new Uint8Array(cipherText))),
      iv: btoa(String.fromCharCode(...new Uint8Array(iv)))
    };
  },
  decryptText: async (cipherText64, iv64, aesKey) => {
    try {
      const cipherText = new Uint8Array(atob(cipherText64).split('').map(c => c.charCodeAt(0)));
      const iv = new Uint8Array(atob(iv64).split('').map(c => c.charCodeAt(0)));
      const decrypted = await window.crypto.subtle.decrypt({ name: "AES-GCM", iv }, aesKey, cipherText);
      return new TextDecoder().decode(decrypted);
    } catch (e) { return null; }
  }
};

// ─── XOR LEGACY FALLBACK ───────────────────────────────────────────────────
export const decryptXORFallback = (scrambled, key) => {
  try {
    const keyStr = String(key);
    return decodeURIComponent(
      atob(scrambled).split('').map((char, i) =>
        String.fromCharCode(char.charCodeAt(0) ^ keyStr.charCodeAt(i % keyStr.length))
      ).join('')
    );
  } catch (e) { return scrambled; }
};