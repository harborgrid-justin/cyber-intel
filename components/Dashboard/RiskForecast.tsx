
import React from 'react';
import { Card, CardHeader } from '../Shared/UI';
import { threatData } from '../../services/dataLayer';
import { useDataStore } from '../../hooks/useDataStore';
import { TOKENS } from '../../styles/theme';

export const RiskForecast: React.FC = () => {
  const forecast = useDataStore(() => threatData.getRiskForecast());

  const getRiskColorName = (risk: number): string => {
    switch (risk) {
      case 4: return 'error'; // Critical
      case 3: return 'warning'; // High
      case 2: return 'info'; // Elevated
      default: return 'success'; // Low
    }
  };

  return (
    <Card className="p-0 overflow-hidden">
      <CardHeader title="7-Day Predictive Risk Forecast" />
      <div className="p-4 grid grid-cols-7 gap-2">
        {forecast.map((d, i) => {
          const colorName = getRiskColorName(d.risk);
          return (
            <div key={i} className="flex flex-col items-center gap-2 group cursor-help">
                <div className={`text-[10px] text-[var(--colors-textSecondary)] uppercase font-bold`}>{d.day}</div>
                <div 
                    className={`w-full h-12 rounded transition-all duration-300 group-hover:scale-105 shadow-sm border-2 bg-[var(--colors-${colorName}Dim)] border-[var(--colors-${colorName})]`}
                />
                <div className={`text-[9px] font-mono text-[var(--colors-textTertiary)] opacity-0 group-hover:opacity-100 transition-opacity`}>{d.label}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};