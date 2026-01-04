'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './ActionButton.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ActionButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
  className?: string;
  children?: ReactNode;
}

export function ActionButton({
  variant = 'secondary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  onClick,
  href,
  target,
  rel,
  className,
  children,
}: ActionButtonProps) {

  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    loading && styles.loading,
    className,
  ].filter(Boolean).join(' ');

  const content = (
    <>
      {loading ? (
        <svg 
          className={styles.spinner} 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
      ) : icon && iconPosition === 'left' ? (
        <span className={styles.icon}>{icon}</span>
      ) : null}
      {children && <span className={styles.label}>{children}</span>}
      {!loading && icon && iconPosition === 'right' ? (
        <span className={styles.icon}>{icon}</span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} target={target} rel={rel} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <motion.button
      className={classes}
      disabled={loading || disabled}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      {content}
    </motion.button>
  );
}

export default ActionButton;
