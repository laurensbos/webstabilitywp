'use client';

import { Particles } from '@/components/ui/Particles';
import styles from './Background.module.css';

export function Background() {
  return (
    <div className={styles.background}>
      <div className={styles.gradientOverlay} />
      <Particles />
    </div>
  );
}
