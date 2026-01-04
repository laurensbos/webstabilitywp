'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAlerts, useSites, useMarkAlertRead } from '@/hooks';
import styles from './page.module.css';

interface AlertDisplay {
  id: string;
  siteId: string;
  siteName: string;
  siteUrl: string;
  type: 'down' | 'up' | 'ssl' | 'slow' | 'ssl_expiring' | 'ssl_expired';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  duration?: string;
}

// Format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('nl-NL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', '');
}

// Map alert types from API to display types
function mapAlertType(type: string): AlertDisplay['type'] {
  switch (type) {
    case 'downtime': return 'down';
    case 'slow_response': return 'slow';
    case 'ssl_expiry': return 'ssl_expiring';
    case 'visual_change': return 'ssl'; // fallback
    case 'security': return 'ssl'; // fallback
    default: return 'down';
  }
}

export default function AlertsPage() {
  const { alerts: apiAlerts, loading, error, refetch } = useAlerts();
  const { sites } = useSites();
  const { markAsRead, markAllAsRead, loading: markingRead } = useMarkAlertRead();
  
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Create a map of site IDs to site info
  const siteMap = new Map(sites.map(s => [s.id, { name: s.name, url: s.url }]));

  // Transform API alerts to display format
  const alerts: AlertDisplay[] = (apiAlerts || []).map((alert) => {
    const site = siteMap.get(alert.siteId);
    return {
      id: alert.id,
      siteId: alert.siteId,
      siteName: site?.name || 'Onbekende site',
      siteUrl: site?.url || '',
      type: mapAlertType(alert.type),
      severity: alert.severity,
      message: alert.message,
      timestamp: formatDate(alert.createdAt),
      resolved: alert.isRead
    };
  });

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'active' && alert.resolved) return false;
    if (filter === 'resolved' && !alert.resolved) return false;
    if (severityFilter !== 'all' && alert.severity !== severityFilter) return false;
    if (typeFilter !== 'all' && alert.type !== typeFilter) return false;
    return true;
  });

  const activeCount = alerts.filter(a => !a.resolved).length;
  const criticalCount = alerts.filter(a => !a.resolved && a.severity === 'critical').length;

  const getAlertIcon = (type: AlertDisplay['type']) => {
    switch (type) {
      case 'down':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case 'up':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      case 'slow':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        );
      case 'ssl':
      case 'ssl_expiring':
      case 'ssl_expired':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        );
    }
  };

  const getTypeLabel = (type: AlertDisplay['type']) => {
    switch (type) {
      case 'down': return 'Offline';
      case 'up': return 'Online';
      case 'slow': return 'Traag';
      case 'ssl': return 'SSL';
      case 'ssl_expiring': return 'SSL verloopt';
      case 'ssl_expired': return 'SSL verlopen';
    }
  };

  const getSeverityLabel = (severity: AlertDisplay['severity']) => {
    switch (severity) {
      case 'critical': return 'Kritiek';
      case 'warning': return 'Waarschuwing';
      case 'info': return 'Informatie';
    }
  };

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Meldingen</h1>
          <p className={styles.subtitle}>
            {activeCount > 0 ? (
              <>
                <span className={styles.alertBadge}>{activeCount}</span> actieve melding{activeCount !== 1 ? 'en' : ''}
                {criticalCount > 0 && (
                  <span className={styles.criticalBadge}>{criticalCount} kritiek</span>
                )}
              </>
            ) : (
              'Geen actieve meldingen'
            )}
          </p>
        </div>
        <div className={styles.headerActions}>
          {activeCount > 0 && (
            <button 
              className={styles.markAllReadButton}
              onClick={async () => {
                await markAllAsRead();
                refetch();
              }}
              disabled={markingRead}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {markingRead ? 'Bezig...' : 'Alles gelezen'}
            </button>
          )}
        <Link href="/dashboard/settings?tab=notifications" className={styles.settingsButton}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span>Instellingen</span>
        </Link>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className={styles.quickStats}>
        <div className={`${styles.quickStat} ${styles.critical}`}>
          <div className={styles.quickStatIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className={styles.quickStatContent}>
            <span className={styles.quickStatValue}>{alerts.filter(a => !a.resolved && a.severity === 'critical').length}</span>
            <span className={styles.quickStatLabel}>Kritiek</span>
          </div>
        </div>
        <div className={`${styles.quickStat} ${styles.warning}`}>
          <div className={styles.quickStatIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div className={styles.quickStatContent}>
            <span className={styles.quickStatValue}>{alerts.filter(a => !a.resolved && a.severity === 'warning').length}</span>
            <span className={styles.quickStatLabel}>Waarschuwingen</span>
          </div>
        </div>
        <div className={`${styles.quickStat} ${styles.resolved}`}>
          <div className={styles.quickStatIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className={styles.quickStatContent}>
            <span className={styles.quickStatValue}>{alerts.filter(a => a.resolved).length}</span>
            <span className={styles.quickStatLabel}>Opgelost</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterTabs}>
          <button 
            className={`${styles.filterTab} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            Alle
            <span className={styles.filterCount}>{alerts.length}</span>
          </button>
          <button 
            className={`${styles.filterTab} ${filter === 'active' ? styles.active : ''}`}
            onClick={() => setFilter('active')}
          >
            Actief
            <span className={`${styles.filterCount} ${styles.activeCount}`}>{activeCount}</span>
          </button>
          <button 
            className={`${styles.filterTab} ${filter === 'resolved' ? styles.active : ''}`}
            onClick={() => setFilter('resolved')}
          >
            Opgelost
            <span className={styles.filterCount}>{alerts.filter(a => a.resolved).length}</span>
          </button>
        </div>

        <div className={styles.filterSelects}>
          <select 
            value={severityFilter} 
            onChange={(e) => setSeverityFilter(e.target.value as typeof severityFilter)}
            className={styles.filterSelect}
          >
            <option value="all">Alle ernst levels</option>
            <option value="critical">Kritiek</option>
            <option value="warning">Waarschuwing</option>
            <option value="info">Informatie</option>
          </select>
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Alle types</option>
            <option value="down">Offline</option>
            <option value="up">Online</option>
            <option value="slow">Traag</option>
            <option value="ssl_expiring">SSL verloopt</option>
            <option value="ssl_expired">SSL verlopen</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      {filteredAlerts.length > 0 ? (
        <div className={styles.alertsList}>
          {filteredAlerts.map(alert => (
            <div key={alert.id} className={`${styles.alertCard} ${styles[alert.severity]} ${alert.resolved ? styles.resolved : ''}`}>
              <div className={styles.alertIcon}>
                {getAlertIcon(alert.type)}
              </div>
              
              <div className={styles.alertContent}>
                <div className={styles.alertHeader}>
                  <div className={styles.alertMeta}>
                    <span className={`${styles.severityBadge} ${styles[alert.severity]}`}>
                      {getSeverityLabel(alert.severity)}
                    </span>
                    <span className={styles.typeBadge}>
                      {getTypeLabel(alert.type)}
                    </span>
                    {alert.resolved && (
                      <span className={styles.resolvedBadge}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Opgelost
                      </span>
                    )}
                  </div>
                  <span className={styles.alertTime}>{alert.timestamp}</span>
                </div>
                
                <p className={styles.alertMessage}>{alert.message}</p>
                
                <div className={styles.alertSite}>
                  <Link href={`/dashboard/sites/${alert.siteId}`} className={styles.siteLink}>
                    <span className={styles.siteName}>{alert.siteName}</span>
                    <span className={styles.siteUrl}>{alert.siteUrl}</span>
                  </Link>
                </div>

                {alert.resolved && alert.duration && (
                  <div className={styles.alertDuration}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Downtime duur: {alert.duration}
                  </div>
                )}
              </div>

              <div className={styles.alertActions}>
                <Link href={`/dashboard/sites/${alert.siteId}`} className={styles.viewButton}>
                  Bekijk site
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <h3>Geen meldingen gevonden</h3>
          <p>Er zijn geen meldingen die voldoen aan je filters.</p>
        </div>
      )}
    </motion.div>
  );
}
