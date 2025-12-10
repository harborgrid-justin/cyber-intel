
import { useState } from 'react';

export const useSecureClipboard = () => {
  const [copied, setCopied] = useState(false);

  const copySecurely = async (text: string) => {
    // Defang typical IOCs to prevent accidental clicks when pasted
    const safeText = text
      .replace('http:', 'hXXp:')
      .replace('https:', 'hXXps:')
      .replace('.', '[.]');

    try {
      await navigator.clipboard.writeText(safeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      console.log('[Audit] Secure copy to clipboard performed.');
    } catch (err) {
      console.error('Clipboard failed', err);
    }
  };

  return { copied, copySecurely };
};
