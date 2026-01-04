'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Wrench, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  X,
  ChevronRight,
  Pause,
  Play
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';

interface MaintenanceWindow {
  id: string;
  siteId: string;
  siteName: string;
  siteUrl: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  createdAt: string;
}

interface Site {
  id: string;
  name: string;
  url: string;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('nl-NL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getMaintenanceStatus(window: MaintenanceWindow): 'active' | 'upcoming' | 'past' {
  const now = new Date();
  const start = new Date(window.startsAt);
  const end = new Date(window.endsAt);
  
  if (now >= start && now <= end && window.isActive) return 'active';
  if (now < start && window.isActive) return 'upcoming';
  return 'past';
}

function getDuration(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ${diffHours % 24}u`;
  if (diffHours > 0) return `${diffHours}u ${diffMins % 60}m`;
  return `${diffMins}m`;
}

export default function MaintenancePage() {
  const { data: session } = useSession();
  const [windows, setWindows] = useState<MaintenanceWindow[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'past'>('all');
  
  // Form state
  const [formData, setFormData] = useState({
    siteId: '',
    title: '',
    description: '',
    startsAt: '',
    endsAt: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [windowsRes, sitesRes] = await Promise.all([
        fetch('/api/maintenance'),
        fetch('/api/sites'),
      ]);
      
      if (windowsRes.ok) {
        const data = await windowsRes.json();
        setWindows(data);
      }
      
      if (sitesRes.ok) {
        const data = await sitesRes.json();
        setSites(data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create maintenance window');
      }

      await fetchData();
      setShowModal(false);
      setFormData({ siteId: '', title: '', description: '', startsAt: '', endsAt: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit onderhoudsvenster wilt verwijderen?')) return;

    try {
      const res = await fetch(`/api/maintenance/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error('Error deleting maintenance window:', err);
    }
  };

  const filteredWindows = windows.filter(w => {
    if (filter === 'all') return true;
    return getMaintenanceStatus(w) === filter;
  });

  const counts = {
    all: windows.length,
    active: windows.filter(w => getMaintenanceStatus(w) === 'active').length,
    upcoming: windows.filter(w => getMaintenanceStatus(w) === 'upcoming').length,
    past: windows.filter(w => getMaintenanceStatus(w) === 'past').length,
  };

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div 
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Wrench size={24} />
          </div>
          <div>
            <h1 className={styles.title}>Onderhoud</h1>
            <p className={styles.subtitle}>
              Plan onderhoudsvensters om valse alerts te voorkomen
            </p>
          </div>
        </div>
        <button 
          className={styles.addButton}
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} />
          <span>Nieuw venster</span>
        </button>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div 
        className={styles.filters}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        {(['all', 'active', 'upcoming', 'past'] as const).map((tab) => (
          <button
            key={tab}
            className={`${styles.filterTab} ${filter === tab ? styles.filterTabActive : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab === 'all' && 'Alle'}
            {tab === 'active' && 'Actief'}
            {tab === 'upcoming' && 'Gepland'}
            {tab === 'past' && 'Afgerond'}
            <span className={styles.filterCount}>{counts[tab]}</span>
          </button>
        ))}
      </motion.div>

      {/* Windows List */}
      {loading ? (
        <div className={styles.loading}>Laden...</div>
      ) : filteredWindows.length === 0 ? (
        <motion.div 
          className={styles.emptyState}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className={styles.emptyIcon}>
            <Wrench size={48} />
          </div>
          <h3>Geen onderhoudsvensters</h3>
          <p>Plan een onderhoudsvenster om monitoring tijdelijk te pauzeren.</p>
          <button 
            className={styles.emptyButton}
            onClick={() => setShowModal(true)}
          >
            <Plus size={18} />
            Nieuw venster aanmaken
          </button>
        </motion.div>
      ) : (
        <div className={styles.windowsList}>
          {filteredWindows.map((window, index) => {
            const status = getMaintenanceStatus(window);
            return (
              <motion.div
                key={window.id}
                className={`${styles.windowCard} ${styles[status]}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
              >
                <div className={styles.windowHeader}>
                  <div className={styles.windowInfo}>
                    <span className={`${styles.statusBadge} ${styles[status]}`}>
                      {status === 'active' && <Pause size={12} />}
                      {status === 'upcoming' && <Clock size={12} />}
                      {status === 'past' && <CheckCircle size={12} />}
                      {status === 'active' && 'Actief'}
                      {status === 'upcoming' && 'Gepland'}
                      {status === 'past' && 'Afgerond'}
                    </span>
                    <h3 className={styles.windowTitle}>{window.title}</h3>
                  </div>
                  <button 
                    className={styles.deleteButton}
                    onClick={() => handleDelete(window.id)}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className={styles.windowMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Site</span>
                    <span className={styles.metaValue}>{window.siteName}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Start</span>
                    <span className={styles.metaValue}>{formatDate(window.startsAt)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Einde</span>
                    <span className={styles.metaValue}>{formatDate(window.endsAt)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Duur</span>
                    <span className={styles.metaValue}>{getDuration(window.startsAt, window.endsAt)}</span>
                  </div>
                </div>

                {window.description && (
                  <p className={styles.windowDescription}>{window.description}</p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <motion.div 
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.modalHeader}>
              <h2>Nieuw onderhoudsvenster</h2>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.formGroup}>
                <label>Site</label>
                <select
                  value={formData.siteId}
                  onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                  required
                >
                  <option value="">Selecteer een site</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Titel</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Bijv. Server upgrade"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Beschrijving (optioneel)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Beschrijf wat er gaat gebeuren..."
                  rows={3}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Start</label>
                  <input
                    type="datetime-local"
                    value={formData.startsAt}
                    onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Einde</label>
                  <input
                    type="datetime-local"
                    value={formData.endsAt}
                    onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={() => setShowModal(false)}>
                  Annuleren
                </button>
                <button type="submit" className={styles.submitButton} disabled={submitting}>
                  {submitting ? 'Aanmaken...' : 'Venster aanmaken'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
