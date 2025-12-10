
import React from 'react';
import { FeatureFlags } from '../../services/featureFlags';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({ feature, children, fallback = null }) => {
  const enabled = FeatureFlags.isEnabled(feature);
  
  if (enabled) {
    return <>{children}</>;
  }
  
  return <>{fallback}</>;
};
