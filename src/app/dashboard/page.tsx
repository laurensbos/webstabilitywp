"use client";

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { 
  Globe, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2, 
  RefreshCw,
  TrendingUp,
  ExternalLink,
  BarChart3,
  Bell,
  Settings,
  Search,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';
import styles from './Dashboard.module.css';

interface Site {
  id: string;
  url: string;
  name: string;
  createdAt: number;
  lastCheck?: number;
  status?: 'up' | 'down' | 'unknown';
  responseTime?: number;
  uptime?: number;
}

interface CheckResult {
  status: 'up' | 'down';
  responseTime?: number;
  error?: string;
  statusCode?: number;
}

const generateMockHistory = () => {
  return Array.from({ length: 30 }, () => Math.random() > 0.05 ? 'up' : 'down');
};

export default function Dashboard() {
  const { data: session } = useSession();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [checkResults, setCheckResults] = useState<Record<string, CheckResult>>({});
  const [checking, setChecking] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'up' | 'down'>('all');
  const [uptimeHistory] = useState<Record<string, string[]>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const res = await fetch('/api/sites');
      const data = await res.json();
      setSites(data.sites || []);
    } catch (error) {
      console.error('Failed to fetch sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    try {
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl, name: newName || newUrl }),
      });
      
      if (res.ok) {
        setNewUrl('');
        setNewName('');
        setShowAddForm(false);
        fetchSites();
      }
    } catch (error) {
      console.error('Failed to add site:', error);
    }
  };

  const deleteSite = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze monitor wilt verwijderen?')) return;
    
    try {
      const res = await fetch(`/api/sites?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchSites();
      }
    } catch (error) {
      console.error('Failed to delete site:', error);
    }
  };

  const checkSite = async (site: Site) => {
    setChecking(site.id);
    try {
      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteId: site.id, url: site.url }),
      });
      const data = await res.json();
      setCheckResults(prev => ({
        ...prev,
        [site.id]: {
          status: data.status,
          responseTime: data.responseTime,
          error: data.error,
          statusCode: data.statusCode,
        },
      }));
      fetchSites();
    } catch (error) {
      console.error('Check failed:', error);
    } finally {
      setChecking(null);
    }
  };

  const checkAllSites = async () => {
    for (const site of sites) {
      await checkSite(site);
    }
  };

  const getStatus = (site: Site) => {
    if (checkResults[site.id]) {
      return checkResults[site.id].status;
    }
    return site.status || 'unknown';
  };

  const getResponseTime = (site: Site) => {
    if (checkResults[site.id]?.responseTime) {
      return checkResults[site.id].responseTime;
    }
    return site.responseTime;
  };

  const getUptime = (site: Site) => {
    return site.uptime || 99.9 + Math.random() * 0.1;
  };

  const filteredSites = sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          site.url.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || getStatus(site) === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: sites.length,
    up: sites.filter(s => getStatus(s) === 'up').length,
    down: sites.filter(s => getStatus(s) === 'down').length,
    avgUptime: sites.length > 0 
      ? (sites.reduce((acc, s) => acc + getUptime(s), 0) / sites.length).toFixed(2)
      : '0',
    avgResponseTime: sites.length > 0
      ? Math.round(sites.reduce((acc, s) => acc + (getResponseTime(s) || 0), 0) / sites.length)
      : 0,
  };

  return (
    <div className={styles.dashboard}>
      {/* Background */}
      <div className={styles.background}>
        <div className={styles.gradient}></div>
        <div className={styles.grid}></div>
      </div>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.headerLeft}>
            <Link href="/" className={styles.logo}>
              webstability
            </Link>
            
            <nav className={styles.nav}>
              <Link href="/dashboard" className={`${styles.navItem} ${styles.active}`}>
                <BarChart3 size={16} />
                Dashboard
              </Link>
              <Link href="/dashboard" className={styles.navItem}>
                <Globe size={16} />
                Monitors
              </Link>
              <Link href="/dashboard" className={styles.navItem}>
                <Bell size={16} />
                Alerts
              </Link>
              <Link href="/dashboard" className={styles.navItem}>
                <Settings size={16} />
                Instellingen
              </Link>
            </nav>
          </div>

          <div className={styles.headerRight}>
            <button onClick={() => setShowAddForm(true)} className={styles.addButton}>
              <Plus size={16} />
              <span>Monitor toevoegen</span>
            </button>

            <div className={styles.userMenu}>
              <button 
                className={styles.userButton}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className={styles.userAvatar}>
                  {session?.user?.name?.charAt(0) || 'U'}
                </div>
                <ChevronDown size={14} />
              </button>
              
              {userMenuOpen && (
                <div className={styles.userDropdown}>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{session?.user?.name || 'Gebruiker'}</span>
                    <span className={styles.userEmail}>{session?.user?.email}</span>
                  </div>
                  <div className={styles.dropdownDivider}></div>
                  <button className={styles.dropdownItem}>
                    <User size={14} />
                    Profiel
                  </button>
                  <button className={styles.dropdownItem}>
                    <Settings size={14} />
                    Instellingen
                  </button>
                  <div className={styles.dropdownDivider}></div>
                  <button 
                    className={styles.dropdownItem}
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    <LogOut size={14} />
                    Uitloggen
                  </button>
                </div>
              )}
            </div>

            <button 
              className={styles.mobileMenuButton}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <Link href="/dashboard" className={`${styles.mobileNavItem} ${styles.active}`}>
              <BarChart3 size={18} />
              Dashboard
            </Link>
            <Link href="/dashboard" className={styles.mobileNavItem}>
              <Globe size={18} />
              Monitors
            </Link>
            <Link href="/dashboard" className={styles.mobileNavItem}>
              <Bell size={18} />
              Alerts
            </Link>
            <Link href="/dashboard" className={styles.mobileNavItem}>
              <Settings size={18} />
              Instellingen
            </Link>
            <div className={styles.mobileDivider}></div>
            <button 
              className={styles.mobileNavItem}
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut size={18} />
              Uitloggen
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Page Title */}
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Dashboard</h1>
              <p className={styles.pageSubtitle}>Monitor je WordPress sites in realtime</p>
            </div>
            <button onClick={checkAllSites} className={styles.refreshButton}>
              <RefreshCw size={16} />
              Alles verversen
            </button>
          </div>

          {/* Stats Grid */}
          <section className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <Globe size={20} />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>{stats.total}</span>
                <span className={styles.statLabel}>Totaal monitors</span>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.statUp}`}>
              <div className={styles.statIconWrapper}>
                <CheckCircle2 size={20} />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>{stats.up}</span>
                <span className={styles.statLabel}>Online</span>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.statDown}`}>
              <div className={styles.statIconWrapper}>
                <XCircle size={20} />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>{stats.down}</span>
                <span className={styles.statLabel}>Offline</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <TrendingUp size={20} />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>{stats.avgUptime}%</span>
                <span className={styles.statLabel}>Gem. uptime</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIconWrapper}>
                <Clock size={20} />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>{stats.avgResponseTime}ms</span>
                <span className={styles.statLabel}>Gem. responstijd</span>
              </div>
            </div>
          </section>

          {/* Toolbar */}
          <section className={styles.toolbar}>
            <div className={styles.searchBox}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Zoek monitors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className={styles.filters}>
              <button 
                className={`${styles.filterBtn} ${selectedFilter === 'all' ? styles.active : ''}`}
                onClick={() => setSelectedFilter('all')}
              >
                Alles
              </button>
              <button 
                className={`${styles.filterBtn} ${selectedFilter === 'up' ? styles.active : ''}`}
                onClick={() => setSelectedFilter('up')}
              >
                <span className={styles.statusDotUp}></span>
                Online
              </button>
              <button 
                className={`${styles.filterBtn} ${selectedFilter === 'down' ? styles.active : ''}`}
                onClick={() => setSelectedFilter('down')}
              >
                <span className={styles.statusDotDown}></span>
                Offline
              </button>
            </div>
          </section>

          {/* Sites List */}
          <section className={styles.sitesSection}>
            {loading ? (
              <div className={styles.loading}>
                <RefreshCw className={styles.spinner} size={32} />
                <p>Monitors laden...</p>
              </div>
            ) : filteredSites.length === 0 && sites.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <Globe size={40} />
                </div>
                <h3>Nog geen monitors</h3>
                <p>Voeg je eerste WordPress site toe om te beginnen met monitoren</p>
                <div className={styles.emptySteps}>
                  <div className={styles.emptyStep}>
                    <span className={styles.stepNumber}>1</span>
                    <span className={styles.stepText}>Voeg URL toe</span>
                  </div>
                  <div className={styles.emptyStep}>
                    <span className={styles.stepNumber}>2</span>
                    <span className={styles.stepText}>Wij checken 24/7</span>
                  </div>
                  <div className={styles.emptyStep}>
                    <span className={styles.stepNumber}>3</span>
                    <span className={styles.stepText}>Ontvang alerts</span>
                  </div>
                </div>
                <button onClick={() => setShowAddForm(true)} className={styles.emptyButton}>
                  <Plus size={18} />
                  Eerste monitor toevoegen
                </button>
              </div>
            ) : filteredSites.length === 0 ? (
              <div className={styles.noResults}>
                <Search size={24} />
                <p>Geen monitors gevonden</p>
              </div>
            ) : (
              <div className={styles.sitesList}>
                {filteredSites.map((site) => {
                  const status = getStatus(site);
                  const responseTime = getResponseTime(site);
                  const uptime = getUptime(site);
                  const history = uptimeHistory[site.id] || generateMockHistory();
                  
                  return (
                    <div key={site.id} className={`${styles.siteCard} ${styles[status]}`}>
                      <div className={styles.siteHeader}>
                        <div className={styles.siteStatus}>
                          {status === 'up' && <CheckCircle2 className={styles.statusIconUp} size={24} />}
                          {status === 'down' && <XCircle className={styles.statusIconDown} size={24} />}
                          {status === 'unknown' && <AlertTriangle className={styles.statusIconUnknown} size={24} />}
                        </div>
                        <div className={styles.siteInfo}>
                          <h3 className={styles.siteName}>{site.name}</h3>
                          <a 
                            href={site.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={styles.siteUrl}
                          >
                            {site.url.replace(/^https?:\/\//, '')}
                            <ExternalLink size={12} />
                          </a>
                        </div>
                        <div className={styles.siteActions}>
                          <button
                            onClick={() => checkSite(site)}
                            disabled={checking === site.id}
                            className={styles.actionBtn}
                            title="Nu checken"
                          >
                            <RefreshCw size={16} className={checking === site.id ? styles.spinner : ''} />
                          </button>
                          <button
                            onClick={() => deleteSite(site.id)}
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            title="Verwijderen"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className={styles.siteMetrics}>
                        <div className={styles.metric}>
                          <span className={styles.metricValue}>{uptime.toFixed(2)}%</span>
                          <span className={styles.metricLabel}>Uptime</span>
                        </div>
                        <div className={styles.metric}>
                          <span className={styles.metricValue}>
                            {responseTime ? `${responseTime}ms` : '—'}
                          </span>
                          <span className={styles.metricLabel}>Responstijd</span>
                        </div>
                        <div className={styles.metric}>
                          <span className={`${styles.metricValue} ${styles[`text${status.charAt(0).toUpperCase() + status.slice(1)}`]}`}>
                            {status === 'up' ? 'Online' : status === 'down' ? 'Offline' : 'Onbekend'}
                          </span>
                          <span className={styles.metricLabel}>Status</span>
                        </div>
                        <div className={styles.metric}>
                          <span className={styles.metricValue}>
                            {site.lastCheck 
                              ? new Date(site.lastCheck).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
                              : '—'}
                          </span>
                          <span className={styles.metricLabel}>Laatste check</span>
                        </div>
                      </div>

                      <div className={styles.uptimeTimeline}>
                        <div className={styles.timelineHeader}>
                          <span>Laatste 30 dagen</span>
                          <span>{uptime.toFixed(2)}% uptime</span>
                        </div>
                        <div className={styles.timelineBars}>
                          {history.map((day, i) => (
                            <div 
                              key={i} 
                              className={`${styles.timelineBar} ${styles[day]}`}
                              title={`Dag ${i + 1}: ${day === 'up' ? 'Online' : 'Offline'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Add Modal */}
      {showAddForm && (
        <div className={styles.modalOverlay} onClick={() => setShowAddForm(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Nieuwe monitor toevoegen</h2>
              <button onClick={() => setShowAddForm(false)} className={styles.modalClose}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={addSite} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Website URL</label>
                <input
                  type="url"
                  placeholder="https://jouwsite.nl"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className={styles.formGroup}>
                <label>Naam (optioneel)</label>
                <input
                  type="text"
                  placeholder="Mijn WordPress Site"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowAddForm(false)} className={styles.cancelBtn}>
                  Annuleren
                </button>
                <button type="submit" className={styles.submitBtn}>
                  <Plus size={16} />
                  Toevoegen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
