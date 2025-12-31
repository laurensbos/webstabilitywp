"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import styles from '../login/Login.module.css';

function VerifyContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (res.ok) {
          setStatus('success');
          setTimeout(() => router.push('/login'), 3000);
        } else {
          setStatus('error');
        }
      } catch (err) {
        setStatus('error');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper} style={{ textAlign: 'center' }}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            <Zap className={styles.logoIcon} />
            <span>Webstability</span>
          </Link>
          
          {status === 'loading' && (
            <>
              <Loader2 size={64} style={{ color: '#00e599', margin: '1rem 0', animation: 'spin 1s linear infinite' }} />
              <h1>Verifying your email...</h1>
              <p>Please wait while we verify your account.</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle2 size={64} style={{ color: '#00e599', margin: '1rem 0' }} />
              <h1>Email verified!</h1>
              <p style={{ marginTop: '1rem' }}>
                Your account has been verified. Redirecting to login...
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle size={64} style={{ color: '#ef4444', margin: '1rem 0' }} />
              <h1>Verification failed</h1>
              <p style={{ marginTop: '1rem' }}>
                This verification link is invalid or has expired.
              </p>
              <Link href="/register" className={styles.submitBtn} style={{ marginTop: '2rem', textDecoration: 'none', display: 'inline-flex' }}>
                Try Again
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.formWrapper} style={{ textAlign: 'center' }}>
          <Loader2 size={64} style={{ color: '#00e599', margin: '1rem 0', animation: 'spin 1s linear infinite' }} />
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
