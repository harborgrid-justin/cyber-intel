export const ScratchPad = {
  save: (key: string, data: any) => {
    try {
      localStorage.setItem(`SYNAPSE_DATA_${key}`, JSON.stringify(data));
    } catch (e) {
      console.warn("ScratchPad Save Failed", e);
    }
  },
  load: (key: string) => {
    try {
      const item = localStorage.getItem(`SYNAPSE_DATA_${key}`);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  },
  clear: () => {
    localStorage.clear();
  }
};