'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Clock, 
  Globe, 
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Plus,
  ExternalLink,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Gauge,
  Activity,
  Zap
} from 'lucide-react';
import { useDashboardStatsWithDetails } from '@/hooks';
import { OnboardingTour, EmptyState, StatsSkeleton, SitesSkeleton, UsageIndicator, UpgradePrompt } from '@/components/dashboard';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s geleden`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m geleden`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}u geleden`;
  const days = Math.floor(hours / 24);
  return `${days}d geleden`;
}

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const { stats, sites: apiSites, alerts: apiAlerts, loading } = useDashboardStatsWithDetails();
  const { data: session } = useSession();

  // Get plan info
  const planLimits: Record<string, number> = { free: 3, pro: 20, business: 100, enterprise: 1000 };
  const userPlan = session?.user?.plan || 'free';
  const maxSites = planLimits[userPlan] || 3;

  // Prepare stats data - Hero stat first, then secondary stats
  const heroStat = {
    label: 'Gemiddelde Uptime',
    value: loading ? '—' : `${stats.avgUptime.toFixed(2)}%`,
    subtitle: loading ? '' : stats.sitesDown > 0 ? `${stats.sitesDown} site${stats.sitesDown > 1 ? 's' : ''} offline` : 'Alle sites online',
    status: stats.sitesDown > 0 ? 'warning' : 'good',
  };

  const secondaryStats = [
    {
      label: 'Response',
      value: loading ? '—' : `${stats.avgResponseTime}ms`,
      icon: Clock,
      color: stats.avgResponseTime > 500 ? 'warning' : 'default',
    },
    {
      label: 'Sites',
      value: loading ? '—' : String(stats.totalSites),
      icon: Globe,
      color: 'default',
    },
    {
      label: 'Alerts',
      value: loading ? '—' : String(stats.activeAlerts),
      icon: Bell,
      color: stats.criticalAlerts > 0 ? 'critical' : 'default',
    },
    {
      label: 'SSL Issues',
      value: loading ? '—' : String(stats.sslIssues || 0),
      icon: Shield,
      color: (stats.sslIssues || 0) > 0 ? 'warning' : 'default',
    },
  ];

  // Helper functions for SSL status
  const getSslStatus = (ssl: typeof apiSites[0]['ssl']) => {
    if (!ssl) return { status: 'unknown', label: 'Geen SSL', days: null };
    if (!ssl.isValid) return { status: 'error', label: 'Ongeldig', days: null };
    if (ssl.daysUntilExpiry !== null && ssl.daysUntilExpiry < 14) return { status: 'critical', label: `${ssl.daysUntilExpiry}d`, days: ssl.daysUntilExpiry };
    if (ssl.daysUntilExpiry !== null && ssl.daysUntilExpiry < 30) return { status: 'warning', label: `${ssl.daysUntilExpiry}d`, days: ssl.daysUntilExpiry };
    return { status: 'valid', label: ssl.daysUntilExpiry ? `${ssl.daysUntilExpiry}d` : 'Geldig', days: ssl.daysUntilExpiry };
  };

  const getPerformanceStatus = (score: number | null | undefined) => {
    if (score === null || score === undefined) return { status: 'unknown', label: '—' };
    if (score >= 90) return { status: 'good', label: `${score}` };
    if (score >= 50) return { status: 'average', label: `${score}` };
    return { status: 'poor', label: `${score}` };
  };

  // Transform sites for display with more details
  const sites = apiSites.slice(0, 5).map(site => {
    const sslInfo = getSslStatus(site.ssl);
    const perfInfo = getPerformanceStatus(site.performance?.score);
    
    return {
      id: site.id,
      name: site.name,
      url: site.url,
      status: site.currentStatus === 'up' ? 'up' : site.currentStatus === 'down' ? 'down' : 'warning',
      uptime: `${parseFloat(site.uptimePercentage || '0').toFixed(1)}%`,
      responseTime: site.avgResponseTime || 0,
      checkInterval: site.checkInterval,
      ssl: sslInfo,
      performance: perfInfo,
      lastChecked: site.lastCheckedAt 
        ? formatTimeAgo(new Date(site.lastCheckedAt))
        : 'Nog niet gecheckt',
    };
  });

  // Transform alerts for display
  const recentAlerts = apiAlerts.filter(a => !a.isRead).slice(0, 5).map(alert => ({
    id: alert.id,
    type: alert.type,
    site: apiSites.find(s => s.id === alert.siteId)?.name || 'Onbekend',
    message: alert.message,
    time: formatTimeAgo(new Date(alert.createdAt)),
    severity: alert.severity,
  }));

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'up':
        return styles.statusUp;
      case 'warning':
        return styles.statusWarning;
      case 'down':
        return styles.statusDown;
      default:
        return '';
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle size={16} className={styles.alertCritical} />;
      case 'warning':
        return <AlertTriangle size={16} className={styles.alertWarning} />;
      default:
        return <Bell size={16} />;
    }
  };

  return (
    <motion.div 
      className={styles.dashboard}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Onboarding Tour */}
      {showOnboarding && apiSites.length === 0 && !loading && (
        <OnboardingTour onComplete={() => setShowOnboarding(false)} />
      )}

      {/* Header */}
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className={styles.headerContent}>
          <h1>Dashboard</h1>
          <p>Overzicht van al je gemonitorde sites</p>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.timeToggle}>
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                className={`${styles.timeBtn} ${timeRange === range ? styles.timeBtnActive : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
          <Link href="/dashboard/sites/new" className={styles.addBtn}>
            <Plus size={18} />
            <span>Site toevoegen</span>
          </Link>
        </div>
      </motion.div>

      {/* Stats Section */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <>
          {/* Hero Stat + Secondary Stats Row */}
          <motion.div 
            className={styles.statsRow}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* Hero Uptime Card */}
            <motion.div 
              className={`${styles.heroCard} ${heroStat.status === 'warning' ? styles.heroWarning : ''}`}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <div className={styles.heroIcon}>
                <Activity size={24} />
              </div>
              <div className={styles.heroContent}>
                <span className={styles.heroValue}>{heroStat.value}</span>
                <span className={styles.heroLabel}>{heroStat.label}</span>
                <span className={`${styles.heroSubtitle} ${heroStat.status === 'warning' ? styles.heroSubtitleWarning : ''}`}>
                  {heroStat.status === 'good' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                  {heroStat.subtitle}
                </span>
              </div>
            </motion.div>

            {/* Secondary Stats */}
            <div className={styles.secondaryStats}>
              {secondaryStats.map((stat, index) => (
                <motion.div 
                  key={index} 
                  className={`${styles.secondaryStat} ${stat.color !== 'default' ? styles[`stat${stat.color.charAt(0).toUpperCase() + stat.color.slice(1)}`] : ''}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                >
                  <stat.icon size={16} className={styles.secondaryIcon} />
                  <span className={styles.secondaryValue}>{stat.value}</span>
                  <span className={styles.secondaryLabel}>{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Usage + Upgrade Row */}
          <div className={styles.usageRow}>
            <UsageIndicator 
              current={stats.totalSites} 
              max={maxSites} 
              label="Sites gebruikt" 
              planName={userPlan}
            />
            {userPlan === 'free' && stats.totalSites >= 2 && (
              <UpgradePrompt 
                type="contextual"
                message="Upgrade naar Pro voor 1-minuut checks"
              />
            )}
          </div>
        </>
      )}

      {/* Main Content Grid */}
      <motion.div 
        className={styles.contentGrid}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        {/* Sites List */}
        <div className={styles.sitesSection}>
          <div className={styles.sectionHeader}>
            <h2>Sites</h2>
            <Link href="/dashboard/sites" className={styles.viewAllLink}>
              Bekijk alle
              <ChevronRight size={16} />
            </Link>
          </div>
          {loading ? (
            <SitesSkeleton />
          ) : sites.length === 0 ? (
            <EmptyState type="sites" onAction={() => window.location.href = '/dashboard/sites/new'} />
          ) : (
            <div className={styles.sitesList}>
              {sites.map((site, index) => (
                <motion.div
                  key={site.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                  whileHover={{ x: 4, transition: { duration: 0.2 } }}
                >
                  <Link
                    href={`/dashboard/sites/${site.id}`}
                    className={styles.siteCard}
                  >
                    <div className={`${styles.siteStatus} ${getStatusClass(site.status)}`} />
                    <div className={styles.siteInfo}>
                      <span className={styles.siteName}>{site.name}</span>
                      <span className={styles.siteUrl}>{site.url}</span>
                    </div>
                    <div className={styles.siteMetrics}>
                      <div className={styles.metricItem}>
                        <TrendingUp size={14} />
                      <span className={styles.metricValue}>{site.uptime}</span>
                    </div>
                    <div className={styles.metricItem}>
                      <Clock size={14} />
                      <span className={`${styles.metricValue} ${site.responseTime > 500 ? styles.slow : ''}`}>
                        {site.responseTime > 0 ? `${site.responseTime}ms` : '—'}
                      </span>
                    </div>
                    <div className={styles.metricItem}>
                      {site.ssl.status === 'valid' && <ShieldCheck size={14} className={styles.sslValid} />}
                      {site.ssl.status === 'warning' && <ShieldAlert size={14} className={styles.sslWarning} />}
                      {site.ssl.status === 'critical' && <ShieldX size={14} className={styles.sslCritical} />}
                      {site.ssl.status === 'error' && <ShieldX size={14} className={styles.sslError} />}
                      {site.ssl.status === 'unknown' && <Shield size={14} className={styles.sslUnknown} />}
                      <span className={`${styles.metricValue} ${styles[`ssl${site.ssl.status.charAt(0).toUpperCase() + site.ssl.status.slice(1)}`]}`}>
                        {site.ssl.label}
                      </span>
                    </div>
                    <div className={styles.metricItem}>
                      <Gauge size={14} className={styles[`perf${site.performance.status.charAt(0).toUpperCase() + site.performance.status.slice(1)}`]} />
                      <span className={`${styles.metricValue} ${styles[`perf${site.performance.status.charAt(0).toUpperCase() + site.performance.status.slice(1)}`]}`}>
                        {site.performance.label}
                      </span>
                    </div>
                  </div>
                  <span className={styles.siteLastChecked}>{site.lastChecked}</span>
                  <ChevronRight size={16} className={styles.siteArrow} />
                </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Alerts */}
        <div className={styles.alertsSection}>
          <div className={styles.sectionHeader}>
            <h2>Recente Alerts</h2>
            <Link href="/dashboard/alerts" className={styles.viewAllLink}>
              Bekijk alle
              <ChevronRight size={16} />
            </Link>
          </div>
          {recentAlerts.length === 0 ? (
            <EmptyState type="alerts" />
          ) : (
            <div className={styles.alertsList}>
              {recentAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`${styles.alertCard} ${alert.severity === 'critical' ? styles.alertCritical : alert.severity === 'warning' ? styles.alertWarning : ''}`}
                >
                  <div className={styles.alertIcon}>
                    {getAlertIcon(alert.severity)}
                  </div>
                  <div className={styles.alertContent}>
                    <span className={styles.alertSite}>{alert.site}</span>
                    <span className={styles.alertMessage}>{alert.message}</span>
                    <span className={styles.alertTime}>{alert.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h3>Snelle acties</h3>
        <div className={styles.quickActionsGrid}>
          <Link href="/dashboard/sites/new" className={styles.quickAction}>
            <Plus size={20} />
            <span>Site toevoegen</span>
          </Link>
          <Link href="/dashboard/settings?tab=notifications" className={styles.quickAction}>
            <Bell size={20} />
            <span>Alert instellingen</span>
          </Link>
          <a href="https://docs.webstability.nl" target="_blank" rel="noopener noreferrer" className={styles.quickAction}>
            <ExternalLink size={20} />
            <span>Documentatie</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
