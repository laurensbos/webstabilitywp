'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './UpgradePrompt.module.css';

interface UpgradePromptProps {
  type: 'feature' | 'limit' | 'trial' | 'contextual';
  feature?: string;
  message?: string;
  showDismiss?: boolean;
  onDismiss?: () => void;
}

export function UpgradePrompt({ type, feature, message, showDismiss = true, onDismiss }: UpgradePromptProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleDismiss = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss?.();
    }, 300);
  };

  if (!isVisible) return null;

  const getContent = () => {
    switch (type) {
      case 'feature':
        return {
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          ),
          title: `${feature} is een Pro feature`,
          description: 'Upgrade naar Pro voor toegang tot alle features',
          cta: 'Upgrade naar Pro',
        };
      case 'limit':
        return {
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          ),
          title: 'Je hebt je limiet bereikt',
          description: message || 'Upgrade voor meer capaciteit',
          cta: 'Bekijk plannen',
        };
      case 'trial':
        return {
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          ),
          title: 'Je proefperiode eindigt binnenkort',
          description: 'Upgrade nu om je monitoring niet te onderbreken',
          cta: 'Nu upgraden',
        };
      case 'contextual':
        return {
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ),
          title: 'Tip',
          description: message || 'Upgrade voor snellere checks en meer features',
          cta: 'Meer info',
        };
      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  return (
    <div className={`${styles.prompt} ${styles[type]} ${isAnimating ? styles.animateOut : ''}`}>
      <div className={styles.iconWrapper}>
        {content.icon}
      </div>
      <div className={styles.content}>
        <span className={styles.title}>{content.title}</span>
        <span className={styles.description}>{content.description}</span>
      </div>
      <div className={styles.actions}>
        <Link href="/dashboard/settings?tab=billing" className={styles.ctaButton}>
          {content.cta}
        </Link>
        {showDismiss && (
          <button className={styles.dismissButton} onClick={handleDismiss} aria-label="Sluiten">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// Locked Feature Wrapper
interface LockedFeatureProps {
  children: React.ReactNode;
  feature: string;
  isLocked: boolean;
}

export function LockedFeature({ children, feature, isLocked }: LockedFeatureProps) {
  if (!isLocked) return <>{children}</>;

  return (
    <div className={styles.lockedWrapper}>
      <div className={styles.lockedOverlay}>
        <div className={styles.lockIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <span className={styles.lockText}>{feature}</span>
        <Link href="/dashboard/settings?tab=billing" className={styles.unlockButton}>
          Upgrade om te ontgrendelen
        </Link>
      </div>
      <div className={styles.lockedContent}>{children}</div>
    </div>
  );
}
