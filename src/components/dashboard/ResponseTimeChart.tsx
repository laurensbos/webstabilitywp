'use client';

import { memo, useMemo } from 'react';
import styles from './ResponseTimeChart.module.css';

interface DataPoint {
  value: number;
  timestamp?: Date;
}

interface ResponseTimeChartProps {
  data: DataPoint[] | number[];
  height?: number;
  showAxis?: boolean;
  accentColor?: string;
}

function ResponseTimeChartComponent({ 
  data, 
  height = 80,
  showAxis = false,
  accentColor = '#6366f1'
}: ResponseTimeChartProps) {
  const normalizedData = useMemo(() => {
    return data.map(d => typeof d === 'number' ? d : d.value);
  }, [data]);

  const { min, max, avg, path, areaPath } = useMemo(() => {
    if (normalizedData.length === 0) {
      return { min: 0, max: 0, avg: 0, path: '', areaPath: '' };
    }

    const values = normalizedData.filter(v => v > 0);
    if (values.length === 0) {
      return { min: 0, max: 0, avg: 0, path: '', areaPath: '' };
    }

    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const avgVal = values.reduce((a, b) => a + b, 0) / values.length;
    const range = maxVal - minVal || 1;
    const padding = range * 0.1;
    
    const chartHeight = height - 20;
    const chartWidth = 280;
    const stepX = chartWidth / (normalizedData.length - 1 || 1);

    let pathD = '';
    let areaD = '';
    let firstPoint = true;

    normalizedData.forEach((value, index) => {
      const x = index * stepX;
      const normalizedY = value > 0 
        ? ((value - minVal + padding) / (range + padding * 2)) 
        : 0;
      const y = chartHeight - (normalizedY * chartHeight);

      if (value > 0) {
        if (firstPoint) {
          pathD = `M ${x} ${y}`;
          areaD = `M ${x} ${chartHeight} L ${x} ${y}`;
          firstPoint = false;
        } else {
          // Smooth curve
          const prevX = (index - 1) * stepX;
          const cpX1 = prevX + stepX * 0.5;
          const cpX2 = x - stepX * 0.5;
          pathD += ` C ${cpX1} ${y} ${cpX2} ${y} ${x} ${y}`;
          areaD += ` C ${cpX1} ${y} ${cpX2} ${y} ${x} ${y}`;
        }
      }
    });

    // Close area path
    if (areaD) {
      areaD += ` L ${(normalizedData.length - 1) * stepX} ${chartHeight} Z`;
    }

    return { min: minVal, max: maxVal, avg: Math.round(avgVal), path: pathD, areaPath: areaD };
  }, [normalizedData, height]);

  if (normalizedData.length === 0 || max === 0) {
    return (
      <div className={styles.emptyChart} style={{ height }}>
        <span>Geen data beschikbaar</span>
      </div>
    );
  }

  return (
    <div className={styles.chartContainer} style={{ height }}>
      <svg 
        className={styles.chart} 
        viewBox={`0 0 280 ${height}`}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={accentColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        <path 
          d={areaPath} 
          fill="url(#chartGradient)"
          className={styles.area}
        />
        
        {/* Line */}
        <path 
          d={path} 
          fill="none" 
          stroke={accentColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={styles.line}
        />
      </svg>
      
      {showAxis && (
        <div className={styles.axis}>
          <span>{max}ms</span>
          <span>{min}ms</span>
        </div>
      )}
      
      <div className={styles.legend}>
        <span className={styles.legendValue}>{avg}ms</span>
        <span className={styles.legendLabel}>gemiddeld</span>
      </div>
    </div>
  );
}

export const ResponseTimeChart = memo(ResponseTimeChartComponent);
