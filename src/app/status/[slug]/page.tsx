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

interface StatusPageData {
  name: string;
  description: string;
  logo: string | null;
  sites: StatusSite[];
  overallStatus: 'operational' | 'degraded' | 'outage' | 'maintenance';
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
        return '#22c55e';
      case 'degraded':
        return '#f59e0b';
      case 'down':
      case 'outage':
        return '#ef4444';
      case 'maintenance':
        return '#3b82f6';
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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Status laden...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <h1>{error || 'Status pagina niet gevonden'}</h1>
          <p>Controleer de URL en probeer het opnieuw</p>
          <Link href="/" className={styles.homeLink}>
            Terug naar home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          {data.logo ? (
            <img src={data.logo} alt={data.name} className={styles.logo} />
          ) : (
            <h1 className={styles.title}>{data.name}</h1>
          )}
          {data.description && (
            <p className={styles.description}>{data.description}</p>
          )}
        </div>
      </header>

      {/* Overall Status Banner */}
      <div 
        className={styles.statusBanner}
        style={{ 
          backgroundColor: `${getStatusColor(data.overallStatus)}15`,
          borderColor: `${getStatusColor(data.overallStatus)}40`
        }}
      >
        <div 
          className={styles.statusIndicator}
          style={{ backgroundColor: getStatusColor(data.overallStatus) }}
        />
        <span style={{ color: getStatusColor(data.overallStatus) }}>
          {getStatusLabel(data.overallStatus)}
        </span>
      </div>

      {/* Services List */}
      <div className={styles.services}>
        <h2 className={styles.sectionTitle}>Services</h2>
        
        {data.sites.map((site) => (
          <div key={site.id} className={styles.serviceCard}>
            <div className={styles.serviceHeader}>
              <div className={styles.serviceInfo}>
                <div 
                  className={styles.serviceDot}
                  style={{ backgroundColor: getStatusColor(site.status) }}
                />
                <span className={styles.serviceName}>{site.name}</span>
              </div>
              <div className={styles.serviceStatus}>
                <span className={styles.serviceUptime}>{site.uptime.toFixed(2)}% uptime</span>
                <span 
                  className={styles.serviceStatusLabel}
                  style={{ color: getStatusColor(site.status) }}
                >
                  {site.status === 'up' ? 'Operationeel' : 
                   site.status === 'down' ? 'Offline' : 
                   site.status === 'degraded' ? 'Traag' : 'Onderhoud'}
                </span>
              </div>
            </div>

            {/* 90-day uptime bars */}
            <div className={styles.uptimeBars}>
              {uptimeDays.map((day, index) => {
                // Simulate uptime data - in real app this comes from API
                const historyDay = data.uptimeHistory.find(h => h.date === day.date);
                const dayStatus = historyDay?.status || 'up';
                const dayUptime = historyDay?.uptime ?? 100;
                
                return (
                  <div
                    key={day.date}
                    className={styles.uptimeBar}
                    style={{ 
                      backgroundColor: dayUptime >= 99.9 ? '#22c55e' : 
                                      dayUptime >= 99 ? '#84cc16' :
                                      dayUptime >= 95 ? '#f59e0b' : '#ef4444'
                    }}
                    title={`${day.date}: ${dayUptime.toFixed(2)}% uptime`}
                  />
                );
              })}
            </div>
            <div className={styles.uptimeLabels}>
              <span>90 dagen geleden</span>
              <span>Vandaag</span>
            </div>
          </div>
        ))}
      </div>

      {/* Response Time */}
      <div className={styles.metrics}>
        <h2 className={styles.sectionTitle}>Response Times</h2>
        <div className={styles.metricsGrid}>
          {data.sites.map((site) => (
            <div key={site.id} className={styles.metricCard}>
              <span className={styles.metricLabel}>{site.name}</span>
              <span className={styles.metricValue}>
                {site.responseTime > 0 ? `${site.responseTime}ms` : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>
          Laatst bijgewerkt: {new Date().toLocaleString('nl-NL')}
        </p>
        <a href="https://webstability.nl" target="_blank" rel="noopener noreferrer" className={styles.poweredBy}>
          Powered by <strong>webstability</strong>
        </a>
      </footer>
    </div>
  );
}
