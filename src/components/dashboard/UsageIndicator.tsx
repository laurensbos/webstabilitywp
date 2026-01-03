'use client';

import Link from 'next/link';
import styles from './UsageIndicator.module.css';

interface UsageIndicatorProps {
  current: number;
  max: number;
  label: string;
  planName: string;
  showUpgrade?: boolean;
}

export function UsageIndicator({ current, max, label, planName, showUpgrade = true }: UsageIndicatorProps) {
  const percentage = Math.min((current / max) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={`${styles.count} ${isAtLimit ? styles.atLimit : isNearLimit ? styles.nearLimit : ''}`}>
          {current}/{max}
        </span>
      </div>
      <div className={styles.progressBar}>
        <div 
          className={`${styles.progress} ${isAtLimit ? styles.progressAtLimit : isNearLimit ? styles.progressNearLimit : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showUpgrade && isNearLimit && (
        <Link href="/dashboard/settings?tab=billing" className={styles.upgradeLink}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {isAtLimit ? 'Limiet bereikt - Upgrade naar meer' : `Bijna vol - Upgrade ${planName === 'free' ? 'naar Pro' : 'je plan'}`}
        </Link>
      )}
    </div>
  );
}
