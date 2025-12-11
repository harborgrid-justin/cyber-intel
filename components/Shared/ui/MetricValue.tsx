
import React from 'react';
import { EXECUTIVE_THEME } from '../../../styles/theme';

export const MetricValue: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`${EXECUTIVE_THEME.typography.value_huge} ${className}`}>{children}</div>
);
