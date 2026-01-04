'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  User,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { pageVariants, staggerContainer, staggerItem } from '@/components/ui/PageTransition';
import styles from './page.module.css';

interface Incident {
  id: string;
  siteId: string;
  siteName: string;
  siteUrl: string;
  status: 'ongoing' | 'investigating' | 'resolved';
  errorMessage: string | null;
  httpStatus: number | null;
  screenshotUrl: string | null;
  startedAt: string;
  resolvedAt: string | null;
  duration: number | null;
  cause: string | null;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return '—';
  if (seconds < 60) return `${seconds} seconden`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minuten ${seconds % 60} seconden`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours} uur ${mins} minuten`;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [cause, setCause] = useState('');

  useEffect(() => {
    fetchIncident();
  }, [resolvedParams.id]);

  const fetchIncident = async () => {
    try {
      const res = await fetch(`/api/incidents/${resolvedParams.id}`);
      if (res.ok) {
        const data = await res.json();
        setIncident(data);
        setCause(data.cause || '');
      }
    } catch (error) {
      console.error('Error fetching incident:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'acknowledge' | 'resolve') => {
    if (!incident) return;
    setActionLoading(action);
    
    try {
      const res = await fetch(`/api/incidents/${incident.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, cause: cause || undefined }),
      });
      
      if (res.ok) {
        await fetchIncident();
      }
    } catch (error) {
      console.error('Error updating incident:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveCause = async () => {
    if (!incident) return;
    setActionLoading('cause');
    
    try {
      const res = await fetch(`/api/incidents/${incident.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cause }),
      });
      
      if (res.ok) {
        await fetchIncident();
      }
    } catch (error) {
      console.error('Error saving cause:', error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Loader2 className={styles.spinner} size={32} />
          <p>Incident laden...</p>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <XCircle size={48} />
          <h2>Incident niet gevonden</h2>
          <Link href="/dashboard/incidents" className={styles.backLink}>
            <ArrowLeft size={18} />
            Terug naar incidenten
          </Link>
        </div>
      </div>
    );
  }

  const isOngoing = incident.status === 'ongoing' || incident.status === 'investigating';
  const currentDuration = incident.startedAt 
    ? Math.floor((Date.now() - new Date(incident.startedAt).getTime()) / 1000)
    : 0;

  return (
    <motion.div 
      className={styles.container}
      initial="initial"
      animate="enter"
      variants={pageVariants}
    >
      {/* Header */}
      <motion.div className={styles.header} variants={staggerItem}>
        <Link href="/dashboard/incidents" className={styles.backButton}>
          <ArrowLeft size={18} />
          <span>Terug</span>
        </Link>
        
        <div className={styles.headerMain}>
          <div className={styles.statusBadge} data-status={incident.status}>
            {incident.status === 'ongoing' && <AlertTriangle size={16} />}
            {incident.status === 'investigating' && <RefreshCw size={16} />}
            {incident.status === 'resolved' && <CheckCircle size={16} />}
            <span>
              {incident.status === 'ongoing' && 'Actief incident'}
              {incident.status === 'investigating' && 'Onderzoekend'}
              {incident.status === 'resolved' && 'Opgelost'}
            </span>
          </div>
          
          <h1 className={styles.title}>{incident.siteName || 'Onbekende site'}</h1>
          <a 
            href={incident.siteUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.siteUrl}
          >
            {incident.siteUrl}
            <ExternalLink size={14} />
          </a>
        </div>

        {isOngoing && (
          <div className={styles.actions}>
            {incident.status === 'ongoing' && (
              <button 
                className={styles.actionBtn}
                onClick={() => handleAction('acknowledge')}
                disabled={actionLoading === 'acknowledge'}
              >
                {actionLoading === 'acknowledge' ? (
                  <Loader2 size={16} className={styles.spinner} />
                ) : (
                  <User size={16} />
                )}
                Erkennen
              </button>
            )}
            <button 
              className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
              onClick={() => handleAction('resolve')}
              disabled={actionLoading === 'resolve'}
            >
              {actionLoading === 'resolve' ? (
                <Loader2 size={16} className={styles.spinner} />
              ) : (
                <CheckCircle size={16} />
              )}
              Markeren als opgelost
            </button>
          </div>
        )}
      </motion.div>

      {/* Timeline */}
      <motion.div className={styles.timeline} variants={staggerItem}>
        <h2>Tijdlijn</h2>
        <div className={styles.timelineItems}>
          <div className={styles.timelineItem}>
            <div className={styles.timelineDot} style={{ background: '#ef4444' }} />
            <div className={styles.timelineContent}>
              <h4>Incident gestart</h4>
              <p>{formatDate(incident.startedAt)}</p>
              {incident.errorMessage && (
                <div className={styles.errorBox}>
                  <XCircle size={14} />
                  <span>{incident.errorMessage}</span>
                  {incident.httpStatus && (
                    <span className={styles.httpCode}>HTTP {incident.httpStatus}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {incident.acknowledgedAt && (
            <div className={styles.timelineItem}>
              <div className={styles.timelineDot} style={{ background: '#f59e0b' }} />
              <div className={styles.timelineContent}>
                <h4>Erkend door {incident.acknowledgedBy || 'Onbekend'}</h4>
                <p>{formatDate(incident.acknowledgedAt)}</p>
              </div>
            </div>
          )}

          {incident.resolvedAt ? (
            <div className={styles.timelineItem}>
              <div className={styles.timelineDot} style={{ background: '#6366f1' }} />
              <div className={styles.timelineContent}>
                <h4>Opgelost</h4>
                <p>{formatDate(incident.resolvedAt)}</p>
                <div className={styles.durationBox}>
                  <Clock size={14} />
                  <span>Totale downtime: {formatDuration(incident.duration)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.timelineItem}>
              <div className={styles.timelineDot} style={{ background: '#ef4444', animation: 'pulse 2s infinite' }} />
              <div className={styles.timelineContent}>
                <h4>Nog steeds actief</h4>
                <p>Lopende downtime: {formatDuration(currentDuration)}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Root Cause */}
      <motion.div className={styles.causeSection} variants={staggerItem}>
        <h2>
          <MessageSquare size={18} />
          Oorzaak analyse
        </h2>
        <p className={styles.causeDescription}>
          Documenteer wat de oorzaak was en hoe het is opgelost voor toekomstige referentie.
        </p>
        <textarea
          className={styles.causeInput}
          placeholder="Beschrijf de oorzaak van het incident..."
          value={cause}
          onChange={(e) => setCause(e.target.value)}
          rows={4}
        />
        <button 
          className={styles.saveBtn}
          onClick={handleSaveCause}
          disabled={actionLoading === 'cause' || cause === incident.cause}
        >
          {actionLoading === 'cause' ? (
            <Loader2 size={16} className={styles.spinner} />
          ) : (
            <CheckCircle size={16} />
          )}
          Opslaan
        </button>
      </motion.div>

      {/* Screenshot */}
      {incident.screenshotUrl && (
        <motion.div className={styles.screenshotSection} variants={staggerItem}>
          <h2>Screenshot bij incident</h2>
          <div className={styles.screenshotWrapper}>
            <img src={incident.screenshotUrl} alt="Screenshot van website tijdens incident" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
