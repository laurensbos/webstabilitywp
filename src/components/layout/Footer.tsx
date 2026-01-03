'use client';

import { Lock, Globe } from 'lucide-react';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <span>webstability</span>
            </div>
            <p className={styles.footerTagline}>
              Professionele website monitoring voor moderne teams. Detecteer problemen binnen 30 seconden.
            </p>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <div className={styles.footerCopyright}>
            <p>© {new Date().getFullYear()} webstability. Alle rechten voorbehouden.</p>
            <p className={styles.businessInfo}>KVK: 91186307 • BTW: NL004875371B72</p>
          </div>
          <div className={styles.footerBadges}>
            <span className={styles.footerBadge}>
              <Lock size={14} />
              GDPR Compliant
            </span>
            <span className={styles.footerBadge}>
              <Globe size={14} />
              Made in NL 🇳🇱
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
