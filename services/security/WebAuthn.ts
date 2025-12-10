
export class WebAuthnService {
  static isAvailable(): boolean {
    return !!(window.PublicKeyCredential);
  }

  static async register() {
    // Simulation: In prod, fetch options from server
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);
    
    const publicKey: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: { name: 'Sentinel Core', id: window.location.hostname },
      user: {
        id: new Uint8Array(16),
        name: 'admin',
        displayName: 'Sentinel Admin'
      },
      pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
      authenticatorSelection: { authenticatorAttachment: 'platform' },
      timeout: 60000,
      attestation: 'direct'
    };

    try {
      const cred = await navigator.credentials.create({ publicKey });
      return !!cred;
    } catch (e) {
      console.warn("WebAuthn Registration Failed/Cancelled", e);
      return false;
    }
  }

  static async authenticate() {
    // Simulation
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    try {
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          rpId: window.location.hostname,
          userVerification: "required",
        }
      });
      return !!assertion;
    } catch (e) {
      console.warn("WebAuthn Auth Failed/Cancelled", e);
      return false;
    }
  }
}
