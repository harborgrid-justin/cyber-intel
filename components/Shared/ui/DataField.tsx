import React from 'react';
import { EXECUTIVE_THEME } from '../../../styles/theme';

export const DataField: React.FC<{ label: string; value: React.ReactNode; mono?: boolean; className?: string }> = ({ label, value, mono = false, className = '' }) => (
  <div className={`flex flex-col min-w-0 ${className}`}>
    <span className={`${EXECUTIVE_THEME.typography.mono_label} truncate`}>{label}</span>
    <div className={`${mono ? EXECUTIVE_THEME.typography.mono_code : 'text-sm text-white'} mt-0.5 transition-colors truncate`}>{value || '-'}</div>
  </div>
);
