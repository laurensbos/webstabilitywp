'use client';

import styles from './Sparkline.module.css';

interface SparklineProps {
  data: number[];
  color?: 'green' | 'blue' | 'orange' | 'red';
  height?: number;
  showDot?: boolean;
}

export function Sparkline({ data, color = 'green', height = 24, showDot = true }: SparklineProps) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const width = 80;
  const padding = 2;
  const effectiveWidth = width - padding * 2;
  const effectiveHeight = height - padding * 2;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * effectiveWidth;
    const y = padding + effectiveHeight - ((value - min) / range) * effectiveHeight;
    return `${x},${y}`;
  }).join(' ');

  const lastPoint = {
    x: padding + effectiveWidth,
    y: padding + effectiveHeight - ((data[data.length - 1] - min) / range) * effectiveHeight
  };

  // Create area path
  const areaPath = `M ${padding},${padding + effectiveHeight} L ${points} L ${padding + effectiveWidth},${padding + effectiveHeight} Z`;

  return (
    <svg 
      className={`${styles.sparkline} ${styles[color]}`} 
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      {/* Gradient */}
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className={styles.gradientStart} />
          <stop offset="100%" className={styles.gradientEnd} />
        </linearGradient>
      </defs>
      
      {/* Area */}
      <path 
        d={areaPath}
        className={styles.area}
        fill={`url(#gradient-${color})`}
      />
      
      {/* Line */}
      <polyline
        points={points}
        className={styles.line}
        fill="none"
      />
      
      {/* Last point dot */}
      {showDot && (
        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="3"
          className={styles.dot}
        />
      )}
    </svg>
  );
}

// Mini uptime bars
interface UptimeBarsProps {
  checks: Array<{ isUp: boolean; responseTime?: number }>;
  maxBars?: number;
}

export function UptimeBars({ checks, maxBars = 30 }: UptimeBarsProps) {
  const displayChecks = checks.slice(-maxBars);
  
  return (
    <div className={styles.uptimeBars}>
      {displayChecks.map((check, i) => (
        <div 
          key={i}
          className={`${styles.uptimeBar} ${check.isUp ? styles.up : styles.down}`}
          title={check.isUp ? `Online${check.responseTime ? ` (${check.responseTime}ms)` : ''}` : 'Offline'}
        />
      ))}
    </div>
  );
}
