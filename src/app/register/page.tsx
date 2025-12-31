"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Mail, Lock, User, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import styles from '../login/Login.module.css';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.formWrapper} style={{ textAlign: 'center' }}>
          <div className={styles.header}>
            <Link href="/" className={styles.logo}>
              <Zap className={styles.logoIcon} />
              <span>Webstability</span>
            </Link>
            <CheckCircle2 size={64} style={{ color: '#00e599', margin: '1rem 0' }} />
            <h1>Check your email</h1>
            <p style={{ marginTop: '1rem' }}>
              We've sent a verification link to <strong>{email}</strong>. 
              Please check your inbox and click the link to activate your account.
            </p>
          </div>
          <Link href="/login" className={styles.submitBtn} style={{ marginTop: '2rem', textDecoration: 'none', display: 'inline-flex' }}>
            Go to Login
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            <Zap className={styles.logoIcon} />
            <span>Webstability</span>
          </Link>
          <h1>Create your account</h1>
          <p>Start monitoring your WordPress sites for free</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.inputGroup}>
            <label htmlFor="name">Full Name</label>
            <div className={styles.inputWrapper}>
              <User size={18} />
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <div className={styles.inputWrapper}>
              <Mail size={18} />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.inputWrapper}>
              <Lock size={18} />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <Loader2 className={styles.spinner} size={18} />
            ) : (
              <>
                Create Account
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>Already have an account? <Link href="/login">Sign in</Link></p>
        </div>
      </div>

      <div className={styles.illustration}>
        <div className={styles.illustrationContent}>
          <h2>Start with 5 free monitors</h2>
          <p>No credit card required. Get started in seconds.</p>
          <div className={styles.features}>
            <div className={styles.feature}>✓ 5 monitors included free</div>
            <div className={styles.feature}>✓ 5-minute check intervals</div>
            <div className={styles.feature}>✓ Email alerts included</div>
            <div className={styles.feature}>✓ Upgrade anytime</div>
          </div>
        </div>
      </div>
    </div>
  );
}
