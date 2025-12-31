'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import styles from './page.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registratie mislukt');
      }

      router.push('/login?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Er is iets misgegaan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            <span>⚡</span> Web Stability
          </Link>
          <h1 className={styles.title}>Account aanmaken</h1>
          <p className={styles.subtitle}>Start gratis met monitoren</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Naam"
            type="text"
            placeholder="Jan Jansen"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Email"
            type="email"
            placeholder="jouw@email.nl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Wachtwoord"
            type="password"
            placeholder="Minimaal 8 karakters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" isLoading={isLoading} className={styles.button}>
            Account aanmaken
          </Button>
        </form>

        <p className={styles.terms}>
          Door te registreren ga je akkoord met onze{' '}
          <Link href="/terms" className={styles.link}>voorwaarden</Link>
        </p>

        <p className={styles.footer}>
          Al een account?{' '}
          <Link href="/login" className={styles.link}>
            Inloggen
          </Link>
        </p>
      </div>
    </div>
  );
}
