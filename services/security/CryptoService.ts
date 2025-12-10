
export class CryptoService {
  private static ALGO = { name: 'AES-GCM', length: 256 };

  static async generateKey(): Promise<CryptoKey> {
    return window.crypto.subtle.generateKey(this.ALGO, true, ['encrypt', 'decrypt']);
  }

  static async encrypt(data: string, key: CryptoKey): Promise<{ cipher: ArrayBuffer; iv: Uint8Array }> {
    const encoded = new TextEncoder().encode(data);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const cipher = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );
    return { cipher, iv };
  }

  static async decrypt(cipher: ArrayBuffer, iv: Uint8Array, key: CryptoKey): Promise<string> {
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      cipher
    );
    return new TextDecoder().decode(decrypted);
  }
  
  static async exportKey(key: CryptoKey): Promise<JsonWebKey> {
      return await window.crypto.subtle.exportKey('jwk', key);
  }
}
