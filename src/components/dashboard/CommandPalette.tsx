'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './CommandPalette.module.css';

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
  category: 'navigation' | 'action' | 'settings';
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const commands: Command[] = [
    // Navigation
    {
      id: 'dashboard',
      label: 'Ga naar Dashboard',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
      action: () => router.push('/dashboard'),
      shortcut: 'G D',
      category: 'navigation',
    },
    {
      id: 'sites',
      label: 'Ga naar Sites',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      ),
      action: () => router.push('/dashboard/sites'),
      shortcut: 'G S',
      category: 'navigation',
    },
    {
      id: 'alerts',
      label: 'Ga naar Alerts',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
      action: () => router.push('/dashboard/alerts'),
      shortcut: 'G A',
      category: 'navigation',
    },
    {
      id: 'webhooks',
      label: 'Ga naar Webhooks',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 16.98h-5.99c-1.66 0-3.01-1.34-3.01-3s1.35-3 3.01-3c1.66 0 3 1.34 3 3v.98h3V14c0-3.31-2.69-6-6-6s-6 2.69-6 6 2.69 6 6 6h6v-3.02z" />
        </svg>
      ),
      action: () => router.push('/dashboard/webhooks'),
      shortcut: 'G W',
      category: 'navigation',
    },
    {
      id: 'settings',
      label: 'Ga naar Instellingen',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ),
      action: () => router.push('/dashboard/settings'),
      shortcut: 'G I',
      category: 'navigation',
    },
    {
      id: 'team',
      label: 'Ga naar Team',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      action: () => router.push('/dashboard/team'),
      shortcut: 'G T',
      category: 'navigation',
    },
    // Actions
    {
      id: 'add-site',
      label: 'Nieuwe site toevoegen',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      ),
      action: () => router.push('/dashboard/sites/new'),
      shortcut: 'N',
      category: 'action',
    },
    {
      id: 'billing',
      label: 'Billing & Upgrade',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      ),
      action: () => router.push('/dashboard/settings?tab=billing'),
      shortcut: 'B',
      category: 'action',
    },
    // Settings
    {
      id: 'notifications',
      label: 'Notificatie instellingen',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
      action: () => router.push('/dashboard/settings?tab=notifications'),
      category: 'settings',
    },
  ];

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.id.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Open with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        return;
      }

      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            setIsOpen(false);
            setQuery('');
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setQuery('');
          break;
      }
    },
    [isOpen, filteredCommands, selectedIndex]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={() => setIsOpen(false)}>
      <div className={styles.palette} onClick={(e) => e.stopPropagation()}>
        <div className={styles.inputWrapper}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="Zoek commando's..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className={styles.kbd}>ESC</kbd>
        </div>

        <div className={styles.commands}>
          {['navigation', 'action', 'settings'].map((category) => {
            const categoryCommands = filteredCommands.filter(
              (cmd) => cmd.category === category
            );
            if (categoryCommands.length === 0) return null;

            return (
              <div key={category} className={styles.category}>
                <div className={styles.categoryTitle}>
                  {category === 'navigation'
                    ? 'Navigatie'
                    : category === 'action'
                    ? 'Acties'
                    : 'Instellingen'}
                </div>
                {categoryCommands.map((cmd) => {
                  const index = filteredCommands.indexOf(cmd);
                  return (
                    <button
                      key={cmd.id}
                      className={`${styles.command} ${
                        index === selectedIndex ? styles.selected : ''
                      }`}
                      onClick={() => {
                        cmd.action();
                        setIsOpen(false);
                        setQuery('');
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className={styles.commandIcon}>{cmd.icon}</div>
                      <span className={styles.commandLabel}>{cmd.label}</span>
                      {cmd.shortcut && (
                        <kbd className={styles.commandKbd}>{cmd.shortcut}</kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}

          {filteredCommands.length === 0 && (
            <div className={styles.empty}>
              Geen resultaten voor "{query}"
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> navigeren
          </span>
          <span>
            <kbd>↵</kbd> selecteren
          </span>
          <span>
            <kbd>esc</kbd> sluiten
          </span>
        </div>
      </div>
    </div>
  );
}
