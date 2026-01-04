'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardHeader, CardTitle } from '@/components/ui';
import styles from './UptimeChart.module.css';

interface UptimeCheck {
  id: string;
  checkedAt: Date | null;
  responseTime: number | null;
  isUp: boolean;
}

interface UptimeChartProps {
  checks: UptimeCheck[];
}

export function UptimeChart({ checks }: UptimeChartProps) {
  const data = checks
    .slice()
    .reverse()
    .map((check) => ({
      time: check.checkedAt ? new Date(check.checkedAt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) : '',
      responseTime: check.responseTime || 0,
      status: check.isUp ? 1 : 0,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Time</CardTitle>
      </CardHeader>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}ms`}
            />
            <Tooltip
              contentStyle={{
                background: '#1e293b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white',
              }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(value) => [`${value}ms`, 'Response Time']}
            />
            <Area
              type="monotone"
              dataKey="responseTime"
              stroke="#6366f1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorResponse)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
