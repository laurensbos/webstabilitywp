'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import styles from './AddSiteModal.module.css';
import { X, Globe, Shield, Zap, CheckCircle, Loader2 } from 'lucide-react';

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (url: string, name: string) => Promise<void>;
}

export function AddSiteModal({ isOpen, onClose, onAdd }: AddSiteModalProps) {
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingPhase, setLoadingPhase] = useState<'idle' | 'creating' | 'checking'>('idle');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setLoadingPhase('creating');

    try {
      // Small delay to show "creating" phase
      await new Promise(resolve => setTimeout(resolve, 300));
      setLoadingPhase('checking');
      
      await onAdd(url, name);
      setUrl('');
      setName('');
      setLoadingPhase('idle');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is iets misgegaan');
      setLoadingPhase('idle');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {loadingPhase !== 'idle' ? (
          <div className={styles.loadingState}>
            <div className={styles.loadingIcon}>
              <Globe className={styles.globeIcon} />
              <div className={styles.loadingRing}></div>
            </div>
            <h2 className={styles.loadingTitle}>
              {loadingPhase === 'creating' ? 'Site toevoegen...' : 'Eerste analyse uitvoeren...'}
            </h2>
            <p className={styles.loadingDescription}>
              {loadingPhase === 'creating' 
                ? 'Je website wordt toegevoegd aan WebStability'
                : 'We controleren uptime, SSL en performance. Dit kan tot 30 seconden duren.'
              }
            </p>
            
            <div className={styles.checkList}>
              <div className={`${styles.checkItem} ${loadingPhase === 'checking' ? styles.active : ''}`}>
                <div className={styles.checkIcon}>
                  {loadingPhase === 'checking' ? <Loader2 className={styles.spinning} /> : <CheckCircle />}
                </div>
                <span>Uptime check</span>
              </div>
              <div className={`${styles.checkItem} ${loadingPhase === 'checking' ? styles.active : ''}`}>
                <div className={styles.checkIcon}>
                  {loadingPhase === 'checking' ? <Loader2 className={styles.spinning} /> : <Shield />}
                </div>
                <span>SSL certificaat</span>
              </div>
              <div className={`${styles.checkItem} ${loadingPhase === 'checking' ? styles.active : ''}`}>
                <div className={styles.checkIcon}>
                  {loadingPhase === 'checking' ? <Loader2 className={styles.spinning} /> : <Zap />}
                </div>
                <span>Performance analyse</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.header}>
              <h2 className={styles.title}>Site toevoegen</h2>
              <button className={styles.close} onClick={onClose}>
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <Input
                label="Website URL"
                placeholder="https://jouwwebsite.nl"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />

              <Input
                label="Naam"
                placeholder="Mijn Website"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              
              <p className={styles.hint}>
                Na het toevoegen worden automatisch uptime, SSL en performance gecontroleerd.
              </p>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.actions}>
                <Button type="button" variant="ghost" onClick={onClose}>
                  Annuleren
                </Button>
                <Button type="submit" isLoading={isLoading}>
                  Toevoegen
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
