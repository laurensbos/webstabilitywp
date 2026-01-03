'use client';

import styles from './Skeleton.module.css';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'stat';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function Skeleton({ variant = 'text', width, height, count = 1 }: SkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'stat') {
    return (
      <div className={styles.statCard}>
        <div className={styles.statIcon}>
          <div className={`${styles.skeleton} ${styles.circular}`} style={{ width: 40, height: 40 }} />
        </div>
        <div className={styles.statContent}>
          <div className={`${styles.skeleton} ${styles.text}`} style={{ width: '60%', height: 14 }} />
          <div className={`${styles.skeleton} ${styles.text}`} style={{ width: '80%', height: 28, marginTop: 8 }} />
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={`${styles.skeleton} ${styles.circular}`} style={{ width: 40, height: 40 }} />
          <div className={styles.cardHeaderText}>
            <div className={`${styles.skeleton} ${styles.text}`} style={{ width: '70%', height: 16 }} />
            <div className={`${styles.skeleton} ${styles.text}`} style={{ width: '50%', height: 12, marginTop: 6 }} />
          </div>
        </div>
        <div className={styles.cardBody}>
          <div className={`${styles.skeleton} ${styles.text}`} style={{ width: '90%', height: 14 }} />
          <div className={`${styles.skeleton} ${styles.text}`} style={{ width: '60%', height: 14, marginTop: 8 }} />
        </div>
      </div>
    );
  }

  return (
    <>
      {items.map((i) => (
        <div
          key={i}
          className={`${styles.skeleton} ${styles[variant]}`}
          style={{
            width: width ?? (variant === 'text' ? '100%' : 40),
            height: height ?? (variant === 'text' ? 16 : 40),
            marginBottom: count > 1 ? 8 : 0,
          }}
        />
      ))}
    </>
  );
}

// Stat cards skeleton
export function StatsSkeleton() {
  return (
    <div className={styles.statsGrid}>
      <Skeleton variant="stat" />
      <Skeleton variant="stat" />
      <Skeleton variant="stat" />
      <Skeleton variant="stat" />
    </div>
  );
}

// Sites list skeleton
export function SitesSkeleton() {
  return (
    <div className={styles.sitesList}>
      {[1, 2, 3].map((i) => (
        <div key={i} className={styles.siteRow}>
          <div className={styles.siteInfo}>
            <div className={`${styles.skeleton} ${styles.circular}`} style={{ width: 36, height: 36 }} />
            <div>
              <div className={`${styles.skeleton} ${styles.text}`} style={{ width: 140, height: 16 }} />
              <div className={`${styles.skeleton} ${styles.text}`} style={{ width: 200, height: 12, marginTop: 4 }} />
            </div>
          </div>
          <div className={styles.siteStats}>
            <div className={`${styles.skeleton} ${styles.text}`} style={{ width: 60, height: 16 }} />
            <div className={`${styles.skeleton} ${styles.text}`} style={{ width: 80, height: 16 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
