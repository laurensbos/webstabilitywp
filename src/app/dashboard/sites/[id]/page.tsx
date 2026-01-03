'use client';

import { useState, use, useCallback } from 'react';
import Link from 'next/link';
import { useSite, useDeleteSite, useUpdateSite, useForceCheck, useSiteAlerts, useSitePerformance, useRunPerformanceCheck } from '@/hooks';
import styles from './page.module.css';

// Helper to refresh SSL
async function refreshSSL(siteId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/sites/${siteId}/ssl`, { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}

interface UptimeDataPoint {
  timestamp: string;
  status: 'up' | 'down' | 'degraded';
  responseTime: number;
}

interface AlertDisplay {
  id: string;
  type: 'down' | 'up' | 'ssl' | 'slow';
  message: string;
  timestamp: string;
}

interface SiteDisplay {
  id: string;
  name: string;
  url: string;
  status: 'up' | 'down' | 'degraded' | 'paused';
  uptime: {
    day: number;
    week: number;
    month: number;
    year: number;
  };
  responseTime: {
    current: number;
    average: number;
    min: number;
    max: number;
  };
  ssl: {
    status: 'valid' | 'expiring' | 'expired' | null;
    issuer: string | null;
    expiryDate: string | null;
    daysUntilExpiry: number | null;
  };
  checkInterval: number;
  lastChecked: string;
  createdAt: string;
  notifications: {
    email: boolean;
    sslWarnings: boolean;
    dailyReport: boolean;
  };
}

// Helper to format time ago
function formatTimeAgo(dateString: string | null): string {
  if (!dateString) return 'Nooit';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return `${diffSecs} seconden geleden`;
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minuut' : 'minuten'} geleden`;
  if (diffHours < 24) return `${diffHours} uur geleden`;
  return `${diffDays} ${diffDays === 1 ? 'dag' : 'dagen'} geleden`;
}

// Generate uptime data from recentChecks
const generateUptimeDataFromChecks = (
  checks: Array<{ id: string; status: number; responseTime: number; isUp: boolean; checkedAt: string }>
): UptimeDataPoint[] => {
  return checks.map(check => ({
    timestamp: check.checkedAt,
    status: check.isUp ? (check.responseTime > 1000 ? 'degraded' : 'up') : 'down',
    responseTime: check.responseTime
  }));
};

// Helper to get color based on score
function getScoreColor(score: number): string {
  if (score >= 90) return '#22c55e'; // Green
  if (score >= 50) return '#f59e0b'; // Orange
  return '#ef4444'; // Red
}

// Helper to get vital status class
function getVitalStatus(value: number, type: 'lcp' | 'fid' | 'cls' | 'ttfb'): string {
  const thresholds = {
    lcp: { good: 2500, needsImprovement: 4000 },
    fid: { good: 100, needsImprovement: 300 },
    cls: { good: 0.1, needsImprovement: 0.25 },
    ttfb: { good: 800, needsImprovement: 1800 },
  };
  
  const threshold = thresholds[type];
  if (value <= threshold.good) return styles.vitalGood;
  if (value <= threshold.needsImprovement) return styles.vitalWarning;
  return styles.vitalPoor;
}

export default function SiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { site: apiSite, uptime: apiUptime, ssl: apiSsl, recentChecks, loading, error, refetch } = useSite(resolvedParams.id);
  const { deleteSite, loading: deleting } = useDeleteSite();
  const { updateSite, loading: updating } = useUpdateSite();
  const { forceCheck, loading: checking } = useForceCheck();
  const { alerts: siteAlertsData } = useSiteAlerts(resolvedParams.id);
  const { latest: performanceData, history: performanceHistory, refetch: refetchPerformance } = useSitePerformance(resolvedParams.id);
  const { runCheck: runPerformanceCheck, loading: checkingPerformance } = useRunPerformanceCheck();
  
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('24h');
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'alerts' | 'settings'>('overview');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [checkResult, setCheckResult] = useState<{ success: boolean; message: string } | null>(null);
  const [refreshingSSL, setRefreshingSSL] = useState(false);

  // SSL refresh handler
  const handleRefreshSSL = useCallback(async () => {
    setRefreshingSSL(true);
    await refreshSSL(resolvedParams.id);
    await refetch();
    setRefreshingSSL(false);
  }, [resolvedParams.id, refetch]);

  // Transform API data to display format
  const site: SiteDisplay = apiSite ? {
    id: apiSite.id,
    name: apiSite.name,
    url: apiSite.url,
    status: !apiSite.isActive ? 'paused' : apiSite.currentStatus === 'unknown' ? 'paused' : apiSite.currentStatus,
    uptime: {
      day: apiUptime?.day ?? 100,
      week: apiUptime?.week ?? 100,
      month: apiUptime?.month ?? 100,
      year: 99.9 // Not tracked yet
    },
    responseTime: {
      current: apiSite.avgResponseTime ?? 0,
      average: apiSite.avgResponseTime ?? 0,
      min: Math.min(...recentChecks.map(c => c.responseTime).filter(r => r > 0), apiSite.avgResponseTime ?? 0) || 0,
      max: Math.max(...recentChecks.map(c => c.responseTime), apiSite.avgResponseTime ?? 0) || 0
    },
    ssl: {
      status: apiSsl?.isValid ? (apiSsl.daysUntilExpiry && apiSsl.daysUntilExpiry < 30 ? 'expiring' : 'valid') : apiSsl ? 'expired' : null,
      issuer: apiSsl?.issuer ?? null,
      expiryDate: apiSsl?.validTo ?? null,
      daysUntilExpiry: apiSsl?.daysUntilExpiry ?? null
    },
    checkInterval: apiSite.checkInterval,
    lastChecked: formatTimeAgo(apiSite.lastCheckedAt),
    createdAt: apiSite.createdAt,
    notifications: {
      email: true,
      sslWarnings: true,
      dailyReport: false
    }
  } : {
    id: '',
    name: 'Laden...',
    url: '',
    status: 'paused',
    uptime: { day: 0, week: 0, month: 0, year: 0 },
    responseTime: { current: 0, average: 0, min: 0, max: 0 },
    ssl: { status: null, issuer: null, expiryDate: null, daysUntilExpiry: null },
    checkInterval: 60,
    lastChecked: '-',
    createdAt: '',
    notifications: { email: false, sslWarnings: false, dailyReport: false }
  };

  const uptimeData = generateUptimeDataFromChecks(recentChecks);
  
  // Transform alerts for display
  const siteAlerts: AlertDisplay[] = siteAlertsData.map(alert => ({
    id: alert.id,
    type: alert.type === 'downtime' ? 'down' : 
          (alert.type as string) === 'recovery' ? 'up' :
          alert.type === 'slow_response' ? 'slow' : 'ssl',
    message: alert.message,
    timestamp: new Date(alert.createdAt).toLocaleString('nl-NL')
  }));

  // Handle force check
  const handleForceCheck = async () => {
    setCheckResult(null);
    const result = await forceCheck(resolvedParams.id);
    if (result) {
      setCheckResult({
        success: result.check.isUp,
        message: result.check.isUp 
          ? `Site is online (${result.check.responseTime}ms)` 
          : `Site is offline: ${result.check.error || 'Geen response'}`
      });
      refetch(); // Refresh site data
    } else {
      setCheckResult({ success: false, message: 'Check kon niet worden uitgevoerd' });
    }
    // Clear result after 5 seconds
    setTimeout(() => setCheckResult(null), 5000);
  };

  const getStatusLabel = (status: SiteDisplay['status']) => {
    switch (status) {
      case 'up': return 'Online';
      case 'down': return 'Offline';
      case 'degraded': return 'Traag';
      case 'paused': return 'Gepauzeerd';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.container}>
      {/* Check Result Toast */}
      {checkResult && (
        <div className={`${styles.toast} ${checkResult.success ? styles.toastSuccess : styles.toastError}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {checkResult.success ? (
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" />
            ) : (
              <circle cx="12" cy="12" r="10"><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></circle>
            )}
          </svg>
          {checkResult.message}
        </div>
      )}

      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href="/dashboard/sites" className={styles.breadcrumbLink}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Terug naar sites
        </Link>
      </nav>

      {/* Site Header */}
      <div className={styles.siteHeader}>
        <div className={styles.siteInfo}>
          <div className={`${styles.statusIndicator} ${styles[site.status]}`}>
            <span className={styles.statusDot} />
            {getStatusLabel(site.status)}
          </div>
          <h1 className={styles.siteName}>{site.name}</h1>
          <a href={site.url} target="_blank" rel="noopener noreferrer" className={styles.siteUrl}>
            {site.url}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
        <div className={styles.siteActions}>
          <button 
            className={`${styles.actionButton} ${styles.check}`}
            onClick={handleForceCheck}
            disabled={checking}
          >
            {checking ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.spinner}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Checken...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 4v6h-6" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                Check nu
              </>
            )}
          </button>
          <button 
            className={`${styles.actionButton} ${isPaused ? styles.resume : styles.pause}`}
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Hervatten
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
                Pauzeren
              </>
            )}
          </button>
          <button 
            className={`${styles.actionButton} ${styles.delete}`}
            onClick={() => setShowDeleteModal(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span className={styles.deleteText}>Verwijderen</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overzicht
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'performance' ? styles.active : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          Performance
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'alerts' ? styles.active : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          Meldingen
          <span className={styles.tabBadge}>{siteAlerts.length}</span>
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'settings' ? styles.active : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Instellingen
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className={styles.overviewContent}>
          {/* Main Status Card */}
          <div className={styles.statusCard}>
            <div className={styles.statusCardMain}>
              {/* Left: Uptime Ring */}
              <div className={styles.uptimeSection}>
                <div className={styles.uptimeRingLarge}>
                  <svg viewBox="0 0 140 140" className={styles.uptimeRingSvg}>
                    <defs>
                      <linearGradient id="uptimeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#16a34a" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="70"
                      cy="70"
                      r="62"
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="10"
                    />
                    <circle
                      cx="70"
                      cy="70"
                      r="62"
                      fill="none"
                      stroke={site.uptime[timeRange === '24h' ? 'day' : timeRange === '7d' ? 'week' : timeRange === '30d' ? 'month' : 'year'] >= 99 ? 'url(#uptimeGradient)' : site.uptime[timeRange === '24h' ? 'day' : timeRange === '7d' ? 'week' : timeRange === '30d' ? 'month' : 'year'] >= 95 ? '#eab308' : '#ef4444'}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${(site.uptime[timeRange === '24h' ? 'day' : timeRange === '7d' ? 'week' : timeRange === '30d' ? 'month' : 'year'] / 100) * 389.56} 389.56`}
                      transform="rotate(-90 70 70)"
                      className={styles.uptimeRingProgress}
                    />
                  </svg>
                  <div className={styles.uptimeRingContent}>
                    <span className={styles.uptimeValue}>
                      {site.uptime[timeRange === '24h' ? 'day' : timeRange === '7d' ? 'week' : timeRange === '30d' ? 'month' : 'year'].toFixed(1)}%
                    </span>
                    <span className={styles.uptimeLabel}>Uptime</span>
                  </div>
                </div>
              </div>

              {/* Right: Timeline & Info */}
              <div className={styles.statusCardRight}>
                <div className={styles.timelineHeader}>
                  <h3>Status Timeline</h3>
                  <select 
                    value={timeRange} 
                    onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
                    className={styles.timeSelect}
                  >
                    <option value="24h">24 uur</option>
                    <option value="7d">7 dagen</option>
                    <option value="30d">30 dagen</option>
                    <option value="90d">90 dagen</option>
                  </select>
                </div>
                
                <div className={styles.timeline}>
                  {uptimeData.slice(-48).map((point, i) => (
                    <div 
                      key={i} 
                      className={`${styles.timelineBar} ${styles[point.status]}`}
                      title={`${new Date(point.timestamp).toLocaleString('nl-NL')} - ${point.responseTime}ms`}
                    />
                  ))}
                </div>
                
                <div className={styles.timelineLegend}>
                  <span><span className={`${styles.dot} ${styles.up}`} />Online</span>
                  <span><span className={`${styles.dot} ${styles.degraded}`} />Traag</span>
                  <span><span className={`${styles.dot} ${styles.down}`} />Offline</span>
                </div>
              </div>
            </div>

            {/* Stats Strip */}
            <div className={styles.statsStrip}>
              <div className={styles.statItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{site.responseTime.current}ms</span>
                  <span className={styles.statLabel}>Response</span>
                </div>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{site.responseTime.average}ms</span>
                  <span className={styles.statLabel}>Gemiddeld</span>
                </div>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{site.lastChecked}</span>
                  <span className={styles.statLabel}>Laatste check</span>
                </div>
              </div>
              <div className={styles.statDivider} />
              <div className={styles.statItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 4v6h-6M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{site.checkInterval < 60 ? `${site.checkInterval}s` : `${Math.round(site.checkInterval / 60)}m`}</span>
                  <span className={styles.statLabel}>Interval</span>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Grid */}
          <div className={styles.detailsGrid}>
            {/* Response Time Card */}
            <div className={styles.detailCard}>
              <div className={styles.detailCardHeader}>
                <div className={styles.detailCardIcon} data-color="blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <h3>Response Tijd</h3>
                  <p>Laatste 24 checks</p>
                </div>
              </div>
              
              <div className={styles.responseStats}>
                <div className={styles.responseStat}>
                  <span className={styles.responseStatLabel}>Huidig</span>
                  <span className={`${styles.responseStatValue} ${site.responseTime.current < 200 ? styles.good : site.responseTime.current < 500 ? styles.warning : styles.bad}`}>
                    {site.responseTime.current}<small>ms</small>
                  </span>
                </div>
                <div className={styles.responseStat}>
                  <span className={styles.responseStatLabel}>Gemiddeld</span>
                  <span className={styles.responseStatValue}>{site.responseTime.average}<small>ms</small></span>
                </div>
                <div className={styles.responseStat}>
                  <span className={styles.responseStatLabel}>Min</span>
                  <span className={styles.responseStatValue}>{site.responseTime.min}<small>ms</small></span>
                </div>
                <div className={styles.responseStat}>
                  <span className={styles.responseStatLabel}>Max</span>
                  <span className={styles.responseStatValue}>{site.responseTime.max}<small>ms</small></span>
                </div>
              </div>

              {/* Response Sparkline */}
              <div className={styles.responseSparkline}>
                {uptimeData.slice(-24).map((point, i) => (
                  <div 
                    key={i}
                    className={`${styles.sparkBar} ${styles[point.status]}`}
                    style={{ 
                      height: `${Math.min(100, Math.max(15, (point.responseTime / (site.responseTime.max || 500)) * 100))}%` 
                    }}
                    title={`${point.responseTime}ms`}
                  />
                ))}
              </div>
            </div>

            {/* SSL Certificate Card */}
            <div className={styles.detailCard}>
              <div className={styles.detailCardHeader}>
                <div className={styles.detailCardIcon} data-color={site.ssl.status === 'valid' ? 'green' : site.ssl.status === 'expiring' ? 'yellow' : 'red'}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <h3>SSL Certificaat</h3>
                  <p>{site.ssl.issuer || 'Geen certificaat'}</p>
                </div>
                <button 
                  className={styles.iconButton}
                  onClick={handleRefreshSSL}
                  disabled={refreshingSSL}
                  title="Vernieuwen"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={refreshingSSL ? styles.spinning : ''}>
                    <path d="M23 4v6h-6" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                </button>
              </div>

              {site.ssl.status ? (
                <div className={styles.sslDetails}>
                  <div className={`${styles.sslBadge} ${styles[site.ssl.status]}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {site.ssl.status === 'valid' ? (
                        <polyline points="20 6 9 17 4 12" />
                      ) : site.ssl.status === 'expiring' ? (
                        <>
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </>
                      ) : (
                        <>
                          <circle cx="12" cy="12" r="10" />
                          <line x1="15" y1="9" x2="9" y2="15" />
                          <line x1="9" y1="9" x2="15" y2="15" />
                        </>
                      )}
                    </svg>
                    {site.ssl.status === 'valid' ? 'Geldig certificaat' : site.ssl.status === 'expiring' ? 'Verloopt binnenkort' : 'Verlopen'}
                  </div>
                  
                  <div className={styles.sslInfo}>
                    <div className={styles.sslRow}>
                      <span>Uitgever</span>
                      <span>{site.ssl.issuer || '-'}</span>
                    </div>
                    <div className={styles.sslRow}>
                      <span>Verloopt op</span>
                      <span>{site.ssl.expiryDate ? formatDate(site.ssl.expiryDate) : '-'}</span>
                    </div>
                    <div className={styles.sslRow}>
                      <span>Dagen resterend</span>
                      <span className={site.ssl.daysUntilExpiry && site.ssl.daysUntilExpiry < 30 ? styles.warning : ''}>
                        {site.ssl.daysUntilExpiry ?? '-'} dagen
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.sslEmpty}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <p>Geen SSL certificaat gevonden</p>
                  <button onClick={handleRefreshSSL} disabled={refreshingSSL}>
                    {refreshingSSL ? 'Controleren...' : 'Controleer SSL'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Response Chart */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3>Response Tijd (laatste 24 checks)</h3>
              <div className={styles.chartLegend}>
                <span><span className={`${styles.dot} ${styles.up}`} />Online</span>
                <span><span className={`${styles.dot} ${styles.degraded}`} />Traag</span>
                <span><span className={`${styles.dot} ${styles.down}`} />Offline</span>
              </div>
            </div>
            <div className={styles.chart}>
              <div className={styles.chartBars}>
                {uptimeData.slice(-24).map((point, i) => (
                  <div key={i} className={styles.chartBarWrapper}>
                    <div 
                      className={`${styles.chartBar} ${styles[point.status]}`}
                      style={{ 
                        height: `${Math.min(100, Math.max(8, (point.responseTime / (site.responseTime.max || 500)) * 100))}%` 
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className={styles.chartAxis}>
                <span>Oudste</span>
                <span>Nieuwste</span>
              </div>
            </div>
          </div>

          {/* Monitoring Details */}
          <div className={styles.monitoringCard}>
            <div className={styles.monitoringHeader}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <h3>Monitoring Details</h3>
            </div>
            <div className={styles.monitoringGrid}>
              <div className={styles.monitoringItem}>
                <span className={styles.monitoringLabel}>Check Interval</span>
                <span className={styles.monitoringValue}>Elke {site.checkInterval < 60 ? `${site.checkInterval} seconden` : `${Math.round(site.checkInterval / 60)} minuten`}</span>
              </div>
              <div className={styles.monitoringItem}>
                <span className={styles.monitoringLabel}>Laatste Check</span>
                <span className={styles.monitoringValue}>{site.lastChecked}</span>
              </div>
              <div className={styles.monitoringItem}>
                <span className={styles.monitoringLabel}>Toegevoegd</span>
                <span className={styles.monitoringValue}>{formatDate(site.createdAt)}</span>
              </div>
              <div className={styles.monitoringItem}>
                <span className={styles.monitoringLabel}>Meldingen</span>
                <span className={styles.monitoringValue}>{siteAlerts.length} actief</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className={styles.performanceContent}>
          <div className={styles.performanceHeader}>
            <h3>Performance & SEO Scores</h3>
            <button 
              className={styles.runCheckButton}
              onClick={async () => {
                const result = await runPerformanceCheck(resolvedParams.id);
                if (result) {
                  refetchPerformance();
                }
              }}
              disabled={checkingPerformance}
            >
              {checkingPerformance ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.spinner}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Analyseren...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 4v6h-6" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  Nieuwe analyse
                </>
              )}
            </button>
          </div>

          {!performanceData ? (
            <div className={styles.emptyState}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <p>Nog geen performance data beschikbaar</p>
              <button 
                className={styles.runCheckButton}
                onClick={async () => {
                  const result = await runPerformanceCheck(resolvedParams.id);
                  if (result) {
                    refetchPerformance();
                  }
                }}
                disabled={checkingPerformance}
              >
                {checkingPerformance ? 'Analyseren...' : 'Start eerste analyse'}
              </button>
            </div>
          ) : (
            <>
              {/* Score Cards */}
              <div className={styles.scoreGrid}>
                <div className={styles.scoreCard}>
                  <div className={styles.scoreCircle} style={{ 
                    background: `conic-gradient(${getScoreColor(performanceData.performanceScore || 0)} ${(performanceData.performanceScore || 0) * 3.6}deg, rgba(255,255,255,0.1) 0deg)` 
                  }}>
                    <span className={styles.scoreValue}>{performanceData.performanceScore || 0}</span>
                  </div>
                  <span className={styles.scoreLabel}>Performance</span>
                </div>
                <div className={styles.scoreCard}>
                  <div className={styles.scoreCircle} style={{ 
                    background: `conic-gradient(${getScoreColor(performanceData.accessibilityScore || 0)} ${(performanceData.accessibilityScore || 0) * 3.6}deg, rgba(255,255,255,0.1) 0deg)` 
                  }}>
                    <span className={styles.scoreValue}>{performanceData.accessibilityScore || 0}</span>
                  </div>
                  <span className={styles.scoreLabel}>Accessibility</span>
                </div>
                <div className={styles.scoreCard}>
                  <div className={styles.scoreCircle} style={{ 
                    background: `conic-gradient(${getScoreColor(performanceData.bestPracticesScore || 0)} ${(performanceData.bestPracticesScore || 0) * 3.6}deg, rgba(255,255,255,0.1) 0deg)` 
                  }}>
                    <span className={styles.scoreValue}>{performanceData.bestPracticesScore || 0}</span>
                  </div>
                  <span className={styles.scoreLabel}>Best Practices</span>
                </div>
                <div className={styles.scoreCard}>
                  <div className={styles.scoreCircle} style={{ 
                    background: `conic-gradient(${getScoreColor(performanceData.seoScore || 0)} ${(performanceData.seoScore || 0) * 3.6}deg, rgba(255,255,255,0.1) 0deg)` 
                  }}>
                    <span className={styles.scoreValue}>{performanceData.seoScore || 0}</span>
                  </div>
                  <span className={styles.scoreLabel}>SEO</span>
                </div>
              </div>

              {/* Core Web Vitals */}
              <div className={styles.webVitalsCard}>
                <h4>Core Web Vitals</h4>
                <div className={styles.vitalsGrid}>
                  <div className={styles.vitalItem}>
                    <div className={styles.vitalHeader}>
                      <span className={styles.vitalName}>LCP</span>
                      <span className={styles.vitalFullName}>Largest Contentful Paint</span>
                    </div>
                    <div className={styles.vitalValue}>
                      <span className={`${styles.vitalNumber} ${getVitalStatus(parseFloat(performanceData.lcp || '0'), 'lcp')}`}>
                        {(parseFloat(performanceData.lcp || '0') / 1000).toFixed(2)}s
                      </span>
                      <span className={styles.vitalTarget}>Doel: &lt; 2.5s</span>
                    </div>
                  </div>
                  <div className={styles.vitalItem}>
                    <div className={styles.vitalHeader}>
                      <span className={styles.vitalName}>FID</span>
                      <span className={styles.vitalFullName}>First Input Delay</span>
                    </div>
                    <div className={styles.vitalValue}>
                      <span className={`${styles.vitalNumber} ${getVitalStatus(parseFloat(performanceData.fid || '0'), 'fid')}`}>
                        {parseFloat(performanceData.fid || '0').toFixed(0)}ms
                      </span>
                      <span className={styles.vitalTarget}>Doel: &lt; 100ms</span>
                    </div>
                  </div>
                  <div className={styles.vitalItem}>
                    <div className={styles.vitalHeader}>
                      <span className={styles.vitalName}>CLS</span>
                      <span className={styles.vitalFullName}>Cumulative Layout Shift</span>
                    </div>
                    <div className={styles.vitalValue}>
                      <span className={`${styles.vitalNumber} ${getVitalStatus(parseFloat(performanceData.cls || '0'), 'cls')}`}>
                        {parseFloat(performanceData.cls || '0').toFixed(3)}
                      </span>
                      <span className={styles.vitalTarget}>Doel: &lt; 0.1</span>
                    </div>
                  </div>
                  <div className={styles.vitalItem}>
                    <div className={styles.vitalHeader}>
                      <span className={styles.vitalName}>TTFB</span>
                      <span className={styles.vitalFullName}>Time to First Byte</span>
                    </div>
                    <div className={styles.vitalValue}>
                      <span className={`${styles.vitalNumber} ${getVitalStatus(parseFloat(performanceData.ttfb || '0'), 'ttfb')}`}>
                        {parseFloat(performanceData.ttfb || '0').toFixed(0)}ms
                      </span>
                      <span className={styles.vitalTarget}>Doel: &lt; 800ms</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Last updated */}
              <p className={styles.lastUpdated}>
                Laatst geanalyseerd: {new Date(performanceData.createdAt).toLocaleString('nl-NL')}
              </p>
            </>
          )}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className={styles.alertsContent}>
          <div className={styles.alertsList}>
            {siteAlerts.length === 0 ? (
              <div className={styles.emptyState}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <p>Geen meldingen voor deze site</p>
              </div>
            ) : siteAlerts.map((alert) => (
              <div key={alert.id} className={`${styles.alertItem} ${styles[alert.type]}`}>
                <div className={styles.alertIcon}>
                  {alert.type === 'down' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  )}
                  {alert.type === 'up' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  )}
                  {alert.type === 'slow' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  )}
                  {alert.type === 'ssl' && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  )}
                </div>
                <div className={styles.alertContent}>
                  <p className={styles.alertMessage}>{alert.message}</p>
                  <span className={styles.alertTimestamp}>{alert.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className={styles.settingsContent}>
          <div className={styles.settingsSection}>
            <h3>Website gegevens</h3>
            <div className={styles.settingsForm}>
              <div className={styles.formGroup}>
                <label>Naam</label>
                <input type="text" defaultValue={site.name} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>URL</label>
                <input type="url" defaultValue={site.url} className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>Check interval</label>
                <select defaultValue={site.checkInterval} className={styles.select}>
                  <option value="30">Elke 30 seconden</option>
                  <option value="60">Elke minuut</option>
                  <option value="300">Elke 5 minuten</option>
                </select>
              </div>
            </div>
          </div>

          <div className={styles.settingsSection}>
            <h3>Notificaties</h3>
            <div className={styles.notificationSettings}>
              <label className={styles.toggle}>
                <span>E-mail bij downtime</span>
                <input type="checkbox" defaultChecked={site.notifications.email} />
                <span className={styles.toggleSlider} />
              </label>
              <label className={styles.toggle}>
                <span>SSL waarschuwingen</span>
                <input type="checkbox" defaultChecked={site.notifications.sslWarnings} />
                <span className={styles.toggleSlider} />
              </label>
              <label className={styles.toggle}>
                <span>Dagelijks rapport</span>
                <input type="checkbox" defaultChecked={site.notifications.dailyReport} />
                <span className={styles.toggleSlider} />
              </label>
            </div>
          </div>

          <div className={styles.settingsSection}>
            <h3>Rapporten Exporteren</h3>
            <p className={styles.settingsDescription}>Download monitoring data als CSV bestand voor verdere analyse.</p>
            <div className={styles.exportButtons}>
              <a 
                href={`/api/sites/${resolvedParams.id}/export?type=uptime&format=csv&days=30`}
                className={styles.exportButton}
                download
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Uptime Data (30 dagen)
              </a>
              <a 
                href={`/api/sites/${resolvedParams.id}/export?type=performance&format=csv&days=30`}
                className={styles.exportButton}
                download
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Performance Data (30 dagen)
              </a>
            </div>
          </div>

          <div className={styles.settingsActions}>
            <button className={styles.saveButton}>Wijzigingen opslaan</button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <h3>Site verwijderen?</h3>
            <p>Weet je zeker dat je <strong>{site.name}</strong> wilt verwijderen? Alle monitoring data gaat verloren.</p>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setShowDeleteModal(false)}>
                Annuleren
              </button>
              <button 
                className={styles.deleteConfirmButton}
                disabled={deleting}
                onClick={async () => {
                  const success = await deleteSite(resolvedParams.id);
                  if (success) {
                    window.location.href = '/dashboard/sites';
                  }
                }}
              >
                {deleting ? 'Bezig...' : 'Ja, verwijderen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
