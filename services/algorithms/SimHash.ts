
export class SimHash {
  static compute(text: string): number {
    const tokens = text.toLowerCase().split(/\W+/);
    const v = new Int32Array(32);

    tokens.forEach(token => {
      let hash = this.hash32(token);
      for (let i = 0; i < 32; i++) {
        if ((hash >> i) & 1) v[i]++;
        else v[i]--;
      }
    });

    let fingerprint = 0;
    for (let i = 0; i < 32; i++) {
      if (v[i] > 0) fingerprint |= (1 << i);
    }
    return fingerprint;
  }

  static similarity(a: number, b: number): number {
    let x = a ^ b;
    let dist = 0;
    while (x) {
      dist++;
      x &= x - 1; // Clear least significant bit set
    }
    // 32 bits, similarity = 1 - (hamming_dist / 32)
    return 1 - (dist / 32);
  }

  private static hash32(str: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
  }
}
