'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, CheckCircle, XCircle, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import styles from './page.module.css';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'input'>('input');
  const [error, setError] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-verify if token in URL
  useEffect(() => {
    if (token) {
      verifyToken(token);
    }
  }, [token]);

  async function verifyToken(tokenOrCode: string) {
    setStatus('verifying');
    setError('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenOrCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setStatus('error');
        setError(data.error || 'Verificatie mislukt');
      }
    } catch {
      setStatus('error');
      setError('Er is een fout opgetreden');
    }
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      setError('Voer de volledige 6-cijferige code in');
      return;
    }

    setIsSubmitting(true);
    await verifyToken(fullCode);
    setIsSubmitting(false);
  }

  function handleCodeChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }
    setCode(newCode);
    
    // Focus last filled input or submit
    if (pastedData.length === 6) {
      const lastInput = document.getElementById('code-5');
      lastInput?.focus();
    }
  }

  return (
    <div className={styles.container}>
      {/* Background effects */}
      <div className={styles.backgroundGlow} />
      <div className={styles.backgroundGrid} />

      <div className={styles.card}>
        {/* Verifying state */}
        {status === 'verifying' && (
          <div className={styles.statusContent}>
            <div className={styles.iconWrapper}>
              <div className={styles.spinnerRing}>
                <Loader2 className={styles.spinner} size={48} />
              </div>
            </div>
            <h1 className={styles.title}>Email verifiëren...</h1>
            <p className={styles.description}>
              Even geduld terwijl we je email verifiëren.
            </p>
          </div>
        )}

        {/* Success state */}
        {status === 'success' && (
          <div className={styles.statusContent}>
            <div className={`${styles.iconWrapper} ${styles.successIcon}`}>
              <CheckCircle size={48} />
            </div>
            <h1 className={styles.title}>Email geverifieerd! 🎉</h1>
            <p className={styles.description}>
              Je email is succesvol geverifieerd. Log nu in om naar je dashboard te gaan.
            </p>
            <Link href="/login" className={styles.button}>
              Inloggen
              <ArrowRight size={18} />
            </Link>
          </div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <div className={styles.statusContent}>
            <div className={`${styles.iconWrapper} ${styles.errorIcon}`}>
              <XCircle size={48} />
            </div>
            <h1 className={styles.title}>Verificatie mislukt</h1>
            <p className={styles.description}>{error}</p>
            <button 
              onClick={() => setStatus('input')} 
              className={styles.button}
            >
              Probeer opnieuw
              <RefreshCw size={18} />
            </button>
          </div>
        )}

        {/* Input state - enter code manually */}
        {status === 'input' && (
          <div className={styles.inputContent}>
            <div className={styles.iconWrapper}>
              <Mail size={48} />
            </div>
            <h1 className={styles.title}>Verifieer je email</h1>
            <p className={styles.description}>
              We hebben een 6-cijferige verificatiecode naar je email gestuurd.
              Voer de code hieronder in.
            </p>

            <form onSubmit={handleCodeSubmit} className={styles.form}>
              <div className={styles.codeInputs} onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={styles.codeInput}
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button 
                type="submit" 
                className={styles.button}
                disabled={isSubmitting || code.join('').length !== 6}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className={styles.buttonSpinner} size={18} />
                    Verifiëren...
                  </>
                ) : (
                  <>
                    Verifieer Email
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className={styles.resendText}>
              Geen code ontvangen?{' '}
              <button className={styles.resendLink}>
                Verstuur opnieuw
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Footer link */}
      <p className={styles.footerLink}>
        <Link href="/login">Terug naar inloggen</Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.backgroundGlow} />
        <div className={styles.card}>
          <div className={styles.statusContent}>
            <Loader2 className={styles.spinner} size={48} />
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
