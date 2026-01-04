'use client';

import { memo } from 'react';
import styles from './UptimeSparkline.module.css';

interface UptimeSparklineProps {
  data: number[]; // Array of uptime percentages (0-100) for each period
  size?: 'sm' | 'md';
}

function UptimeSparklineComponent({ data, size = 'sm' }: UptimeSparklineProps) {
  // Ensure we have 30 data points (last 30 periods)
  const normalizedData = data.length >= 30 
    ? data.slice(-30) 
    : [...Array(30 - data.length).fill(100), ...data];

  const getBarColor = (value: number) => {
    if (value >= 99) return 'var(--sparkline-good)';
    if (value >= 95) return 'var(--sparkline-warning)';
    if (value > 0) return 'var(--sparkline-critical)';
    return 'var(--sparkline-unknown)';
  };

  const getBarClass = (value: number) => {
    if (value >= 99) return styles.barGood;
    if (value >= 95) return styles.barWarning;
    if (value > 0) return styles.barCritical;
    return styles.barUnknown;
  };

  return (
    <div className={`${styles.sparkline} ${size === 'md' ? styles.sparklineMd : ''}`}>
      {normalizedData.map((value, index) => (
        <div
          key={index}
          className={`${styles.bar} ${getBarClass(value)}`}
          style={{ 
            opacity: value === 0 ? 0.3 : 1,
          }}
          title={`${value.toFixed(1)}% uptime`}
        />
      ))}
    </div>
  );
}

export const UptimeSparkline = memo(UptimeSparklineComponent);
