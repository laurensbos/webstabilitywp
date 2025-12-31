"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Shield,
  Clock,
  ArrowLeft,
  RefreshCw,
  Filter,
  ExternalLink
} from 'lucide-react';
import styles from './Alerts.module.css';

interface Alert {
  type: 'downtime' | 'recovery' | 'ssl_warning';
  timestamp: number;
  error?: string;
  daysUntilExpiry?: number;
  siteId: string;
  siteName: string;
  siteUrl: string;
}

export default function AlertsPage() {
  const { data: session, status } = useSession();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'downtime' | 'recovery' | 'ssl'>('all');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts');
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'ssl') return alert.type === 'ssl_warning';
    return alert.type === filter;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'downtime':
        return <XCircle className={styles.iconDown} />;
      case 'recovery':
        return <CheckCircle2 className={styles.iconUp} />;
      case 'ssl_warning':
        return <Shield className={styles.iconWarning} />;
      default:
        return <AlertTriangle className={styles.iconWarning} />;
    }
  };

  const getAlertTitle = (alert: Alert) => {
    switch (alert.type) {
      case 'downtime':
        return 'Website offline';
      case 'recovery':
        return 'Website hersteld';
      case 'ssl_warning':
        return `SSL verloopt over ${alert.daysUntilExpiry} dagen`;
      default:
        return 'Alert';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} min geleden`;
    if (hours < 24) return `${hours} uur geleden`;
    if (days < 7) return `${days} dagen geleden`;
    return date.toLocaleDateString('nl-NL', { day: '2-digit', month: 'short' });
  };

  if (status === 'loading' || loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <RefreshCw size={32} />
          </motion.div>
          <p>Alerts laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.background}>
        <div className={styles.gradient}></div>
      </div>

      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href="/dashboard" className={styles.backLink}>
            <ArrowLeft size={18} />
            Dashboard
          </Link>
          <h1>
            <Bell size={28} />
            Alerts
          </h1>
          <p>Bekijk alle downtime events en waarschuwingen</p>
        </motion.div>

        <motion.div 
          className={styles.toolbar}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className={styles.filters}>
            <Filter size={16} />
            {[
              { key: 'all', label: 'Alles' },
              { key: 'downtime', label: 'Downtime' },
              { key: 'recovery', label: 'Hersteld' },
              { key: 'ssl', label: 'SSL' },
            ].map(f => (
              <motion.button
                key={f.key}
                className={`${styles.filterBtn} ${filter === f.key ? styles.active : ''}`}
                onClick={() => setFilter(f.key as typeof filter)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {f.label}
              </motion.button>
            ))}
          </div>
          <motion.button 
            onClick={fetchAlerts} 
            className={styles.refreshBtn}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw size={16} />
          </motion.button>
        </motion.div>

        <section className={styles.alertsList}>
          {filteredAlerts.length === 0 ? (
            <motion.div 
              className={styles.empty}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Bell size={48} />
              </motion.div>
              <h3>Geen alerts</h3>
              <p>
                {filter === 'all' 
                  ? 'Je hebt nog geen alerts ontvangen. Goed nieuws!' 
                  : `Geen ${filter === 'ssl' ? 'SSL' : filter} alerts gevonden.`}
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredAlerts.map((alert, i) => (
                <motion.div
                  key={`${alert.siteId}-${alert.timestamp}`}
                  className={`${styles.alertCard} ${styles[alert.type]}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ x: 4 }}
                >
                  <div className={styles.alertIcon}>
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className={styles.alertContent}>
                    <div className={styles.alertHeader}>
                      <h3>{getAlertTitle(alert)}</h3>
                      <span className={styles.alertTime}>
                        <Clock size={12} />
                        {formatTime(alert.timestamp)}
                      </span>
                    </div>
                    <div className={styles.alertSite}>
                      <span className={styles.siteName}>{alert.siteName}</span>
                      <a href={alert.siteUrl} target="_blank" rel="noopener noreferrer" className={styles.siteUrl}>
                        {alert.siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                        <ExternalLink size={10} />
                      </a>
                    </div>
                    {alert.error && (
                      <div className={styles.alertError}>
                        {alert.error}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </section>
      </div>
    </div>
  );
}
