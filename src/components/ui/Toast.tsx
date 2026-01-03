'use client';

import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.map(t => 
      t.id === id ? { ...t, removing: true } as Toast & { removing: boolean } : t
    ));
    // Actually remove after animation
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className={styles.container}>
      {toasts.map((toast, index) => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onClose={() => removeToast(toast.id)}
          style={{ '--toast-index': index } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

function ToastItem({ 
  toast, 
  onClose,
  style 
}: { 
  toast: Toast; 
  onClose: () => void;
  style?: React.CSSProperties;
}) {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const duration = toast.duration ?? 5000;
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.duration, onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 300);
  };

  const icons = {
    success: <CheckCircle className={styles.icon} />,
    error: <XCircle className={styles.icon} />,
    warning: <AlertCircle className={styles.icon} />,
    info: <Info className={styles.icon} />,
  };

  return (
    <div 
      className={`${styles.toast} ${styles[toast.type]} ${isLeaving ? styles.leaving : ''}`}
      style={style}
    >
      <div className={styles.iconWrapper}>
        {icons[toast.type]}
      </div>
      <div className={styles.content}>
        <p className={styles.title}>{toast.title}</p>
        {toast.message && <p className={styles.message}>{toast.message}</p>}
      </div>
      <button className={styles.close} onClick={handleClose}>
        <X size={16} />
      </button>
      <div className={styles.progressBar}>
        <div 
          className={styles.progress} 
          style={{ animationDuration: `${toast.duration ?? 5000}ms` }}
        />
      </div>
    </div>
  );
}
