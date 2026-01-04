'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

interface StatusSite {
  id: string;
  name: string;
  url: string;
  status: 'up' | 'down' | 'degraded' | 'maintenance';
  uptime: number;
  responseTime: number;
  lastChecked: string;
}

interface Incident {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical';
  createdAt: string;
  updatedAt: string;
  affectedServices: string[];
}

interface StatusPageData {
  name: string;
  description: string;
  logo: string | null;
  sites: StatusSite[];
  overallStatus: 'operational' | 'degraded' | 'outage' | 'maintenance';
  overallUptime: number;
  avgResponseTime: number;
  incidents: Incident[];
  uptimeHistory: Array<{
    date: string;
    status: 'up' | 'down' | 'degraded';
    uptime: number;
  }>;
}

// Generate last 90 days for uptime bars
function generateUptimeDays(): Array<{ date: string; dayOfWeek: number }> {
  const days = [];
  const now = new Date();
  for (let i = 89; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    days.push({
      date: date.toISOString().split('T')[0],
      dayOfWeek: date.getDay()
    });
  }
  return days;
}

export default function PublicStatusPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<StatusPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subscribeMessage, setSubscribeMessage] = useState('');
  const [hoveredBar, setHoveredBar] = useState<{ date: string; uptime: number; x: number; y: number } | null>(null);

  // Format relative time for incidents
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Zojuist';
    if (diffMins < 60) return `${diffMins}m geleden`;
    if (diffHours < 24) return `${diffHours}u geleden`;
    if (diffDays < 7) return `${diffDays}d geleden`;
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail) return;
    
    setSubscribeStatus('loading');
    try {
      const res = await fetch('/api/status-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subscribeEmail, slug: resolvedParams.slug }),
      });
      
      const result = await res.json();
      
      if (res.ok) {
        setSubscribeStatus('success');
        setSubscribeMessage(result.message || 'Je ontvangt nu updates!');
        setSubscribeEmail('');
      } else {
        setSubscribeStatus('error');
        setSubscribeMessage(result.error || 'Er ging iets mis');
      }
    } catch {
      setSubscribeStatus('error');
      setSubscribeMessage('Er ging iets mis');
    }
    
    // Reset after 5 seconds
    setTimeout(() => {
      setSubscribeStatus('idle');
      setSubscribeMessage('');
    }, 5000);
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/status/${resolvedParams.slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Status pagina niet gevonden');
          } else {
            setError('Er ging iets mis');
          }
          return;
        }
        const statusData = await res.json();
        setData(statusData);
      } catch (err) {
        setError('Kon status niet laden');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    // Refresh every 60 seconds
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, [resolvedParams.slug]);

  const uptimeDays = generateUptimeDays();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up':
      case 'operational':
        return '#6366f1';
      case 'degraded':
        return '#f59e0b';
      case 'down':
      case 'outage':
        return '#ef4444';
      case 'maintenance':
        return '#6366f1';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'operational':
        return 'Alle systemen operationeel';
      case 'degraded':
        return 'Verminderde prestaties';
      case 'outage':
        return 'Storing gedetecteerd';
      case 'maintenance':
        return 'Gepland onderhoud';
      default:
        return 'Status onbekend';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up':
      case 'operational':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        );
      case 'degraded':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );
      case 'down':
      case 'outage':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.background} />
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner} />
          <p>Status laden...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.container}>
        <div className={styles.background} />
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1>{error || 'Status pagina niet gevonden'}</h1>
          <p>Controleer de URL en probeer het opnieuw</p>
          <Link href="/" className={styles.backButton}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Terug naar home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Background */}
      <div className={styles.background}>
        <div className={styles.gradientOrb1} />
        <div className={styles.gradientOrb2} />
        <div className={styles.gridOverlay} />
      </div>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            {data.logo ? (
              <img src={data.logo} alt={data.name} className={styles.logo} />
            ) : (
              <h1 className={styles.brandName}>{data.name}</h1>
            )}
            <span className={styles.statusBadge}>Status</span>
          </div>
          <a href="https://webstability.nl" target="_blank" rel="noopener noreferrer" className={styles.poweredBy}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            webstability
          </a>
        </div>
      </header>

      {/* Hero Status Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroInner}>
          {/* Main Status Card */}
          <div 
            className={styles.overallStatusCard}
            data-status={data.overallStatus}
          >
            <div 
              className={styles.statusIconWrapper}
              style={{ backgroundColor: `${getStatusColor(data.overallStatus)}15` }}
            >
              <span style={{ color: getStatusColor(data.overallStatus) }}>
                {getStatusIcon(data.overallStatus)}
              </span>
            </div>
            <div className={styles.statusInfo}>
              <h2 style={{ color: getStatusColor(data.overallStatus) }}>
                {getStatusLabel(data.overallStatus)}
              </h2>
              <p className={styles.statusDescription}>
                Systeemstatus voor {data.name}
              </p>
            </div>
            <div className={styles.lastUpdated}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Bijgewerkt: {new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {/* Metrics Row */}
          <div className={styles.metricsRow}>
            <div className={styles.metricCard}>
              <div className={styles.metricIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div className={styles.metricContent}>
                <span className={styles.metricValue}>{(data.overallUptime || 100).toFixed(2)}%</span>
                <span className={styles.metricLabel}>Overall Uptime</span>
              </div>
              <div className={styles.metricTrend}>
                <span className={styles.metricTrendUp}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                  Stabiel
                </span>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div className={styles.metricContent}>
                <span className={styles.metricValue}>{data.avgResponseTime || 0}ms</span>
                <span className={styles.metricLabel}>Gem. Response</span>
              </div>
              <div className={styles.metricTrend}>
                <span className={`${styles.metricTrendUp} ${(data.avgResponseTime || 0) > 500 ? styles.metricTrendWarning : ''}`}>
                  {(data.avgResponseTime || 0) < 200 ? 'Snel' : (data.avgResponseTime || 0) < 500 ? 'Normaal' : 'Traag'}
                </span>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <div className={styles.metricContent}>
                <span className={styles.metricValue}>{data.sites.length}</span>
                <span className={styles.metricLabel}>Gemonitorde Services</span>
              </div>
              <div className={styles.metricTrend}>
                <span className={styles.metricTrendUp}>
                  {data.sites.filter(s => s.status === 'up').length} online
                </span>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className={styles.metricContent}>
                <span className={styles.metricValue}>90d</span>
                <span className={styles.metricLabel}>Uptime Historie</span>
              </div>
              <div className={styles.metricTrend}>
                <span className={styles.metricTrendUp}>Beschikbaar</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className={styles.servicesSection}>
        <div className={styles.servicesInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Services</h2>
            <p className={styles.sectionSubtitle}>Real-time status van alle gemonitorde services</p>
          </div>
          
          <div className={styles.servicesList}>
            {data.sites.map((site) => (
              <div key={site.id} className={styles.serviceCard}>
                <div className={styles.serviceTop}>
                  <div className={styles.serviceMain}>
                    <div 
                      className={styles.serviceDot}
                      style={{ backgroundColor: getStatusColor(site.status) }}
                    />
                    <div className={styles.serviceDetails}>
                      <h3 className={styles.serviceName}>{site.name}</h3>
                      <span className={styles.serviceUrl}>{site.url}</span>
                    </div>
                  </div>
                  <div className={styles.serviceStats}>
                    <div className={styles.serviceStat}>
                      <span className={styles.serviceStatValue}>{site.uptime.toFixed(2)}%</span>
                      <span className={styles.serviceStatLabel}>Uptime</span>
                    </div>
                    <div className={styles.serviceStat}>
                      <span className={styles.serviceStatValue}>
                        {site.responseTime > 0 ? `${site.responseTime}ms` : '—'}
                      </span>
                      <span className={styles.serviceStatLabel}>Response</span>
                    </div>
                    <div 
                      className={styles.serviceStatusBadge}
                      style={{ 
                        backgroundColor: `${getStatusColor(site.status)}15`,
                        color: getStatusColor(site.status)
                      }}
                    >
                      {site.status === 'up' ? 'Operationeel' : 
                       site.status === 'down' ? 'Offline' : 
                       site.status === 'degraded' ? 'Traag' : 'Onderhoud'}
                    </div>
                  </div>
                </div>

                {/* 90-day uptime bars */}
                <div className={styles.uptimeSection}>
                  <div className={styles.uptimeBars}>
                    {uptimeDays.map((day) => {
                      const historyDay = data.uptimeHistory.find(h => h.date === day.date);
                      const dayUptime = historyDay?.uptime ?? 100;
                      
                      return (
                        <div
                          key={day.date}
                          className={styles.uptimeBar}
                          style={{ 
                            backgroundColor: dayUptime >= 99.9 ? 'rgba(99, 102, 241, 0.8)' : 
                                            dayUptime >= 99 ? 'rgba(99, 102, 241, 0.5)' :
                                            dayUptime >= 95 ? 'rgba(245, 158, 11, 0.7)' : 'rgba(239, 68, 68, 0.7)'
                          }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredBar({ date: day.date, uptime: dayUptime, x: rect.left + rect.width / 2, y: rect.top });
                          }}
                          onMouseLeave={() => setHoveredBar(null)}
                        />
                      );
                    })}
                  </div>
                  <div className={styles.uptimeLabels}>
                    <span>90 dagen geleden</span>
                    <span>Vandaag</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tooltip for uptime bars */}
      {hoveredBar && (
        <div 
          className={styles.uptimeTooltip}
          style={{ 
            left: hoveredBar.x, 
            top: hoveredBar.y - 10,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <span className={styles.tooltipDate}>
            {new Date(hoveredBar.date).toLocaleDateString('nl-NL', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric' 
            })}
          </span>
          <span className={styles.tooltipUptime}>
            {hoveredBar.uptime.toFixed(2)}% uptime
          </span>
        </div>
      )}

      {/* Recent Incidents Section */}
      <section className={styles.incidentsSection}>
        <div className={styles.incidentsInner}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recente Incidenten</h2>
            <p className={styles.sectionSubtitle}>Laatste 30 dagen</p>
          </div>
          
          {(!data.incidents || data.incidents.length === 0) ? (
            <div className={styles.noIncidents}>
              <div className={styles.noIncidentsIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p>Geen incidenten in de afgelopen 30 dagen</p>
              <span>Alle systemen draaien normaal</span>
            </div>
          ) : (
            <div className={styles.incidentsList}>
              {data.incidents.slice(0, 5).map((incident) => (
                <div key={incident.id} className={styles.incidentCard}>
                  <div className={styles.incidentHeader}>
                    <div className={`${styles.incidentSeverity} ${styles[`severity${incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}`]}`}>
                      {incident.severity === 'critical' ? 'Kritiek' : incident.severity === 'major' ? 'Ernstig' : 'Klein'}
                    </div>
                    <span className={styles.incidentTime}>{formatRelativeTime(incident.createdAt)}</span>
                  </div>
                  <h3 className={styles.incidentTitle}>{incident.title}</h3>
                  <div className={styles.incidentMeta}>
                    <span className={`${styles.incidentStatus} ${styles[`status${incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}`]}`}>
                      {incident.status === 'investigating' ? 'Onderzoeken' :
                       incident.status === 'identified' ? 'Geïdentificeerd' :
                       incident.status === 'monitoring' ? 'Monitoren' : 'Opgelost'}
                    </span>
                    {incident.affectedServices.length > 0 && (
                      <span className={styles.affectedServices}>
                        {incident.affectedServices.length} service{incident.affectedServices.length > 1 ? 's' : ''} getroffen
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Subscribe Section */}
      <section className={styles.subscribeSection}>
        <div className={styles.subscribeInner}>
          <div className={styles.subscribeCard}>
            <div className={styles.subscribeIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div className={styles.subscribeContent}>
              <h2>Blijf op de hoogte</h2>
              <p>Ontvang een notificatie wanneer er een incident of gepland onderhoud is.</p>
            </div>
            <form onSubmit={handleSubscribe} className={styles.subscribeForm}>
              <div className={styles.inputWrapper}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  placeholder="je@email.nl"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  className={styles.subscribeInput}
                  disabled={subscribeStatus === 'loading'}
                  required
                />
              </div>
              <button 
                type="submit" 
                className={styles.subscribeButton}
                disabled={subscribeStatus === 'loading'}
              >
                {subscribeStatus === 'loading' ? (
                  <span className={styles.buttonSpinner} />
                ) : (
                  <>
                    Inschrijven
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>
            {subscribeMessage && (
              <p className={`${styles.subscribeMessage} ${subscribeStatus === 'success' ? styles.successMessage : styles.errorMessage}`}>
                {subscribeStatus === 'success' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                )}
                {subscribeMessage}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p className={styles.footerText}>
            Deze status pagina wordt automatisch bijgewerkt
          </p>
          <a href="https://webstability.nl" target="_blank" rel="noopener noreferrer" className={styles.footerBrand}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            webstability.nl
          </a>
        </div>
      </footer>
    </div>
  );
}
