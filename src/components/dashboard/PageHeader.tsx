'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import styles from './PageHeader.module.css';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  status?: {
    type: 'up' | 'down' | 'degraded' | 'paused' | 'warning';
    label: string;
  };
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  status,
  actions,
  backHref,
  backLabel = 'Terug',
}: PageHeaderProps) {
  const getStatusClass = () => {
    switch (status?.type) {
      case 'up': return styles.statusUp;
      case 'down': return styles.statusDown;
      case 'degraded': return styles.statusDegraded;
      case 'warning': return styles.statusWarning;
      case 'paused': return styles.statusPaused;
      default: return '';
    }
  };

  return (
    <motion.header 
      className={styles.header}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top Row: Breadcrumbs */}
      {(breadcrumbs || backHref) && (
        <div className={styles.breadcrumbRow}>
          {backHref ? (
            <Link href={backHref} className={styles.backButton}>
              <ChevronLeft size={18} />
              <span>{backLabel}</span>
            </Link>
          ) : breadcrumbs ? (
            <nav className={styles.breadcrumbs}>
              <Link href="/dashboard" className={styles.breadcrumbHome}>
                <Home size={14} />
              </Link>
              {breadcrumbs.map((item, index) => (
                <span key={index} className={styles.breadcrumbItem}>
                  <ChevronRight size={14} className={styles.breadcrumbSeparator} />
                  {item.href ? (
                    <Link href={item.href} className={styles.breadcrumbLink}>
                      {item.label}
                    </Link>
                  ) : (
                    <span className={styles.breadcrumbCurrent}>{item.label}</span>
                  )}
                </span>
              ))}
            </nav>
          ) : null}
        </div>
      )}

      {/* Main Row: Title, Status, Actions */}
      <div className={styles.mainRow}>
        <div className={styles.titleSection}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{title}</h1>
            {status && (
              <div className={`${styles.statusBadge} ${getStatusClass()}`}>
                <span className={styles.statusDot} />
                <span className={styles.statusLabel}>{status.label}</span>
              </div>
            )}
          </div>
          {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </div>
        
        {actions && (
          <div className={styles.actions}>
            {actions}
          </div>
        )}
      </div>
    </motion.header>
  );
}

export default PageHeader;
