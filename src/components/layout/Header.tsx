'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Sparkles, ChevronRight } from 'lucide-react';
import styles from './Header.module.css';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const pathname = usePathname();
  
  // Hide auth buttons on auth pages
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {showBanner && (
        <div className={styles.promoBanner}>
          <div className={styles.promoBannerContent}>
            <Sparkles size={14} />
            <span><strong>20% korting</strong> met code <code>2026</code></span>
            <Link href="#pricing" className={styles.promoBannerLink}>Bekijk prijzen →</Link>
          </div>
          <button 
            className={styles.promoBannerClose} 
            onClick={() => setShowBanner(false)}
            aria-label="Sluiten"
          >
            <X size={14} />
          </button>
        </div>
      )}
      <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''} ${showBanner ? styles.headerWithBanner : ''}`}>
        <div className={styles.headerContainer}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoText}>webstability</span>
          </Link>
          
          {!isAuthPage && (
            <div className={styles.headerActions}>
              <Link href="/login" className={styles.btnGhost}>
                Log in
              </Link>
              <Link href="/register" className={styles.btnPrimary}>
                Start Free
                <ChevronRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
