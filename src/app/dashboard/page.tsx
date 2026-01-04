'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  Loader2,
  Zap,
  Activity
} from 'lucide-react';
import { useDashboardStats } from '@/hooks';
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
  const { stats, sites: apiSites, alerts: apiAlerts, loading } = useDashboardStats();
  const { data: session } = useSession();

  // Get plan info
  const planLimits: Record<string, number> = { free: 3, pro: 20, business: 100, enterprise: 1000 };
  const userPlan = session?.user?.plan || 'free';
  const maxSites = planLimits[userPlan] || 3;

  // Prepare stats data
  const statsData = [
    {
      label: 'Gemiddelde Uptime',
      value: loading ? '...' : `${stats.avgUptime.toFixed(2)}%`,
      change: '+0.12%',
      trend: 'up' as const,
      icon: TrendingUp,
    },
    {
      label: 'Gem. Response Time',
      value: loading ? '...' : `${stats.avgResponseTime}ms`,
      change: '-23ms',
      trend: 'up' as const,
      icon: Clock,
    },
    {
      label: 'Actieve Sites',
      value: loading ? '...' : String(stats.totalSites),
      change: stats.sitesDown > 0 ? `-${stats.sitesDown} offline` : 'Alles online',
      trend: stats.sitesDown > 0 ? 'down' as const : 'up' as const,
      icon: Globe,
    },
    {
      label: 'Alerts (7 dagen)',
      value: loading ? '...' : String(stats.activeAlerts),
      change: stats.criticalAlerts > 0 ? `${stats.criticalAlerts} kritiek` : 'Geen kritiek',
      trend: stats.criticalAlerts > 0 ? 'down' as const : 'up' as const,
      icon: Bell,
    },
  ];

  // Transform sites for display with more details
  const sites = apiSites.slice(0, 5).map(site => ({
    id: site.id,
    name: site.name,
    url: site.url,
    status: site.currentStatus === 'up' ? 'up' : site.currentStatus === 'down' ? 'down' : 'warning',
    uptime: `${parseFloat(site.uptimePercentage || '0').toFixed(2)}%`,
    responseTime: site.avgResponseTime || 0,
    checkInterval: site.checkInterval,
    lastChecked: site.lastCheckedAt 
      ? formatTimeAgo(new Date(site.lastCheckedAt))
      : 'Nog niet gecheckt',
  }));

  // Transform alerts for display
  const recentAlerts = apiAlerts.filter(a => !a.isRead).slice(0, 5).map(alert => ({
    id: alert.id,
    type: alert.type,
    site: apiSites.find(s => s.id === alert.siteId)?.name || 'Onbekend',
    message: alert.message,
    time: formatTimeAgo(new Date(alert.createdAt)),
    severity: alert.severity,
  }));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up':
        return <CheckCircle size={16} className={styles.statusUp} />;
      case 'warning':
        return <AlertTriangle size={16} className={styles.statusWarning} />;
      case 'down':
        return <XCircle size={16} className={styles.statusDown} />;
      default:
        return null;
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle size={18} className={styles.alertCritical} />;
      case 'warning':
        return <AlertTriangle size={18} className={styles.alertWarning} />;
      default:
        return <Bell size={18} />;
    }
  };

  return (
    <div className={styles.dashboard}>
      {/* Onboarding Tour */}
      {showOnboarding && apiSites.length === 0 && !loading && (
        <OnboardingTour onComplete={() => setShowOnboarding(false)} />
      )}

      {/* Header */}
      <div className={styles.header}>
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
      </div>

      {/* Stats Grid */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <>
          {/* Usage Indicator */}
          <UsageIndicator 
            current={stats.totalSites} 
            max={maxSites} 
            label="Sites gebruikt" 
            planName={userPlan}
          />
          
          {/* Contextual upgrade prompt for free users */}
          {userPlan === 'free' && stats.totalSites >= 2 && (
            <UpgradePrompt 
              type="contextual"
              message="Upgrade naar Pro voor 1-minuut checks en snellere detectie van problemen"
            />
          )}

          <div className={styles.statsGrid}>
          {statsData.map((stat, index) => (
          <div key={index} className={styles.statCard}>
            <div className={styles.statIcon}>
              <stat.icon size={20} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>{stat.label}</span>
              <div className={styles.statValue}>
                <span>{stat.value}</span>
                <span className={`${styles.statChange} ${stat.trend === 'up' ? styles.statChangeUp : styles.statChangeDown}`}>
                  {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        ))}
        </div>
        </>
      )}

      {/* Main Content Grid */}
      <div className={styles.contentGrid}>
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
              {sites.map((site) => (
                <Link
                  key={site.id}
                  href={`/dashboard/sites/${site.id}`}
                  className={styles.siteCard}
                >
                  <div className={styles.siteStatus}>
                    {getStatusIcon(site.status)}
                  </div>
                  <div className={styles.siteInfo}>
                    <span className={styles.siteName}>{site.name}</span>
                    <span className={styles.siteUrl}>{site.url}</span>
                  </div>
                  <div className={styles.siteStats}>
                    <div className={styles.siteStat}>
                      <span className={styles.siteStatValue}>{site.uptime}</span>
                      <span className={styles.siteStatLabel}>Uptime</span>
                    </div>
                    <div className={styles.siteStat}>
                      <span className={`${styles.siteStatValue} ${site.responseTime > 500 ? styles.slow : ''}`}>
                        {site.responseTime > 0 ? `${site.responseTime}ms` : '—'}
                      </span>
                      <span className={styles.siteStatLabel}>Response</span>
                    </div>
                    <div className={styles.siteStat}>
                      <span className={styles.siteStatValue}>{site.checkInterval}m</span>
                      <span className={styles.siteStatLabel}>Interval</span>
                    </div>
                  </div>
                  <span className={styles.siteLastChecked}>{site.lastChecked}</span>
                  <ChevronRight size={18} className={styles.siteArrow} />
                </Link>
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
                <div key={alert.id} className={styles.alertCard}>
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
      </div>

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
    </div>
  );
}
