'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useSites } from '@/hooks';
import { Copy, Check, ExternalLink, Eye, EyeOff, Palette } from 'lucide-react';
import styles from './page.module.css';

export default function StatusPageSettings() {
  const { data: session } = useSession();
  const { sites, loading } = useSites();
  const [copied, setCopied] = useState(false);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [pageTitle, setPageTitle] = useState('');
  const [pageDescription, setPageDescription] = useState('');

  // Generate slug from user name
  const userName = session?.user?.name || session?.user?.email?.split('@')[0] || '';
  const statusPageSlug = userName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  
  const statusPageUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/status/${statusPageSlug}`;

  useEffect(() => {
    // Select all sites by default
    if (sites.length > 0 && selectedSites.length === 0) {
      setSelectedSites(sites.map(s => s.id));
    }
  }, [sites, selectedSites.length]);

  useEffect(() => {
    // Set default title
    if (userName && !pageTitle) {
      setPageTitle(`${userName} Status`);
    }
  }, [userName, pageTitle]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(statusPageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleSite = (siteId: string) => {
    setSelectedSites(prev => 
      prev.includes(siteId)
        ? prev.filter(id => id !== siteId)
        : [...prev, siteId]
    );
  };

  const toggleAllSites = () => {
    if (selectedSites.length === sites.length) {
      setSelectedSites([]);
    } else {
      setSelectedSites(sites.map(s => s.id));
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Status Pagina</h1>
          <p className={styles.subtitle}>
            Deel een publieke status pagina met je klanten
          </p>
        </div>
        <a 
          href={statusPageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.previewButton}
        >
          <ExternalLink size={18} />
          Bekijk live
        </a>
      </div>

      {/* URL Card */}
      <div className={styles.urlCard}>
        <div className={styles.urlHeader}>
          <span className={styles.urlLabel}>Jouw status pagina URL</span>
          <span className={styles.publicBadge}>Publiek</span>
        </div>
        <div className={styles.urlInputGroup}>
          <input
            type="text"
            value={statusPageUrl}
            readOnly
            className={styles.urlInput}
          />
          <button 
            onClick={copyToClipboard}
            className={styles.copyButton}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Gekopieerd!' : 'Kopiëren'}
          </button>
        </div>
        <p className={styles.urlHint}>
          Deel deze link met je klanten om ze de status van je diensten te tonen
        </p>
      </div>

      {/* Preview */}
      <div className={styles.previewSection}>
        <div className={styles.sectionHeader}>
          <h2>Preview</h2>
        </div>
        <div className={styles.previewFrame}>
          <div className={styles.previewBrowser}>
            <div className={styles.browserDots}>
              <span /><span /><span />
            </div>
            <div className={styles.browserUrl}>{statusPageUrl}</div>
          </div>
          <iframe 
            src={statusPageUrl}
            className={styles.previewIframe}
            title="Status Page Preview"
          />
        </div>
      </div>

      {/* Sites Selection */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Weergegeven sites</h2>
          <button 
            className={styles.toggleAll}
            onClick={toggleAllSites}
          >
            {selectedSites.length === sites.length ? 'Deselecteer alles' : 'Selecteer alles'}
          </button>
        </div>
        <p className={styles.sectionDescription}>
          Kies welke sites zichtbaar zijn op je publieke status pagina
        </p>

        {loading ? (
          <div className={styles.loadingState}>Laden...</div>
        ) : sites.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Je hebt nog geen sites toegevoegd</p>
            <Link href="/dashboard/sites/new" className={styles.addSiteLink}>
              Site toevoegen →
            </Link>
          </div>
        ) : (
          <div className={styles.sitesList}>
            {sites.map((site) => (
              <div 
                key={site.id} 
                className={`${styles.siteItem} ${selectedSites.includes(site.id) ? styles.selected : ''}`}
                onClick={() => toggleSite(site.id)}
              >
                <div className={styles.siteCheckbox}>
                  {selectedSites.includes(site.id) ? (
                    <Eye size={18} />
                  ) : (
                    <EyeOff size={18} />
                  )}
                </div>
                <div className={styles.siteInfo}>
                  <span className={styles.siteName}>{site.name}</span>
                  <span className={styles.siteUrl}>{site.url}</span>
                </div>
                <div 
                  className={`${styles.siteStatus} ${styles[site.currentStatus]}`}
                >
                  {site.currentStatus === 'up' ? 'Online' : 
                   site.currentStatus === 'down' ? 'Offline' : 'Onbekend'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customization */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Aanpassen</h2>
          <span className={styles.proBadge}>Pro</span>
        </div>
        <p className={styles.sectionDescription}>
          Personaliseer het uiterlijk van je status pagina
        </p>

        <div className={styles.customizeGrid}>
          <div className={styles.formGroup}>
            <label>Pagina titel</label>
            <input
              type="text"
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              placeholder="Mijn Status"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Beschrijving</label>
            <input
              type="text"
              value={pageDescription}
              onChange={(e) => setPageDescription(e.target.value)}
              placeholder="Realtime status van onze diensten"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Logo URL (optioneel)</label>
            <input
              type="url"
              placeholder="https://example.com/logo.png"
              className={styles.input}
              disabled
            />
            <span className={styles.hint}>Beschikbaar in Pro abonnement</span>
          </div>

          <div className={styles.formGroup}>
            <label>Custom domein</label>
            <input
              type="text"
              placeholder="status.jouwdomein.nl"
              className={styles.input}
              disabled
            />
            <span className={styles.hint}>Beschikbaar in Business abonnement</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className={styles.actions}>
        <button className={styles.saveButton}>
          Opslaan
        </button>
      </div>
    </div>
  );
}
