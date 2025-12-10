
import React from 'react';
import { Badge } from './ui/Badge';

interface SeverityBadgeProps {
  level: string;
  className?: string;
  outline?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ level, className = '' }) => {
  const normalized = (level || 'UNKNOWN').toUpperCase();
  let color: any = 'slate';
  if (['CRITICAL', 'RISK', 'BLOCKED'].includes(normalized)) color = 'red';
  else if (['HIGH', 'WARNING', 'FAIL'].includes(normalized)) color = 'orange';
  else if (['MEDIUM', 'SUSPICIOUS'].includes(normalized)) color = 'yellow';
  else if (['LOW', 'INFO', 'SAFE', 'ONLINE', 'ACTIVE', 'SECURE'].includes(normalized)) color = 'green';
  else if (['OPEN', 'NEW', 'INVESTIGATING'].includes(normalized)) color = 'blue';
  
  return <Badge color={color} className={className}>{level}</Badge>;
};
