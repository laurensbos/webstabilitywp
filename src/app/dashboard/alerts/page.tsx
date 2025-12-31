'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import styles from './page.module.css';
import { Bell, AlertTriangle, CheckCircle, Info, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';

interface Alert {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: string;
  isRead: boolean;
  createdAt: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      setIsLoading(false);
    }
  };

  const markAsRead = async (alertId: string) => {
    await fetch('/api/alerts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alertId, isRead: true }),
    });
    setAlerts(alerts.map(a => a.id === alertId ? { ...a, isRead: true } : a));
  };

  const getIcon = (type: string, severity: string) => {
    if (type === 'recovery') return <CheckCircle className={styles.iconSuccess} />;
    if (severity === 'critical') return <AlertTriangle className={styles.iconCritical} />;
    if (severity === 'warning') return <AlertTriangle className={styles.iconWarning} />;
    return <Info className={styles.iconInfo} />;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Alerts</h1>
          <p className={styles.subtitle}>Bekijk alle meldingen voor je sites</p>
        </div>
      </header>

      <Card>
        <CardContent>
          {isLoading ? (
            <div className={styles.loading}>Alerts laden...</div>
          ) : alerts.length === 0 ? (
            <div className={styles.empty}>
              <Bell className={styles.emptyIcon} />
              <h3>Geen alerts</h3>
              <p>Je hebt momenteel geen meldingen</p>
            </div>
          ) : (
            <div className={styles.alertList}>
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`${styles.alertItem} ${!alert.isRead ? styles.unread : ''}`}
                  onClick={() => !alert.isRead && markAsRead(alert.id)}
                >
                  <div className={styles.alertIcon}>
                    {getIcon(alert.type, alert.severity)}
                  </div>
                  <div className={styles.alertContent}>
                    <h4 className={styles.alertTitle}>{alert.title}</h4>
                    <p className={styles.alertMessage}>{alert.message}</p>
                    <span className={styles.alertTime}>
                      <Clock size={12} />
                      {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: nl })}
                    </span>
                  </div>
                  {!alert.isRead && <div className={styles.unreadDot} />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
