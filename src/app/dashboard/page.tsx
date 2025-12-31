"use client";

import { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';

interface Site {
  id: string;
  url: string;
  name: string;
  createdAt: number;
}

interface CheckResult {
  status: 'up' | 'down';
  responseTime?: number;
  error?: string;
}

export default function Dashboard() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [checkResults, setCheckResults] = useState<Record<string, CheckResult>>({});
  const [checking, setChecking] = useState<string | null>(null);

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
        fetchSites();
      }
    } catch (error) {
      console.error('Failed to add site:', error);
    }
  };

  const deleteSite = async (id: string) => {
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
        },
      }));
    } catch (error) {
      console.error('Check failed:', error);
    } finally {
      setChecking(null);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <span className={styles.logo}>⚡</span> Webstability Dashboard
        </h1>
        <a href="/" className={styles.backLink}>← Back to Home</a>
      </header>

      <section className={styles.addSection}>
        <h2>Add New Site</h2>
        <form onSubmit={addSite} className={styles.form}>
          <input
            type="url"
            placeholder="https://example.com"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="text"
            placeholder="Site name (optional)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className={styles.input}
          />
          <button type="submit" className={styles.addButton}>
            Add Site
          </button>
        </form>
      </section>

      <section className={styles.sitesSection}>
        <h2>Your Sites ({sites.length})</h2>
        
        {loading ? (
          <p className={styles.loading}>Loading sites...</p>
        ) : sites.length === 0 ? (
          <p className={styles.empty}>No sites added yet. Add your first site above!</p>
        ) : (
          <div className={styles.sitesList}>
            {sites.map((site) => (
              <div key={site.id} className={styles.siteCard}>
                <div className={styles.siteInfo}>
                  <h3 className={styles.siteName}>{site.name}</h3>
                  <a href={site.url} target="_blank" rel="noopener noreferrer" className={styles.siteUrl}>
                    {site.url}
                  </a>
                </div>
                
                <div className={styles.siteStatus}>
                  {checkResults[site.id] && (
                    <span className={`${styles.status} ${styles[checkResults[site.id].status]}`}>
                      {checkResults[site.id].status === 'up' 
                        ? `✓ Up (${checkResults[site.id].responseTime}ms)` 
                        : '✗ Down'}
                    </span>
                  )}
                </div>

                <div className={styles.siteActions}>
                  <button
                    onClick={() => checkSite(site)}
                    disabled={checking === site.id}
                    className={styles.checkButton}
                  >
                    {checking === site.id ? 'Checking...' : 'Check Now'}
                  </button>
                  <button
                    onClick={() => deleteSite(site.id)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
