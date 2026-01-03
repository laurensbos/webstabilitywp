'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useCreateSite, useSites } from '@/hooks';
import styles from './page.module.css';

const planLimits: Record<string, { sites: number; minInterval: number }> = {
  free: { sites: 3, minInterval: 5 },
  pro: { sites: 20, minInterval: 1 },
  business: { sites: 100, minInterval: 0.5 },
  enterprise: { sites: 999, minInterval: 0.5 }
};

export default function NewSitePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { sites, loading: loadingSites } = useSites();
  const { createSite, loading, error } = useCreateSite();

  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [urlError, setUrlError] = useState('');
  const [success, setSuccess] = useState(false);

  const userPlan = (session?.user as { plan?: string })?.plan || 'free';
  const planConfig = planLimits[userPlan] || planLimits.free;
  const canAddSite = sites.length < planConfig.sites;

  const validateUrl = (input: string): boolean => {
    setUrlError('');
    
    if (!input) {
      setUrlError('URL is verplicht');
      return false;
    }

    try {
      const urlObj = new URL(input.startsWith('http') ? input : `https://${input}`);
      if (!urlObj.hostname.includes('.')) {
        setUrlError('Vul een geldige URL in');
        return false;
      }
      return true;
    } catch {
      setUrlError('Vul een geldige URL in');
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUrl(url)) return;
    if (!canAddSite) return;

    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    const siteName = name || new URL(fullUrl).hostname;

    const result = await createSite({ url: fullUrl, name: siteName });
    
    if (result) {
      setSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/sites/${result.id}`);
      }, 1500);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <nav className={styles.breadcrumb}>
        <Link href="/dashboard/sites" className={styles.backLink}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Terug naar sites
        </Link>
      </nav>

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <h1 className={styles.title}>Nieuwe site toevoegen</h1>
          <p className={styles.subtitle}>
            Vul de URL in van de website die je wilt monitoren
          </p>
        </div>

        {!canAddSite && (
          <div className={styles.limitWarning}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div className={styles.limitWarningContent}>
              <p>Je hebt het maximum aantal sites bereikt ({planConfig.sites} sites).</p>
              <Link href="/dashboard/settings?tab=billing" className={styles.upgradeLink}>
                Upgrade je abonnement →
              </Link>
            </div>
          </div>
        )}

        {success ? (
          <div className={styles.successState}>
            <div className={styles.successIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2>Site toegevoegd!</h2>
            <p>We starten direct met monitoren...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="url" className={styles.label}>
                Website URL *
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputPrefix}>https://</span>
                <input
                  type="text"
                  id="url"
                  value={url.replace(/^https?:\/\//, '')}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (urlError) validateUrl(e.target.value);
                  }}
                  placeholder="voorbeeld.nl"
                  className={`${styles.input} ${urlError ? styles.inputError : ''}`}
                  disabled={loading || !canAddSite}
                />
              </div>
              {urlError && <span className={styles.errorText}>{urlError}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                Naam (optioneel)
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mijn website"
                className={styles.input}
                disabled={loading || !canAddSite}
              />
              <span className={styles.helpText}>
                Wordt automatisch ingevuld als je dit leeg laat
              </span>
            </div>

            <div className={styles.infoCard}>
              <h3>Wat gaan we monitoren?</h3>
              <ul>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Uptime monitoring elke {planConfig.minInterval} {planConfig.minInterval === 1 ? 'minuut' : 'minuten'}
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  SSL certificaat controle
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Response tijd meting
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Instant alerts via email
                </li>
              </ul>
            </div>

            {error && (
              <div className={styles.errorMessage}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </div>
            )}

            <div className={styles.formActions}>
              <Link href="/dashboard/sites" className={styles.cancelButton}>
                Annuleren
              </Link>
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading || !canAddSite}
              >
                {loading ? (
                  <>
                    <svg className={styles.spinner} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                    Toevoegen...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Site toevoegen
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Usage indicator */}
        <div className={styles.usageCard}>
          <div className={styles.usageHeader}>
            <span>Sites gebruikt</span>
            <span className={styles.usageCount}>
              {sites.length} / {planConfig.sites}
            </span>
          </div>
          <div className={styles.usageBar}>
            <div 
              className={styles.usageFill} 
              style={{ width: `${Math.min((sites.length / planConfig.sites) * 100, 100)}%` }}
            />
          </div>
          {sites.length >= planConfig.sites * 0.8 && (
            <p className={styles.usageWarning}>
              Je nadert je limiet. <Link href="/pricing">Upgrade voor meer sites</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
