'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input } from '@/components/ui';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Ongeldige inloggegevens');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('Er is iets misgegaan');
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
          <h1 className={styles.title}>Welkom terug</h1>
          <p className={styles.subtitle}>Log in op je account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" isLoading={isLoading} className={styles.button}>
            Inloggen
          </Button>
        </form>

        <p className={styles.footer}>
          Nog geen account?{' '}
          <Link href="/register" className={styles.link}>
            Registreer gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
