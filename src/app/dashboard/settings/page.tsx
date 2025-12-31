"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Bell, 
  Shield, 
  Mail, 
  Clock,
  ArrowLeft,
  RefreshCw,
  Check,
  User,
  Globe
} from 'lucide-react';
import styles from './Settings.module.css';

interface UserSettings {
  alertsEnabled: boolean;
  sslAlertsEnabled: boolean;
  emailFrequency: 'instant' | 'hourly' | 'daily';
  timezone: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [settings, setSettings] = useState<UserSettings>({
    alertsEnabled: true,
    sslAlertsEnabled: true,
    emailFrequency: 'instant',
    timezone: 'Europe/Amsterdam',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleSetting = (key: keyof UserSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (status === 'loading' || loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <RefreshCw size={32} />
          </motion.div>
          <p>Instellingen laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.background}>
        <div className={styles.gradient}></div>
      </div>

      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href="/dashboard" className={styles.backLink}>
            <ArrowLeft size={18} />
            Dashboard
          </Link>
          <h1>
            <Settings size={28} />
            Instellingen
          </h1>
          <p>Beheer je account en alert voorkeuren</p>
        </motion.div>

        {/* Account Info */}
        <motion.section 
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={styles.sectionHeader}>
            <User size={20} />
            <h2>Account</h2>
          </div>
          <div className={styles.card}>
            <div className={styles.accountInfo}>
              <div className={styles.avatar}>
                {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
              </div>
              <div className={styles.accountDetails}>
                <span className={styles.name}>{session?.user?.name || 'Gebruiker'}</span>
                <span className={styles.email}>{session?.user?.email}</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Notifications */}
        <motion.section 
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.sectionHeader}>
            <Bell size={20} />
            <h2>Notificaties</h2>
          </div>
          <div className={styles.card}>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <div className={styles.settingIcon}>
                  <Mail size={18} />
                </div>
                <div>
                  <h3>Downtime Alerts</h3>
                  <p>Ontvang email alerts als een site offline gaat</p>
                </div>
              </div>
              <motion.button
                className={`${styles.toggle} ${settings.alertsEnabled ? styles.active : ''}`}
                onClick={() => toggleSetting('alertsEnabled')}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className={styles.toggleKnob}
                  animate={{ x: settings.alertsEnabled ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <div className={styles.settingIcon}>
                  <Shield size={18} />
                </div>
                <div>
                  <h3>SSL Waarschuwingen</h3>
                  <p>Krijg een melding als je SSL certificaat bijna verloopt</p>
                </div>
              </div>
              <motion.button
                className={`${styles.toggle} ${settings.sslAlertsEnabled ? styles.active : ''}`}
                onClick={() => toggleSetting('sslAlertsEnabled')}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className={styles.toggleKnob}
                  animate={{ x: settings.sslAlertsEnabled ? 20 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </motion.button>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <div className={styles.settingIcon}>
                  <Clock size={18} />
                </div>
                <div>
                  <h3>Email Frequentie</h3>
                  <p>Hoe snel je alerts wilt ontvangen</p>
                </div>
              </div>
              <select 
                value={settings.emailFrequency}
                onChange={(e) => setSettings(prev => ({ ...prev, emailFrequency: e.target.value as UserSettings['emailFrequency'] }))}
                className={styles.select}
              >
                <option value="instant">Direct</option>
                <option value="hourly">Per uur</option>
                <option value="daily">Dagelijks</option>
              </select>
            </div>
          </div>
        </motion.section>

        {/* Preferences */}
        <motion.section 
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.sectionHeader}>
            <Globe size={20} />
            <h2>Voorkeuren</h2>
          </div>
          <div className={styles.card}>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <div className={styles.settingIcon}>
                  <Clock size={18} />
                </div>
                <div>
                  <h3>Tijdzone</h3>
                  <p>Voor correcte tijden in je alerts</p>
                </div>
              </div>
              <select 
                value={settings.timezone}
                onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                className={styles.select}
              >
                <option value="Europe/Amsterdam">Amsterdam (CET)</option>
                <option value="Europe/London">Londen (GMT)</option>
                <option value="America/New_York">New York (EST)</option>
                <option value="America/Los_Angeles">Los Angeles (PST)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
              </select>
            </div>
          </div>
        </motion.section>

        {/* Save Button */}
        <motion.div 
          className={styles.saveSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            onClick={saveSettings}
            className={`${styles.saveBtn} ${saved ? styles.saved : ''}`}
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {saving ? (
              <>
                <RefreshCw size={18} className={styles.spinner} />
                Opslaan...
              </>
            ) : saved ? (
              <>
                <Check size={18} />
                Opgeslagen!
              </>
            ) : (
              'Wijzigingen opslaan'
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
