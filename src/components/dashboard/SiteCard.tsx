'use client';

import { Site } from '@/lib/db/schema';
import { Card } from '@/components/ui';
import styles from './SiteCard.module.css';
import { ExternalLink, Activity, Clock, Shield } from 'lucide-react';
import Link from 'next/link';

interface SiteCardProps {
  site: Site;
}

export function SiteCard({ site }: SiteCardProps) {
  const statusColor = {
    up: '#6366f1',
    down: '#ef4444',
    unknown: '#94a3b8',
  }[site.currentStatus || 'unknown'];

  const statusLabel = {
    up: 'Online',
    down: 'Offline',
    unknown: 'Onbekend',
  }[site.currentStatus || 'unknown'];

  return (
    <Link href={`/dashboard/sites/${site.id}`} className={styles.link}>
      <Card className={styles.card}>
        <div className={styles.header}>
          <div className={styles.status} style={{ backgroundColor: statusColor }} />
          <div className={styles.info}>
            <h3 className={styles.name}>{site.name}</h3>
            <p className={styles.url}>{site.url}</p>
          </div>
          <ExternalLink className={styles.externalIcon} />
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <Activity className={styles.statIcon} />
            <div>
              <span className={styles.statValue}>{site.uptimePercentage || '100'}%</span>
              <span className={styles.statLabel}>Uptime</span>
            </div>
          </div>

          <div className={styles.stat}>
            <Clock className={styles.statIcon} />
            <div>
              <span className={styles.statValue}>{site.avgResponseTime || '-'}ms</span>
              <span className={styles.statLabel}>Response</span>
            </div>
          </div>

          <div className={styles.stat}>
            <Shield className={styles.statIcon} />
            <div>
              <span className={styles.statValue}>{statusLabel}</span>
              <span className={styles.statLabel}>Status</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
