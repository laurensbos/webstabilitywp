'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { StatsCard, UptimeChart } from '@/components/dashboard';
import styles from './page.module.css';
import { 
  ArrowLeft, 
  Activity, 
  Clock, 
  Shield, 
  Zap,
  RefreshCw,
  Trash2,
  ExternalLink
} from 'lucide-react';

interface SiteDetails {
  site: {
    id: string;
    name: string;
    url: string;
    currentStatus: string;
    uptimePercentage: string;
    avgResponseTime: number;
  };
  uptime: {
    uptimePercentage: number;
    totalChecks: number;
    avgResponseTime: number;
    checks: Array<{
      id: string;
      checkedAt: Date | null;
      responseTime: number | null;
      isUp: boolean;
    }>;
  };
  performance: {
    performanceScore: number;
    accessibilityScore: number;
    bestPracticesScore: number;
    seoScore: number;
  } | null;
  ssl: {
    isValid: boolean;
    daysUntilExpiry: number;
    issuer: string;
  } | null;
}

export default function SiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState<SiteDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSiteDetails();
  }, [id]);

  const fetchSiteDetails = async () => {
    try {
      const res = await fetch(`/api/sites/${id}`);
      if (!res.ok) throw new Error('Site not found');
      const data = await res.json();
      setData(data);
    } catch (error) {
      console.error('Failed to fetch site:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheck = async () => {
    setIsChecking(true);
    try {
      await fetch(`/api/sites/${id}/check`, { method: 'POST' });
      await fetchSiteDetails();
    } catch (error) {
      console.error('Check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Weet je zeker dat je deze site wilt verwijderen?')) return;
    
    setIsDeleting(true);
    try {
      await fetch(`/api/sites?id=${id}`, { method: 'DELETE' });
      router.push('/dashboard');
    } catch (error) {
      console.error('Delete failed:', error);
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Site laden...</div>;
  }

  if (!data) {
    return <div className={styles.loading}>Site niet gevonden</div>;
  }

  const { site, uptime, performance, ssl } = data;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/dashboard" className={styles.backLink}>
            <ArrowLeft size={20} />
            Terug
          </Link>
          <div>
            <div className={styles.titleRow}>
              <div 
                className={styles.status} 
                style={{ 
                  backgroundColor: site.currentStatus === 'up' ? '#10b981' : 
                                   site.currentStatus === 'down' ? '#ef4444' : '#94a3b8' 
                }}
              />
              <h1 className={styles.title}>{site.name}</h1>
            </div>
            <a href={site.url} target="_blank" rel="noopener noreferrer" className={styles.url}>
              {site.url}
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={handleCheck} disabled={isChecking}>
            <RefreshCw size={16} className={isChecking ? styles.spinning : ''} />
            {isChecking ? 'Checken...' : 'Nu checken'}
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 size={16} />
            Verwijderen
          </Button>
        </div>
      </header>

      <div className={styles.stats}>
        <StatsCard
          title="Uptime"
          value={`${uptime.uptimePercentage.toFixed(2)}%`}
          subtitle={`${uptime.totalChecks} checks`}
          icon={Activity}
          color="green"
        />
        <StatsCard
          title="Gemiddelde Response"
          value={`${uptime.avgResponseTime}ms`}
          icon={Clock}
          color="blue"
        />
        <StatsCard
          title="Performance Score"
          value={performance?.performanceScore || '-'}
          icon={Zap}
          color={performance && performance.performanceScore >= 90 ? 'green' : 
                 performance && performance.performanceScore >= 50 ? 'yellow' : 'red'}
        />
        <StatsCard
          title="SSL Status"
          value={ssl?.isValid ? 'Geldig' : 'Ongeldig'}
          subtitle={ssl ? `Nog ${ssl.daysUntilExpiry} dagen` : undefined}
          icon={Shield}
          color={ssl?.isValid ? 'green' : 'red'}
        />
      </div>

      <div className={styles.grid}>
        <UptimeChart checks={uptime.checks} />

        {performance && (
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.metrics}>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Performance</span>
                  <span className={styles.metricValue} style={{ color: getScoreColor(performance.performanceScore) }}>
                    {performance.performanceScore}
                  </span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Accessibility</span>
                  <span className={styles.metricValue} style={{ color: getScoreColor(performance.accessibilityScore) }}>
                    {performance.accessibilityScore}
                  </span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Best Practices</span>
                  <span className={styles.metricValue} style={{ color: getScoreColor(performance.bestPracticesScore) }}>
                    {performance.bestPracticesScore}
                  </span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>SEO</span>
                  <span className={styles.metricValue} style={{ color: getScoreColor(performance.seoScore) }}>
                    {performance.seoScore}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 90) return '#10b981';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}
