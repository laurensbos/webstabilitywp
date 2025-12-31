'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import styles from './AddSiteModal.module.css';
import { X } from 'lucide-react';

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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onAdd(url, name);
      setUrl('');
      setName('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is iets misgegaan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
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
      </div>
    </div>
  );
}
