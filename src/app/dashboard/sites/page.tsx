'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSitesWithDetails, useCreateSite, useDeleteSite } from '@/hooks';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';

interface Site {
  id: string;
  name: string;
  url: string;
  status: 'up' | 'down' | 'degraded' | 'paused';
  uptime: number;
  responseTime: number;
  lastChecked: string;
  sslExpiry: string | null;
  sslStatus: 'valid' | 'expiring' | 'expired' | null;
  sslDaysUntilExpiry: number | null;
  checkInterval: number;
  performanceScore: number | null;
}

// Helper function to format time ago
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
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'uur' : 'uur'} geleden`;
  return `${diffDays} ${diffDays === 1 ? 'dag' : 'dagen'} geleden`;
}

// User plan limits
const planLimits: Record<string, number> = {
  free: 3,
  pro: 20,
  business: 100,
  enterprise: 999
};

export default function SitesPage() {
  const { data: session } = useSession();
  const { sites: apiSites, loading, error, refetch } = useSitesWithDetails();
  const { createSite, loading: isAdding } = useCreateSite();
  const { deleteSite } = useDeleteSite();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Add site form state
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [newSiteName, setNewSiteName] = useState('');

  // Transform API data to component format
  const sites: Site[] = (apiSites || []).map((site) => {
    // Determine SSL status from API data
    let sslStatus: 'valid' | 'expiring' | 'expired' | null = null;
    if (site.ssl) {
      if (!site.ssl.isValid) {
        sslStatus = 'expired';
      } else if (site.ssl.daysUntilExpiry !== null && site.ssl.daysUntilExpiry < 30) {
        sslStatus = 'expiring';
      } else {
        sslStatus = 'valid';
      }
    }

    return {
      id: site.id,
      name: site.name,
      url: site.url,
      status: site.currentStatus === 'unknown' ? 'paused' : site.currentStatus,
      uptime: parseFloat(site.uptimePercentage) || 0,
      responseTime: site.avgResponseTime || 0,
      lastChecked: formatTimeAgo(site.lastCheckedAt),
      sslExpiry: site.ssl?.validTo || null,
      sslStatus,
      sslDaysUntilExpiry: site.ssl?.daysUntilExpiry ?? null,
      checkInterval: site.checkInterval,
      performanceScore: site.performance?.score ?? null,
    };
  });

  // User plan info  
  const userPlan = {
    name: (session?.user as { plan?: string })?.plan || 'free',
    sitesUsed: sites.length,
    sitesLimit: planLimits[(session?.user as { plan?: string })?.plan || 'free'] || 3
  };

  const filteredSites = sites
    .filter(site => {
      const matchesSearch = site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           site.url.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || site.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'uptime':
          return b.uptime - a.uptime;
        case 'response':
          return a.responseTime - b.responseTime;
        case 'status':
          const statusOrder = { down: 0, degraded: 1, up: 2, paused: 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        default:
          return 0;
      }
    });

  const statusCounts = {
    all: sites.length,
    up: sites.filter(s => s.status === 'up').length,
    down: sites.filter(s => s.status === 'down').length,
    degraded: sites.filter(s => s.status === 'degraded').length,
    paused: sites.filter(s => s.status === 'paused').length
  };

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await createSite({
      url: newSiteUrl,
      name: newSiteName || new URL(newSiteUrl).hostname
    });
    
    if (result) {
      setShowAddModal(false);
      setNewSiteUrl('');
      setNewSiteName('');
      refetch();
    }
  };

  const getStatusLabel = (status: Site['status']) => {
    switch (status) {
      case 'up': return 'Online';
      case 'down': return 'Offline';
      case 'degraded': return 'Traag';
      case 'paused': return 'Gepauzeerd';
    }
  };

  const getSslLabel = (status: Site['sslStatus']) => {
    switch (status) {
      case 'valid': return 'Geldig';
      case 'expiring': return 'Verloopt';
      case 'expired': return 'Verlopen';
      default: return '—';
    }
  };

  const canAddMoreSites = userPlan.sitesUsed < userPlan.sitesLimit;

  // Calculate overall stats
  const overallUptime = sites.length > 0 
    ? (sites.reduce((sum, s) => sum + s.uptime, 0) / sites.length).toFixed(2) 
    : '0.00';
  
  const avgResponseTime = sites.length > 0
    ? Math.round(sites.filter(s => s.responseTime > 0).reduce((sum, s) => sum + s.responseTime, 0) / Math.max(1, sites.filter(s => s.responseTime > 0).length))
    : 0;

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Stats Overview */}
      <motion.div 
        className={styles.statsOverview}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={`${styles.statCard} ${styles.statCardOnline}`}>
          <div className={styles.statCardIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className={styles.statCardContent}>
            <span className={styles.statCardValue}>{statusCounts.up}</span>
            <span className={styles.statCardLabel}>Online</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statCardOffline}`}>
          <div className={styles.statCardIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className={styles.statCardContent}>
            <span className={styles.statCardValue}>{statusCounts.down}</span>
            <span className={styles.statCardLabel}>Offline</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statCardUptime}`}>
          <div className={styles.statCardIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div className={styles.statCardContent}>
            <span className={styles.statCardValue}>{overallUptime}%</span>
            <span className={styles.statCardLabel}>Gem. Uptime</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statCardResponse}`}>
          <div className={styles.statCardIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className={styles.statCardContent}>
            <span className={styles.statCardValue}>{avgResponseTime}ms</span>
            <span className={styles.statCardLabel}>Gem. Response</span>
          </div>
        </div>
      </motion.div>
      {/* Header */}
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div>
            <h1 className={styles.title}>Sites</h1>
            <p className={styles.subtitle}>
              {userPlan.sitesUsed} van {userPlan.sitesLimit} sites gebruikt
            </p>
          </div>
        </div>
        <button 
          className={styles.addButton}
          onClick={() => setShowAddModal(true)}
          disabled={!canAddMoreSites}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Site toevoegen</span>
        </button>
      </motion.div>

      {/* Plan limit warning */}
      {!canAddMoreSites && (
        <div className={styles.limitWarning}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div className={styles.limitWarningContent}>
            <p>Je hebt het maximum aantal sites bereikt voor je {userPlan.name} abonnement.</p>
            <Link href="/dashboard/settings" className={styles.upgradeLink}>
              Upgrade naar Business voor meer sites →
            </Link>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Zoek sites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <div className={styles.statusTabs}>
            {(['all', 'up', 'down', 'degraded', 'paused'] as const).map(status => (
              <button
                key={status}
                className={`${styles.statusTab} ${statusFilter === status ? styles.active : ''} ${styles[status]}`}
                onClick={() => setStatusFilter(status)}
              >
                <span className={styles.statusTabLabel}>
                  {status === 'all' ? 'Alle' : getStatusLabel(status)}
                </span>
                <span className={styles.statusTabCount}>{statusCounts[status]}</span>
              </button>
            ))}
          </div>

          <div className={styles.filterControls}>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="name">Sorteren op naam</option>
              <option value="status">Sorteren op status</option>
              <option value="uptime">Sorteren op uptime</option>
              <option value="response">Sorteren op snelheid</option>
            </select>

            <div className={styles.viewToggle}>
              <button 
                className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid weergave"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </button>
              <button 
                className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
                onClick={() => setViewMode('list')}
                title="Lijst weergave"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sites Grid/List */}
      {filteredSites.length > 0 ? (
        <motion.div 
          className={`${styles.sitesContainer} ${styles[viewMode]}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {filteredSites.map((site, index) => (
            <motion.div
              key={site.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <Link href={`/dashboard/sites/${site.id}`} className={styles.siteCard}>
              <div className={styles.siteHeader}>
                <div className={styles.siteInfo}>
                  <div className={`${styles.statusDot} ${styles[site.status]}`} />
                  <div>
                    <h3 className={styles.siteName}>{site.name}</h3>
                    <p className={styles.siteUrl}>{site.url}</p>
                  </div>
                </div>
                <span className={`${styles.statusBadge} ${styles[site.status]}`}>
                  {getStatusLabel(site.status)}
                </span>
              </div>

              <div className={styles.siteStats}>
                <div className={styles.statItem}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  <span className={`${styles.statValue} ${site.uptime >= 99.9 ? styles.excellent : site.uptime >= 99 ? styles.good : styles.poor}`}>
                    {site.uptime}%
                  </span>
                </div>
                <div className={styles.statItem}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className={`${styles.statValue} ${site.responseTime === 0 ? styles.offline : site.responseTime < 200 ? styles.excellent : site.responseTime < 500 ? styles.good : styles.poor}`}>
                    {site.responseTime === 0 ? '—' : `${site.responseTime}ms`}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 9l3 3 6-6" />
                  </svg>
                  <span className={`${styles.statValue} ${site.performanceScore === null ? styles.none : site.performanceScore >= 90 ? styles.excellent : site.performanceScore >= 50 ? styles.good : styles.poor}`}>
                    {site.performanceScore !== null ? site.performanceScore : '—'}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span className={`${styles.statValue} ${styles[site.sslStatus || 'none']}`}>
                    {getSslLabel(site.sslStatus)}
                  </span>
                </div>
              </div>

              <div className={styles.siteFooter}>
                <span className={styles.lastChecked}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {site.lastChecked}
                </span>
                <span className={styles.interval}>
                  Elke {site.checkInterval >= 1 ? `${site.checkInterval} min` : `${Math.round(site.checkInterval * 60)}s`}
                </span>
              </div>
            </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h3>Geen sites gevonden</h3>
          <p>Probeer andere zoektermen of filters.</p>
        </div>
      )}

      {/* Add Site Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Site toevoegen</h2>
              <button className={styles.closeButton} onClick={() => setShowAddModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddSite} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label htmlFor="url">Website URL *</label>
                <input
                  id="url"
                  type="url"
                  placeholder="https://voorbeeld.nl"
                  value={newSiteUrl}
                  onChange={(e) => setNewSiteUrl(e.target.value)}
                  required
                  className={styles.input}
                />
                <p className={styles.inputHint}>Voer de volledige URL in inclusief https://</p>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="name">Naam (optioneel)</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Mijn Website"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  className={styles.input}
                />
                <p className={styles.inputHint}>Wordt automatisch ingevuld als je dit leeg laat</p>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="interval">Check interval</label>
                <div className={styles.planInterval}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>
                    {userPlan.name.toLowerCase() === 'free' && 'Elke 5 minuten'}
                    {userPlan.name.toLowerCase() === 'starter' && 'Elke 3 minuten'}
                    {userPlan.name.toLowerCase() === 'pro' && 'Elke minuut'}
                    {userPlan.name.toLowerCase() === 'business' && 'Elke 30 seconden'}
                    {!['free', 'starter', 'pro', 'business'].includes(userPlan.name.toLowerCase()) && 'Elke 5 minuten'}
                  </span>
                  <span className={styles.planBadge}>{userPlan.name} plan</span>
                </div>
                <p className={styles.inputHint}>
                  {userPlan.name.toLowerCase() === 'free' && 'Upgrade naar Pro voor snellere checks.'}
                  {userPlan.name.toLowerCase() === 'starter' && 'Upgrade naar Pro voor 1 minuut checks.'}
                </p>
              </div>

              <div className={styles.formGroup}>
                <label>Notificaties</label>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkbox}>
                    <input type="checkbox" defaultChecked />
                    <span className={styles.checkmark} />
                    <span>E-mail bij downtime</span>
                  </label>
                  <label className={styles.checkbox}>
                    <input type="checkbox" defaultChecked />
                    <span className={styles.checkmark} />
                    <span>E-mail bij SSL problemen</span>
                  </label>
                  <label className={styles.checkbox}>
                    <input type="checkbox" />
                    <span className={styles.checkmark} />
                    <span>Dagelijks rapport</span>
                  </label>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => setShowAddModal(false)}
                >
                  Annuleren
                </button>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isAdding || !newSiteUrl}
                >
                  {isAdding ? (
                    <>
                      <span className={styles.spinner} />
                      Toevoegen...
                    </>
                  ) : (
                    'Site toevoegen'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
}
