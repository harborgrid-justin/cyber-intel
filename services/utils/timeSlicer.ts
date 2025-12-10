
/**
 * SHOCKING PRACTICE: Time Slicing Generator
 * Breaks massive synchronous loops into chunks, yielding to the main thread
 * to allow frame rendering (keeping UI responsive).
 */
export async function* timeSlicingGenerator<T>(items: T[], batchSize = 50) {
  for (let i = 0; i < items.length; i += batchSize) {
    // Yield a chunk of work
    yield items.slice(i, i + batchSize);
    
    // Force a task switch to let the browser paint
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}

export async function runHeavyTask<T, R>(
  items: T[], 
  processor: (chunk: T[]) => R[], 
  onProgress?: (progress: number) => void
): Promise<R[]> {
  let results: R[] = [];
  const total = items.length;
  let processed = 0;

  for await (const chunk of timeSlicingGenerator(items)) {
    const chunkResults = processor(chunk);
    results = results.concat(chunkResults);
    processed += chunk.length;
    if (onProgress) onProgress(Math.round((processed / total) * 100));
  }

  return results;
}
