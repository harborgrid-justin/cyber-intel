
export const Formatters = {
  currency: (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val),
  date: (val: string | Date) => new Date(val).toLocaleDateString(),
  dateTime: (val: string | Date) => new Date(val).toLocaleString(),
  fileSize: (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
  truncate: (str: string, len: number) => str.length > len ? str.substring(0, len) + '...' : str
};
