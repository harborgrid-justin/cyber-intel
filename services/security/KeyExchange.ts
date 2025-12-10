export class KeyExchange {
  private keyPair: CryptoKeyPair | null = null;

  async generateKeyPair() {
    this.keyPair = await window.crypto.subtle.generateKey(
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      ['deriveKey']
    );
    return this.keyPair.publicKey;
  }

  async deriveSharedSecret(peerPublicKey: CryptoKey) {
    if (!this.keyPair) throw new Error("Key pair not generated");
    
    return await window.crypto.subtle.deriveKey(
      { name: 'ECDH', public: peerPublicKey },
      this.keyPair.privateKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Helper to export for transmission
  static async exportKey(key: CryptoKey): Promise<JsonWebKey> {
      return await window.crypto.subtle.exportKey('jwk', key);
  }
  
  // Helper to import peer key
  static async importKey(jwk: JsonWebKey): Promise<CryptoKey> {
      return await window.crypto.subtle.importKey(
          'jwk', jwk, { name: 'ECDH', namedCurve: 'P-256' }, true, []
      );
  }
}