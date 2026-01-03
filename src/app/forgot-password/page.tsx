'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Header, Footer, Background } from '@/components/layout';
import styles from './page.module.css';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSubmitted(true);
      } else {
        setError(data.error || 'Er ging iets mis');
      }
    } catch (err) {
      setError('Kon geen verbinding maken met de server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Background />
      <Header />

      <main className={styles.main}>
        <div className={styles.authCard}>
          {!isSubmitted ? (
            <>
              <div className={styles.authHeader}>
                <h1>Wachtwoord vergeten?</h1>
                <p>Geen probleem. Voer je email in en we sturen je een reset link.</p>
              </div>

              <form onSubmit={handleSubmit} className={styles.authForm}>
                {error && (
                  <div className={styles.error}>
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                <div className={styles.inputGroup}>
                  <label htmlFor="email">Email</label>
                  <div className={styles.inputWrapper}>
                    <Mail size={18} className={styles.inputIcon} />
                    <input
                      type="email"
                      id="email"
                      placeholder="naam@bedrijf.nl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className={styles.submitBtn}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className={styles.loader}></span>
                  ) : (
                    <>
                      Reset link versturen
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <Link href="/login" className={styles.backLink}>
                <ArrowLeft size={16} />
                Terug naar inloggen
              </Link>
            </>
          ) : (
            <div className={styles.successState}>
              <div className={styles.successIcon}>
                <CheckCircle size={48} />
              </div>
              <h1>Check je inbox</h1>
              <p>
                We hebben een wachtwoord reset link gestuurd naar{' '}
                <strong>{email}</strong>
              </p>
              <p className={styles.successNote}>
                Geen email ontvangen? Check je spam folder of{' '}
                <button 
                  type="button" 
                  onClick={() => setIsSubmitted(false)}
                  className={styles.retryBtn}
                >
                  probeer opnieuw
                </button>
              </p>
              <Link href="/login" className={styles.backLink}>
                <ArrowLeft size={16} />
                Terug naar inloggen
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
