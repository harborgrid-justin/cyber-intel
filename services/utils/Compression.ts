
// Augment global types if missing in TS lib
declare class CompressionStream {
    constructor(format: 'gzip' | 'deflate' | 'deflate-raw');
    readable: ReadableStream;
    writable: WritableStream;
}

declare class DecompressionStream {
    constructor(format: 'gzip' | 'deflate' | 'deflate-raw');
    readable: ReadableStream;
    writable: WritableStream;
}

export class CompressionService {
  static async compress(input: string): Promise<ArrayBuffer> {
    if (!('CompressionStream' in window)) {
        return new TextEncoder().encode(input).buffer as ArrayBuffer;
    }

    const stream = new Blob([input]).stream();
    const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
    return await new Response(compressedStream).arrayBuffer();
  }

  static async decompress(buffer: ArrayBuffer): Promise<string> {
    if (!('DecompressionStream' in window)) {
        return new TextDecoder().decode(buffer);
    }

    const stream = new Blob([buffer]).stream();
    const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
    return await new Response(decompressedStream).text();
  }
}
