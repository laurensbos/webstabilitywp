'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowRight, CheckCircle, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Header, Footer, Background } from '@/components/layout';
import styles from './page.module.css';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Verify token on mount
  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setError('Geen reset token gevonden');
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/auth/reset-password?token=${token}`);
        const data = await res.json();

        if (res.ok && data.valid) {
          setIsValid(true);
          setEmail(data.email);
        } else {
          setError(data.error || 'Ongeldige of verlopen link');
        }
      } catch (err) {
        setError('Kon token niet verifiëren');
      } finally {
        setIsLoading(false);
      }
    }

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Wachtwoord moet minimaal 8 karakters zijn');
      return;
    }

    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/new-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.error || 'Kon wachtwoord niet wijzigen');
      }
    } catch (err) {
      setError('Er ging iets mis');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.authCard}>
        <div className={styles.loadingState}>
          <Loader2 size={32} className={styles.spinner} />
          <p>Link verifiëren...</p>
        </div>
      </div>
    );
  }

  if (!isValid && !isSuccess) {
    return (
      <div className={styles.authCard}>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>
            <AlertCircle size={48} />
          </div>
          <h1>Ongeldige link</h1>
          <p>{error || 'Deze reset link is ongeldig of verlopen.'}</p>
          <Link href="/forgot-password" className={styles.submitBtn}>
            Nieuwe link aanvragen
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className={styles.authCard}>
        <div className={styles.successState}>
          <div className={styles.successIcon}>
            <CheckCircle size={48} />
          </div>
          <h1>Wachtwoord gewijzigd!</h1>
          <p>Je wachtwoord is succesvol gewijzigd. Je wordt doorgestuurd naar de login pagina...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authCard}>
      <div className={styles.authHeader}>
        <h1>Nieuw wachtwoord instellen</h1>
        <p>Kies een nieuw wachtwoord voor <strong>{email}</strong></p>
      </div>

      <form onSubmit={handleSubmit} className={styles.authForm}>
        {error && (
          <div className={styles.error}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className={styles.inputGroup}>
          <label htmlFor="password">Nieuw wachtwoord</label>
          <div className={styles.inputWrapper}>
            <Lock size={18} className={styles.inputIcon} />
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Min. 8 karakters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="confirmPassword">Bevestig wachtwoord</label>
          <div className={styles.inputWrapper}>
            <Lock size={18} className={styles.inputIcon} />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              placeholder="Herhaal wachtwoord"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Password strength indicator */}
        {password && (
          <div className={styles.passwordStrength}>
            <div className={styles.strengthBars}>
              <div className={`${styles.strengthBar} ${password.length >= 8 ? styles.active : ''}`} />
              <div className={`${styles.strengthBar} ${password.length >= 12 ? styles.active : ''}`} />
              <div className={`${styles.strengthBar} ${/[A-Z]/.test(password) && /[0-9]/.test(password) ? styles.active : ''}`} />
              <div className={`${styles.strengthBar} ${/[!@#$%^&*]/.test(password) ? styles.active : ''}`} />
            </div>
            <span className={styles.strengthText}>
              {password.length < 8 ? 'Te kort' : password.length < 12 ? 'Redelijk' : 'Sterk'}
            </span>
          </div>
        )}

        <button 
          type="submit" 
          className={styles.submitBtn}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 size={18} className={styles.spinner} />
          ) : (
            <>
              Wachtwoord wijzigen
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className={styles.container}>
      <Background />
      <Header />

      <main className={styles.main}>
        <Suspense fallback={
          <div className={styles.authCard}>
            <div className={styles.loadingState}>
              <Loader2 size={32} className={styles.spinner} />
              <p>Laden...</p>
            </div>
          </div>
        }>
          <ResetPasswordContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
