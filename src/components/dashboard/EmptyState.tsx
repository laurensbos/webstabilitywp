'use client';

import { Plus, Globe, Bell, Activity, ArrowRight } from 'lucide-react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  type: 'sites' | 'alerts' | 'activity';
  onAction?: () => void;
}

const config = {
  sites: {
    icon: Globe,
    title: 'Nog geen websites',
    description: 'Voeg je eerste website toe om te beginnen met monitoren. We controleren 24/7 of je site online is.',
    actionText: 'Eerste site toevoegen',
    actionIcon: Plus,
  },
  alerts: {
    icon: Bell,
    title: 'Geen meldingen',
    description: 'Gefeliciteerd! Al je websites draaien soepel. We sturen je een melding zodra er iets gebeurt.',
    actionText: null,
    actionIcon: null,
  },
  activity: {
    icon: Activity,
    title: 'Nog geen activiteit',
    description: 'Zodra we je websites beginnen te monitoren, zie je hier alle activiteit.',
    actionText: null,
    actionIcon: null,
  },
};

export function EmptyState({ type, onAction }: EmptyStateProps) {
  const { icon: Icon, title, description, actionText, actionIcon: ActionIcon } = config[type];

  return (
    <div className={styles.container}>
      {/* Animated background circles */}
      <div className={styles.bgCircles}>
        <div className={styles.circle1} />
        <div className={styles.circle2} />
        <div className={styles.circle3} />
      </div>

      {/* Icon */}
      <div className={styles.iconWrapper}>
        <div className={styles.iconBg}>
          <Icon size={32} className={styles.icon} />
        </div>
        <div className={styles.iconRing} />
      </div>

      {/* Content */}
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>

      {/* Action button */}
      {actionText && onAction && (
        <button className={styles.actionBtn} onClick={onAction}>
          {ActionIcon && <ActionIcon size={18} />}
          <span>{actionText}</span>
          <ArrowRight size={16} className={styles.arrow} />
        </button>
      )}

      {/* Success checkmark for alerts */}
      {type === 'alerts' && (
        <div className={styles.successBadge}>
          <svg viewBox="0 0 24 24" fill="none" className={styles.checkmark}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M8 12l2.5 2.5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Alles in orde</span>
        </div>
      )}
    </div>
  );
}
