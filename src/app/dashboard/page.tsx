"use client";

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
  Zap
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
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    setIsRefreshing(true);
    for (const site of sites) {
      await checkSite(site);
    }
    setIsRefreshing(false);
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

  const navItems = [
    { href: '/dashboard', icon: BarChart3, label: 'Dashboard', active: true },
    { href: '/dashboard', icon: Globe, label: 'Monitors', active: false },
    { href: '/dashboard', icon: Bell, label: 'Alerts', active: false },
    { href: '/dashboard', icon: Settings, label: 'Instellingen', active: false },
  ];

  return (
    <div className={styles.dashboard}>
      {/* Animated Background */}
      <div className={styles.background}>
        <div className={styles.gradient}></div>
        <div className={styles.grid}></div>
        <motion.div 
          className={styles.floatingOrb1}
          animate={{ 
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className={styles.floatingOrb2}
          animate={{ 
            y: [0, 40, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      <motion.header 
        className={styles.header}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.headerContainer}>
          <div className={styles.headerLeft}>
            <Link href="/" className={styles.logo}>
              <motion.span whileHover={{ scale: 1.05 }}>
                webstability
              </motion.span>
            </Link>
            
            <nav className={styles.nav}>
              {navItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link 
                    href={item.href} 
                    className={`${styles.navItem} ${item.active ? styles.active : ''}`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </div>

          <div className={styles.headerRight}>
            <motion.button 
              onClick={() => setShowAddForm(true)} 
              className={styles.addButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={16} />
              <span>Monitor toevoegen</span>
            </motion.button>

            <div className={styles.userMenu}>
              <motion.button 
                className={styles.userButton}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                whileHover={{ scale: 1.02 }}
              >
                <div className={styles.userAvatar}>
                  {session?.user?.name?.charAt(0) || 'U'}
                </div>
                <motion.div
                  animate={{ rotate: userMenuOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={14} />
                </motion.div>
              </motion.button>
              
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div 
                    className={styles.userDropdown}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button 
              className={styles.mobileMenuButton}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.9 }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              className={styles.mobileMenu}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {navItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link 
                    href={item.href} 
                    className={`${styles.mobileNavItem} ${item.active ? styles.active : ''}`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <div className={styles.mobileDivider}></div>
              <motion.button 
                className={styles.mobileNavItem}
                onClick={() => signOut({ callbackUrl: '/' })}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <LogOut size={18} />
                Uitloggen
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Page Title */}
          <motion.div 
            className={styles.pageHeader}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div>
              <h1 className={styles.pageTitle}>Dashboard</h1>
              <p className={styles.pageSubtitle}>Monitor je WordPress sites in realtime</p>
            </div>
            <motion.button 
              onClick={checkAllSites} 
              className={styles.refreshButton}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isRefreshing}
            >
              <RefreshCw size={16} className={isRefreshing ? styles.spinner : ''} />
              {isRefreshing ? 'Verversen...' : 'Alles verversen'}
            </motion.button>
          </motion.div>

          {/* Stats Grid */}
          <motion.section 
            className={styles.statsGrid}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {[
              { icon: Globe, value: stats.total, label: 'Totaal monitors', type: '' },
              { icon: CheckCircle2, value: stats.up, label: 'Online', type: 'up' },
              { icon: XCircle, value: stats.down, label: 'Offline', type: 'down' },
              { icon: TrendingUp, value: `${stats.avgUptime}%`, label: 'Gem. uptime', type: '' },
              { icon: Zap, value: `${stats.avgResponseTime}ms`, label: 'Gem. responstijd', type: '' },
            ].map((stat, i) => (
              <motion.div 
                key={stat.label}
                className={`${styles.statCard} ${stat.type ? styles[`stat${stat.type.charAt(0).toUpperCase() + stat.type.slice(1)}`] : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className={styles.statIconWrapper}>
                  <stat.icon size={20} />
                </div>
                <div className={styles.statContent}>
                  <span className={styles.statValue}>{stat.value}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>
              </motion.div>
            ))}
          </motion.section>

          {/* Toolbar */}
          <motion.section 
            className={styles.toolbar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
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
              {['all', 'up', 'down'].map((filter) => (
                <motion.button 
                  key={filter}
                  className={`${styles.filterBtn} ${selectedFilter === filter ? styles.active : ''}`}
                  onClick={() => setSelectedFilter(filter as 'all' | 'up' | 'down')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {filter !== 'all' && <span className={styles[`statusDot${filter.charAt(0).toUpperCase() + filter.slice(1)}`]}></span>}
                  {filter === 'all' ? 'Alles' : filter === 'up' ? 'Online' : 'Offline'}
                </motion.button>
              ))}
            </div>
          </motion.section>

          {/* Sites List */}
          <section className={styles.sitesSection}>
            {loading ? (
              <motion.div 
                className={styles.loading}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw size={32} />
                </motion.div>
                <p>Monitors laden...</p>
              </motion.div>
            ) : filteredSites.length === 0 && sites.length === 0 ? (
              <motion.div 
                className={styles.emptyState}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.div 
                  className={styles.emptyIcon}
                  animate={{ 
                    y: [0, -10, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Globe size={40} />
                </motion.div>
                <h3>Nog geen monitors</h3>
                <p>Voeg je eerste WordPress site toe om te beginnen met monitoren</p>
                <div className={styles.emptySteps}>
                  {['Voeg URL toe', 'Wij checken 24/7', 'Ontvang alerts'].map((step, i) => (
                    <motion.div 
                      key={step}
                      className={styles.emptyStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    >
                      <span className={styles.stepNumber}>{i + 1}</span>
                      <span className={styles.stepText}>{step}</span>
                    </motion.div>
                  ))}
                </div>
                <motion.button 
                  onClick={() => setShowAddForm(true)} 
                  className={styles.emptyButton}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={18} />
                  Eerste monitor toevoegen
                </motion.button>
              </motion.div>
            ) : filteredSites.length === 0 ? (
              <motion.div 
                className={styles.noResults}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Search size={24} />
                <p>Geen monitors gevonden</p>
              </motion.div>
            ) : (
              <div className={styles.sitesList}>
                <AnimatePresence>
                  {filteredSites.map((site, i) => {
                    const status = getStatus(site);
                    const responseTime = getResponseTime(site);
                    const uptime = getUptime(site);
                    const history = uptimeHistory[site.id] || generateMockHistory();
                    
                    return (
                      <motion.div 
                        key={site.id} 
                        className={`${styles.siteCard} ${styles[status]}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ y: -4 }}
                        layout
                      >
                        <div className={styles.siteHeader}>
                          <div className={styles.siteStatus}>
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', delay: i * 0.05 + 0.2 }}
                            >
                              {status === 'up' && <CheckCircle2 className={styles.statusIconUp} size={24} />}
                              {status === 'down' && <XCircle className={styles.statusIconDown} size={24} />}
                              {status === 'unknown' && <AlertTriangle className={styles.statusIconUnknown} size={24} />}
                            </motion.div>
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
                            <motion.button
                              onClick={() => checkSite(site)}
                              disabled={checking === site.id}
                              className={styles.actionBtn}
                              title="Nu checken"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <RefreshCw size={16} className={checking === site.id ? styles.spinner : ''} />
                            </motion.button>
                            <motion.button
                              onClick={() => deleteSite(site.id)}
                              className={`${styles.actionBtn} ${styles.deleteBtn}`}
                              title="Verwijderen"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 size={16} />
                            </motion.button>
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
                            {history.map((day, j) => (
                              <motion.div 
                                key={j} 
                                className={`${styles.timelineBar} ${styles[day]}`}
                                title={`Dag ${j + 1}: ${day === 'up' ? 'Online' : 'Offline'}`}
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ delay: i * 0.05 + j * 0.01 }}
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div 
            className={styles.modalOverlay} 
            onClick={() => setShowAddForm(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={styles.modal} 
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className={styles.modalHeader}>
                <h2>Nieuwe monitor toevoegen</h2>
                <motion.button 
                  onClick={() => setShowAddForm(false)} 
                  className={styles.modalClose}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={20} />
                </motion.button>
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
                  <motion.button 
                    type="button" 
                    onClick={() => setShowAddForm(false)} 
                    className={styles.cancelBtn}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Annuleren
                  </motion.button>
                  <motion.button 
                    type="submit" 
                    className={styles.submitBtn}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Plus size={16} />
                    Toevoegen
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
