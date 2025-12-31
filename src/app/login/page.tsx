"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, AlertCircle, Star } from 'lucide-react';
import styles from './Login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Ongeldige email of wachtwoord. Probeer het opnieuw.');
      } else {
        router.push('/dashboard');
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
            <h1 className={styles.title}>Welkom terug</h1>
            <p className={styles.subtitle}>Log in om je dashboard te bekijken</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.error}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            
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
              <div className={styles.labelRow}>
                <label htmlFor="password">Wachtwoord</label>
                <Link href="/forgot-password" className={styles.forgotLink}>
                  Vergeten?
                </Link>
              </div>
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
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <Loader2 className={styles.spinner} size={18} />
              ) : (
                <>
                  Inloggen
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className={styles.footer}>
            Nog geen account?{' '}
            <Link href="/register">Gratis aanmelden</Link>
          </p>
        </div>

        <div className={styles.sidePanel}>
          <div className={styles.testimonial}>
            <div className={styles.stars}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={20} fill="#00e599" color="#00e599" />
              ))}
            </div>
            <blockquote>
              "Perfect understanding of my specific needs in a surprisingly short time. Fast delivery. Very pleased with the result."
            </blockquote>
            <div className={styles.author}>
              <div className={styles.avatar}>EC</div>
              <div>
                <div className={styles.authorName}>Ene Claudiu</div>
                <div className={styles.authorTitle}>Verified on Trustpilot</div>
              </div>
            </div>
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
