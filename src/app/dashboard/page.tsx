'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui';
import { SiteCard, AddSiteModal, StatsCard } from '@/components/dashboard';
import { Site } from '@/lib/db/schema';
import { getPlan } from '@/lib/plans';
import styles from './page.module.css';
import { Globe, Activity, AlertTriangle, Clock, Plus } from 'lucide-react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const plan = getPlan((session?.user as { plan?: string })?.plan);

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
      setIsLoading(false);
    }
  };

  const handleAddSite = async (url: string, name: string) => {
    const res = await fetch('/api/sites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, name }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error);
    }

    fetchSites();
  };

  const sitesOnline = sites.filter(s => s.currentStatus === 'up').length;
  const sitesOffline = sites.filter(s => s.currentStatus === 'down').length;
  const avgUptime = sites.length > 0 
    ? sites.reduce((sum, s) => sum + parseFloat(s.uptimePercentage || '100'), 0) / sites.length 
    : 100;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Welkom terug, {session?.user?.name || 'gebruiker'}
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Site toevoegen
        </Button>
      </header>

      <div className={styles.stats}>
        <StatsCard
          title="Gemonitorde Sites"
          value={sites.length}
          subtitle={`${plan.sites - sites.length} over in je plan`}
          icon={Globe}
          color="blue"
        />
        <StatsCard
          title="Online"
          value={sitesOnline}
          icon={Activity}
          color="green"
        />
        <StatsCard
          title="Offline"
          value={sitesOffline}
          icon={AlertTriangle}
          color={sitesOffline > 0 ? 'red' : 'green'}
        />
        <StatsCard
          title="Gemiddelde Uptime"
          value={`${avgUptime.toFixed(1)}%`}
          icon={Clock}
          color="green"
        />
      </div>

      <section className={styles.sites}>
        <h2 className={styles.sectionTitle}>Je Sites</h2>
        
        {isLoading ? (
          <div className={styles.loading}>Sites laden...</div>
        ) : sites.length === 0 ? (
          <div className={styles.empty}>
            <Globe className={styles.emptyIcon} />
            <h3>Nog geen sites</h3>
            <p>Voeg je eerste site toe om te beginnen met monitoren</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={18} />
              Site toevoegen
            </Button>
          </div>
        ) : (
          <div className={styles.siteGrid}>
            {sites.map((site) => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
        )}
      </section>

      <AddSiteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddSite}
      />
    </div>
  );
}
