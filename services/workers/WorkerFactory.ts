
export const createWorker = (fn: Function) => {
  const blob = new Blob([`self.onmessage = function(e) { 
    const result = (${fn.toString()})(e.data);
    self.postMessage(result);
  }`], { type: 'application/javascript' });
  
  return new Worker(URL.createObjectURL(blob));
};

// Example heavy task for the worker
export const heavySimHashTask = (data: { items: string[] }) => {
  // Mini SimHash impl inside worker scope
  const hash = (s: string) => {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 0x01000193);
    return h >>> 0;
  };
  
  return data.items.map(text => {
    const v = new Int32Array(32);
    text.split(/\W+/).forEach(t => {
       const h = hash(t);
       for(let i=0; i<32; i++) (h >> i) & 1 ? v[i]++ : v[i]--;
    });
    let fp = 0;
    for(let i=0; i<32; i++) if(v[i]>0) fp |= (1<<i);
    return fp;
  });
};
