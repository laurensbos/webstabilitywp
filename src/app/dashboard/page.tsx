"use client";

import { useState, useEffect } from 'react';
import { 
  Activity, 
  Globe, 
  Clock, 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2, 
  RefreshCw,
  TrendingUp,
  Zap,
  Server,
  ExternalLink,
  BarChart3,
  Bell,
  Settings,
  ChevronDown,
  Search
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

// Mock uptime history for demo (last 30 days)
const generateMockHistory = () => {
  return Array.from({ length: 30 }, () => Math.random() > 0.05 ? 'up' : 'down');
};

export default function Dashboard() {
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
    if (!confirm('Are you sure you want to delete this monitor?')) return;
    
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
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <Zap className={styles.logoIcon} />
            <span>Webstability</span>
          </div>
        </div>
        
        <nav className={styles.nav}>
          <a href="#" className={`${styles.navItem} ${styles.active}`}>
            <BarChart3 size={18} />
            <span>Dashboard</span>
          </a>
          <a href="#" className={styles.navItem}>
            <Globe size={18} />
            <span>Monitors</span>
          </a>
          <a href="#" className={styles.navItem}>
            <Bell size={18} />
            <span>Alerts</span>
          </a>
          <a href="#" className={styles.navItem}>
            <Activity size={18} />
            <span>Status Pages</span>
          </a>
          <a href="#" className={styles.navItem}>
            <Settings size={18} />
            <span>Settings</span>
          </a>
        </nav>

        <div className={styles.sidebarFooter}>
          <a href="/" className={styles.backLink}>
            ← Back to Home
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1>Dashboard</h1>
            <p className={styles.headerSubtitle}>Monitor your WordPress sites in real-time</p>
          </div>
          <div className={styles.headerRight}>
            <button onClick={checkAllSites} className={styles.refreshButton}>
              <RefreshCw size={16} />
              Refresh All
            </button>
            <button onClick={() => setShowAddForm(true)} className={styles.addButton}>
              <Plus size={16} />
              Add Monitor
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(0, 229, 153, 0.1)' }}>
              <Server size={20} style={{ color: '#00e599' }} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.total}</span>
              <span className={styles.statLabel}>Total Monitors</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
              <CheckCircle2 size={20} style={{ color: '#22c55e' }} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.up}</span>
              <span className={styles.statLabel}>Sites Up</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
              <XCircle size={20} style={{ color: '#ef4444' }} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.down}</span>
              <span className={styles.statLabel}>Sites Down</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(0, 229, 153, 0.1)' }}>
              <TrendingUp size={20} style={{ color: '#00e599' }} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.avgUptime}%</span>
              <span className={styles.statLabel}>Avg. Uptime</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
              <Clock size={20} style={{ color: '#3b82f6' }} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{stats.avgResponseTime}ms</span>
              <span className={styles.statLabel}>Avg. Response</span>
            </div>
          </div>
        </section>

        {/* Filters & Search */}
        <section className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search monitors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles.filters}>
            <button 
              className={`${styles.filterBtn} ${selectedFilter === 'all' ? styles.active : ''}`}
              onClick={() => setSelectedFilter('all')}
            >
              All
            </button>
            <button 
              className={`${styles.filterBtn} ${selectedFilter === 'up' ? styles.active : ''}`}
              onClick={() => setSelectedFilter('up')}
            >
              <span className={styles.statusDotUp} /> Up
            </button>
            <button 
              className={`${styles.filterBtn} ${selectedFilter === 'down' ? styles.active : ''}`}
              onClick={() => setSelectedFilter('down')}
            >
              <span className={styles.statusDotDown} /> Down
            </button>
          </div>
        </section>

        {/* Add Monitor Modal */}
        {showAddForm && (
          <div className={styles.modal} onClick={() => setShowAddForm(false)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <h2>Add New Monitor</h2>
              <form onSubmit={addSite} className={styles.addForm}>
                <div className={styles.formGroup}>
                  <label>Website URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Display Name (optional)</label>
                  <input
                    type="text"
                    placeholder="My WordPress Site"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className={styles.formActions}>
                  <button type="button" onClick={() => setShowAddForm(false)} className={styles.cancelBtn}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.submitBtn}>
                    Add Monitor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Sites List */}
        <section className={styles.sitesSection}>
          {loading ? (
            <div className={styles.loading}>
              <RefreshCw className={styles.spinner} size={24} />
              <p>Loading monitors...</p>
            </div>
          ) : filteredSites.length === 0 ? (
            <div className={styles.empty}>
              <Globe size={48} />
              <h3>No monitors yet</h3>
              <p>Add your first WordPress site to start monitoring</p>
              <button onClick={() => setShowAddForm(true)} className={styles.addButton}>
                <Plus size={16} />
                Add Your First Monitor
              </button>
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
                        {status === 'up' && <CheckCircle2 className={styles.statusIconUp} size={20} />}
                        {status === 'down' && <XCircle className={styles.statusIconDown} size={20} />}
                        {status === 'unknown' && <AlertTriangle className={styles.statusIconUnknown} size={20} />}
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
                          className={styles.checkBtn}
                          title="Check now"
                        >
                          <RefreshCw size={14} className={checking === site.id ? styles.spinner : ''} />
                        </button>
                        <button
                          onClick={() => deleteSite(site.id)}
                          className={styles.deleteBtn}
                          title="Delete monitor"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className={styles.siteMetrics}>
                      <div className={styles.metric}>
                        <span className={styles.metricLabel}>Uptime</span>
                        <span className={styles.metricValue}>{uptime.toFixed(2)}%</span>
                      </div>
                      <div className={styles.metric}>
                        <span className={styles.metricLabel}>Response</span>
                        <span className={styles.metricValue}>
                          {responseTime ? `${responseTime}ms` : '—'}
                        </span>
                      </div>
                      <div className={styles.metric}>
                        <span className={styles.metricLabel}>Status</span>
                        <span className={`${styles.metricValue} ${styles[`status${status.charAt(0).toUpperCase() + status.slice(1)}`]}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                      <div className={styles.metric}>
                        <span className={styles.metricLabel}>Last Check</span>
                        <span className={styles.metricValue}>
                          {site.lastCheck 
                            ? new Date(site.lastCheck).toLocaleTimeString()
                            : '—'}
                        </span>
                      </div>
                    </div>

                    {/* Uptime Timeline */}
                    <div className={styles.uptimeTimeline}>
                      <div className={styles.timelineHeader}>
                        <span>Last 30 days</span>
                        <span>{uptime.toFixed(2)}% uptime</span>
                      </div>
                      <div className={styles.timelineBars}>
                        {history.map((day, i) => (
                          <div 
                            key={i} 
                            className={`${styles.timelineBar} ${styles[day]}`}
                            title={`Day ${i + 1}: ${day === 'up' ? 'Online' : 'Offline'}`}
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
      </main>
    </div>
  );
}
