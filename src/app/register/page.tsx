'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Github, Chrome, User, Building2, Check } from 'lucide-react';
import { Header, Footer, Background } from '@/components/layout';
import styles from './page.module.css';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Er is iets misgegaan');
        setIsLoading(false);
        return;
      }
      
      // Success - redirect to verify email page
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch {
      setError('Er is iets misgegaan. Probeer het opnieuw.');
      setIsLoading(false);
    }
  };

  const benefits = [
    '5 websites gratis monitoren',
    'Geen creditcard nodig',
    'Setup in 2 minuten',
    '14 dagen Pro trial'
  ];

  return (
    <div className={styles.container}>
      <Background />
      <Header />

      <main className={styles.main}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h1>Account aanmaken</h1>
            <p>Start gratis met website monitoring</p>
          </div>

          {/* Step indicator */}
          <div className={styles.steps}>
            <div className={`${styles.step} ${step >= 1 ? styles.stepActive : ''}`}>
              <span className={styles.stepNumber}>1</span>
              <span className={styles.stepLabel}>Account</span>
            </div>
            <div className={styles.stepLine}></div>
            <div className={`${styles.step} ${step >= 2 ? styles.stepActive : ''}`}>
              <span className={styles.stepNumber}>2</span>
              <span className={styles.stepLabel}>Details</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {step === 1 && (
              <>
                <div className={styles.inputGroup}>
                  <label htmlFor="name">Volledige naam</label>
                  <div className={styles.inputWrapper}>
                    <User size={18} className={styles.inputIcon} />
                    <input
                      type="text"
                      id="name"
                      placeholder="Jan de Vries"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="email">Zakelijk email</label>
                  <div className={styles.inputWrapper}>
                    <Mail size={18} className={styles.inputIcon} />
                    <input
                      type="email"
                      id="email"
                      placeholder="jan@bedrijf.nl"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="password">Wachtwoord</label>
                  <div className={styles.inputWrapper}>
                    <Lock size={18} className={styles.inputIcon} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      placeholder="Min. 8 karakters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Verberg wachtwoord' : 'Toon wachtwoord'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className={styles.inputGroup}>
                  <label htmlFor="company">Bedrijfsnaam <span className={styles.optional}>(optioneel)</span></label>
                  <div className={styles.inputWrapper}>
                    <Building2 size={18} className={styles.inputIcon} />
                    <input
                      type="text"
                      id="company"
                      placeholder="Bedrijf B.V."
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.benefitsList}>
                  {benefits.map((benefit, index) => (
                    <div key={index} className={styles.benefitItem}>
                      <Check size={16} className={styles.benefitIcon} />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                {error && (
                  <div className={styles.error}>
                    {error}
                  </div>
                )}
              </>
            )}

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className={styles.loader}></span>
              ) : step === 1 ? (
                <>
                  Doorgaan
                  <ArrowRight size={18} />
                </>
              ) : (
                <>
                  Account aanmaken
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {step === 2 && (
              <button 
                type="button" 
                className={styles.backBtn}
                onClick={() => setStep(1)}
              >
                Terug
              </button>
            )}
          </form>

          {step === 1 && (
            <>
              <div className={styles.divider}>
                <span>of registreer met</span>
              </div>

              <div className={styles.socialButtons}>
                <button type="button" className={styles.socialBtn}>
                  <Chrome size={20} />
                  <span>Google</span>
                </button>
                <button type="button" className={styles.socialBtn}>
                  <Github size={20} />
                  <span>GitHub</span>
                </button>
              </div>
            </>
          )}

          <p className={styles.authFooter}>
            Al een account?{' '}
            <Link href="/login">Inloggen</Link>
          </p>

          <p className={styles.terms}>
            Door te registreren ga je akkoord met onze{' '}
            <Link href="/terms">Voorwaarden</Link> en{' '}
            <Link href="/privacy">Privacybeleid</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
