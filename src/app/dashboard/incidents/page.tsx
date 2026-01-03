'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Search,
  Filter,
  ChevronRight,
  XCircle,
  Loader2,
  AlertCircle,
  ArrowUpRight
} from 'lucide-react';
import styles from './page.module.css';

interface Incident {
  id: string;
  siteId: string;
  siteName: string;
  siteUrl: string;
  status: 'ongoing' | 'investigating' | 'resolved';
  errorMessage: string | null;
  httpStatus: number | null;
  startedAt: string;
  resolvedAt: string | null;
  duration: number | null;
  cause: string | null;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—';
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}u ${mins}m`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'ongoing': return '#ef4444';
    case 'investigating': return '#f59e0b';
    case 'resolved': return '#22c55e';
    default: return '#64748b';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'ongoing': return 'Actief';
    case 'investigating': return 'Onderzoekend';
    case 'resolved': return 'Opgelost';
    default: return status;
  }
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'ongoing' | 'resolved'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/incidents');
      if (res.ok) {
        const data = await res.json();
        setIncidents(data);
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    if (filter === 'ongoing' && incident.status !== 'ongoing' && incident.status !== 'investigating') return false;
    if (filter === 'resolved' && incident.status !== 'resolved') return false;
    if (search && !incident.siteName?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Stats
  const totalIncidents = incidents.length;
  const ongoingIncidents = incidents.filter(i => i.status === 'ongoing' || i.status === 'investigating').length;
  const avgDuration = incidents.filter(i => i.duration).reduce((sum, i) => sum + (i.duration || 0), 0) / (incidents.filter(i => i.duration).length || 1);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Loader2 className={styles.spinner} size={32} />
          <p>Incidenten laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Incidenten</h1>
          <p className={styles.subtitle}>Overzicht van alle downtimes en incidenten</p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <AlertTriangle size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{totalIncidents}</span>
            <span className={styles.statLabel}>Totaal incidenten</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <AlertCircle size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{ongoingIncidents}</span>
            <span className={styles.statLabel}>Actieve incidenten</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
            <Clock size={20} />
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{formatDuration(Math.round(avgDuration))}</span>
            <span className={styles.statLabel}>Gem. downtime</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Zoek op site naam..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterTab} ${filter === 'all' ? styles.filterTabActive : ''}`}
            onClick={() => setFilter('all')}
          >
            Alle
          </button>
          <button
            className={`${styles.filterTab} ${filter === 'ongoing' ? styles.filterTabActive : ''}`}
            onClick={() => setFilter('ongoing')}
          >
            Actief
            {ongoingIncidents > 0 && <span className={styles.badge}>{ongoingIncidents}</span>}
          </button>
          <button
            className={`${styles.filterTab} ${filter === 'resolved' ? styles.filterTabActive : ''}`}
            onClick={() => setFilter('resolved')}
          >
            Opgelost
          </button>
        </div>
      </div>

      {/* Incidents List */}
      {filteredIncidents.length === 0 ? (
        <div className={styles.emptyState}>
          <CheckCircle size={48} className={styles.emptyIcon} />
          <h3>Geen incidenten gevonden</h3>
          <p>
            {filter === 'all' 
              ? 'Er zijn nog geen incidenten geregistreerd. Dat is goed nieuws!' 
              : `Geen ${filter === 'ongoing' ? 'actieve' : 'opgeloste'} incidenten gevonden.`}
          </p>
        </div>
      ) : (
        <div className={styles.incidentsList}>
          {filteredIncidents.map((incident) => (
            <Link 
              key={incident.id}
              href={`/dashboard/incidents/${incident.id}`}
              className={styles.incidentCard}
            >
              <div className={styles.incidentStatus}>
                <div 
                  className={styles.statusDot} 
                  style={{ background: getStatusColor(incident.status) }}
                />
                <span 
                  className={styles.statusLabel}
                  style={{ color: getStatusColor(incident.status) }}
                >
                  {getStatusLabel(incident.status)}
                </span>
              </div>
              
              <div className={styles.incidentMain}>
                <h3 className={styles.incidentSite}>{incident.siteName || 'Onbekende site'}</h3>
                <p className={styles.incidentUrl}>{incident.siteUrl}</p>
                {incident.errorMessage && (
                  <p className={styles.incidentError}>
                    <XCircle size={14} />
                    {incident.errorMessage}
                  </p>
                )}
              </div>
              
              <div className={styles.incidentMeta}>
                <div className={styles.metaItem}>
                  <Clock size={14} />
                  <span>Gestart: {formatDate(incident.startedAt)}</span>
                </div>
                {incident.resolvedAt && (
                  <div className={styles.metaItem}>
                    <CheckCircle size={14} />
                    <span>Opgelost: {formatDate(incident.resolvedAt)}</span>
                  </div>
                )}
                {incident.duration && (
                  <div className={styles.metaItem}>
                    <span className={styles.durationBadge}>
                      Downtime: {formatDuration(incident.duration)}
                    </span>
                  </div>
                )}
              </div>
              
              <ChevronRight size={20} className={styles.incidentArrow} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
