"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, AlertCircle, User, Check, X, Star } from 'lucide-react';
import styles from './Register.module.css';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const passwordStrength = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const isPasswordStrong = passwordStrength.length && passwordStrength.uppercase && passwordStrength.number;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordStrong) {
      setError('Je wachtwoord voldoet niet aan de vereisten.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Er ging iets mis.');
      } else {
        router.push('/verify?email=' + encodeURIComponent(email));
      }
    } catch {
      setError('Er ging iets mis. Probeer het later opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.gradient}></div>
        <div className={styles.grid}></div>
      </div>

      <div className={styles.content}>
        <div className={styles.formWrapper}>
          <div className={styles.header}>
            <Link href="/" className={styles.logo}>
              webstability
            </Link>
            <h1 className={styles.title}>Account aanmaken</h1>
            <p className={styles.subtitle}>Start gratis met het monitoren van je sites</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.error}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            
            <div className={styles.inputGroup}>
              <label htmlFor="name">Naam</label>
              <div className={styles.inputWrapper}>
                <User size={18} className={styles.inputIcon} />
                <input
                  id="name"
                  type="text"
                  placeholder="Jouw naam"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <div className={styles.inputWrapper}>
                <Mail size={18} className={styles.inputIcon} />
                <input
                  id="email"
                  type="email"
                  placeholder="jouw@email.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password">Wachtwoord</label>
              <div className={styles.inputWrapper}>
                <Lock size={18} className={styles.inputIcon} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.eyeButton}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {password && (
                <div className={styles.passwordStrength}>
                  <div className={`${styles.strengthItem} ${passwordStrength.length ? styles.valid : ''}`}>
                    {passwordStrength.length ? <Check size={14} /> : <X size={14} />}
                    <span>Minimaal 8 karakters</span>
                  </div>
                  <div className={`${styles.strengthItem} ${passwordStrength.uppercase ? styles.valid : ''}`}>
                    {passwordStrength.uppercase ? <Check size={14} /> : <X size={14} />}
                    <span>Minimaal 1 hoofdletter</span>
                  </div>
                  <div className={`${styles.strengthItem} ${passwordStrength.number ? styles.valid : ''}`}>
                    {passwordStrength.number ? <Check size={14} /> : <X size={14} />}
                    <span>Minimaal 1 cijfer</span>
                  </div>
                </div>
              )}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <Loader2 className={styles.spinner} size={18} />
              ) : (
                <>
                  Gratis account aanmaken
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <p className={styles.terms}>
              Door je aan te melden ga je akkoord met onze{' '}
              <Link href="/terms">voorwaarden</Link> en{' '}
              <Link href="/privacy">privacybeleid</Link>.
            </p>
          </form>

          <p className={styles.footer}>
            Heb je al een account?{' '}
            <Link href="/login">Inloggen</Link>
          </p>
        </div>

        <div className={styles.sidePanel}>
          <div className={styles.benefits}>
            <h3>Wat je krijgt:</h3>
            <ul>
              <li>
                <Check size={18} className={styles.checkIcon} />
                <span>Monitor tot 5 websites gratis</span>
              </li>
              <li>
                <Check size={18} className={styles.checkIcon} />
                <span>5-minuten uptime checks</span>
              </li>
              <li>
                <Check size={18} className={styles.checkIcon} />
                <span>Email alerts bij downtime</span>
              </li>
              <li>
                <Check size={18} className={styles.checkIcon} />
                <span>30 dagen uptime historie</span>
              </li>
              <li>
                <Check size={18} className={styles.checkIcon} />
                <span>Performance monitoring</span>
              </li>
            </ul>
          </div>

          <div className={styles.trustpilot}>
            <div className={styles.trustpilotScore}>
              <span className={styles.score}>4.1</span>
              <div className={styles.trustpilotStars}>
                {[...Array(4)].map((_, i) => (
                  <Star key={i} size={16} fill="#00e599" color="#00e599" />
                ))}
                <Star size={16} fill="none" color="#00e599" />
              </div>
            </div>
            <span className={styles.trustpilotText}>5 reviews op Trustpilot</span>
          </div>
        </div>
      </div>
    </div>
  );
}
