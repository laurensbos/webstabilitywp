'use client';

import styles from './TrustBadges.module.css';

interface TrustBadge {
  icon: React.ReactNode;
  label: string;
  value: string;
}

interface TrustBadgesProps {
  variant?: 'horizontal' | 'compact';
}

const badges: TrustBadge[] = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    label: 'Uptime',
    value: '99.9%',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    label: 'Checks vandaag',
    value: '1M+',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    label: 'Actieve gebruikers',
    value: '500+',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    label: 'Rating',
    value: '4.9/5',
  },
];

export function TrustBadges({ variant = 'horizontal' }: TrustBadgesProps) {
  return (
    <div className={`${styles.container} ${styles[variant]}`}>
      {badges.map((badge, i) => (
        <div key={i} className={styles.badge}>
          <div className={styles.icon}>{badge.icon}</div>
          <div className={styles.content}>
            <span className={styles.value}>{badge.value}</span>
            <span className={styles.label}>{badge.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// For homepage hero section
export function HeroTrustIndicators() {
  return (
    <div className={styles.heroIndicators}>
      <div className={styles.indicator}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>Geen creditcard nodig</span>
      </div>
      <div className={styles.indicator}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>Binnen 30 seconden starten</span>
      </div>
      <div className={styles.indicator}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>Gratis plan voor altijd</span>
      </div>
    </div>
  );
}
