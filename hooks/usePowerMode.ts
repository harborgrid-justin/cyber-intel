
import { useState, useEffect } from 'react';

interface PowerState {
  level: number;
  charging: boolean;
  lowPowerMode: boolean; // Derived
}

export const usePowerMode = () => {
  const [power, setPower] = useState<PowerState>({ level: 1, charging: true, lowPowerMode: false });

  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        const update = () => {
          setPower({
            level: battery.level,
            charging: battery.charging,
            lowPowerMode: !battery.charging && battery.level < 0.2
          });
        };
        update();
        battery.addEventListener('levelchange', update);
        battery.addEventListener('chargingchange', update);
      });
    }
  }, []);

  return power;
};
