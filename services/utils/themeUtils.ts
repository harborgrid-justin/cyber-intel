
export interface FlatToken {
  key: string;
  value: string;
  group: string;
}

// Helper: Safely flattens nested token objects into UI-friendly array
export const flattenTokens = (obj: any, prefix = ''): FlatToken[] => {
    if (!obj || typeof obj !== 'object') return [];

    return Object.keys(obj).reduce((acc: FlatToken[], k: string) => {
        const pre = prefix.length ? `${prefix}-` : '';
        const group = prefix.split('-')[0] || k; // Use top-level key as group
        
        // Check if current property is a nested object (and not null/array)
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
            return acc.concat(flattenTokens(obj[k], pre + k));
        } 
        
        // It's a leaf node (value)
        return acc.concat({ 
            key: pre + k, 
            value: String(obj[k] || ''), // Force string to prevent .startsWith crashes
            group 
        });
    }, []);
};

// Helper: Reconstructs nested object from flat array
export const unflattenTokens = (flat: FlatToken[]) => {
    const result: any = {};
    flat.forEach(({ key, value }) => {
        const parts = key.split('-');
        let current = result;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            // If last part, assign value
            if (i === parts.length - 1) {
                current[part] = value;
            } else {
                // Ensure intermediate object exists
                current[part] = current[part] || {};
                current = current[part];
            }
        }
    });
    return result;
};
