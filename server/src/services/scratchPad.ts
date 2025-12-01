
interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  clear(): void;
}

const getLocalStorage = (): StorageLike | null => {
  const scope = globalThis as unknown as { localStorage?: StorageLike };
  return scope?.localStorage ?? null;
};

export const ScratchPad = {
  save: (key: string, data: any) => {
    const storage = getLocalStorage();
    if (!storage) return;
    try {
      storage.setItem(`SENTINEL_DATA_${key}`, JSON.stringify(data));
    } catch (e) {
      console.warn("ScratchPad Save Failed", e);
    }
  },
  load: (key: string) => {
    const storage = getLocalStorage();
    if (!storage) return null;
    try {
      const item = storage.getItem(`SENTINEL_DATA_${key}`);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  },
  clear: () => {
    const storage = getLocalStorage();
    storage?.clear();
  }
};
