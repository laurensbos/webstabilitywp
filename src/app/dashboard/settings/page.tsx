'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useSites, useUserProfile, useUpdateProfile } from '@/hooks';
import styles from './page.module.css';

interface UserProfile {
  name: string;
  email: string;
  avatar: string | null;
  plan: 'free' | 'pro' | 'business' | 'enterprise';
  planName: string;
  sitesUsed: number;
  sitesLimit: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;
  monthlyPrice: number;
}

// Plan limits and prices
const planConfig: Record<string, { name: string; sites: number; price: number }> = {
  free: { name: 'Free', sites: 3, price: 0 },
  pro: { name: 'Pro', sites: 20, price: 19 },
  business: { name: 'Business', sites: 100, price: 49 },
  enterprise: { name: 'Enterprise', sites: 999, price: 99 }
};

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceYearly: 0,
    sites: 3,
    interval: '5 min',
    features: ['3 websites', '5 minuten checks', 'E-mail notificaties', '7 dagen historie']
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 24,
    priceYearly: 19,
    sites: 20,
    interval: '1 min',
    features: ['20 websites', '1 minuut checks', 'Alle notificaties', '90 dagen historie', 'SSL monitoring', 'Performance metrics'],
    popular: true
  },
  {
    id: 'business',
    name: 'Business',
    price: 59,
    priceYearly: 49,
    sites: 100,
    interval: '30 sec',
    features: ['100 websites', '30 seconden checks', 'Prioriteit support', '1 jaar historie', 'API toegang', 'Status pagina']
  }
];

export default function SettingsPage() {
  const { data: session } = useSession();
  const { sites } = useSites();
  const { profile, notifications: savedNotifications, loading: profileLoading, refetch: refetchProfile } = useUserProfile();
  const { updateProfile, loading: isUpdating } = useUpdateProfile();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'billing'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Get user data from session
  const userPlan = (session?.user as { plan?: string })?.plan || 'free';
  const planInfo = planConfig[userPlan] || planConfig.free;

  const user: UserProfile = {
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    avatar: session?.user?.image || null,
    plan: userPlan as UserProfile['plan'],
    planName: planInfo.name,
    sitesUsed: sites.length,
    sitesLimit: planInfo.sites,
    billingCycle: 'yearly',
    nextBillingDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    monthlyPrice: planInfo.price
  };

  // Profile form state
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [alertEmail, setAlertEmail] = useState('');

  // Update form when session/profile loads
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
    }
  }, [session]);

  useEffect(() => {
    if (profile?.alertEmail) {
      setAlertEmail(profile.alertEmail);
    }
  }, [profile]);

  // Notification settings from profile
  const [notifications, setNotifications] = useState({
    emailDowntime: true,
    emailRecovery: true,
    emailSslWarning: true,
    emailWeeklyReport: true,
  });

  // Sync notifications with profile data
  useEffect(() => {
    if (savedNotifications) {
      setNotifications({
        emailDowntime: savedNotifications.downtime,
        emailRecovery: savedNotifications.recovery,
        emailSslWarning: savedNotifications.sslExpiry,
        emailWeeklyReport: savedNotifications.weeklyReport,
      });
    }
  }, [savedNotifications]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const result = await updateProfile({ name, alertEmail: alertEmail || undefined });
      if (result) {
        setSaveMessage({ type: 'success', text: 'Profiel opgeslagen!' });
        refetchProfile();
      } else {
        setSaveMessage({ type: 'error', text: 'Er ging iets mis' });
      }
    } catch {
      setSaveMessage({ type: 'error', text: 'Er ging iets mis' });
    }
    
    setIsSaving(false);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    
    try {
      const result = await updateProfile({
        notifications: {
          downtime: notifications.emailDowntime,
          recovery: notifications.emailRecovery,
          sslExpiry: notifications.emailSslWarning,
          weeklyReport: notifications.emailWeeklyReport,
        }
      });
      
      if (result) {
        setSaveMessage({ type: 'success', text: 'Notificatie voorkeuren opgeslagen!' });
        refetchProfile();
      } else {
        setSaveMessage({ type: 'error', text: 'Er ging iets mis' });
      }
    } catch {
      setSaveMessage({ type: 'error', text: 'Er ging iets mis' });
    }
    
    setIsSaving(false);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    
    setIsUpgrading(true);
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Er ging iets mis bij het upgraden');
        setIsUpgrading(false);
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      alert('Er ging iets mis bij het upgraden');
      setIsUpgrading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Instellingen</h1>
        <p className={styles.subtitle}>Beheer je account en voorkeuren</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'profile' ? styles.active : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Profiel
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'notifications' ? styles.active : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          Notificaties
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'billing' ? styles.active : ''}`}
          onClick={() => setActiveTab('billing')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <line x1="1" y1="10" x2="23" y2="10" />
          </svg>
          Abonnement
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Profiel informatie</h2>
            <p className={styles.sectionDescription}>Update je persoonlijke gegevens</p>

            <div className={styles.form}>
              <div className={styles.avatarSection}>
                <div className={styles.avatar}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span>{user.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className={styles.avatarActions}>
                  <button className={styles.uploadButton}>Foto uploaden</button>
                  <p className={styles.avatarHint}>JPG, PNG of GIF. Max 2MB.</p>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Naam</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>E-mailadres</label>
                <input 
                  type="email" 
                  value={email}
                  disabled
                  className={`${styles.input} ${styles.inputDisabled}`}
                />
                <p className={styles.inputHint}>Je e-mailadres kan niet worden gewijzigd</p>
              </div>

              <div className={styles.formGroup}>
                <label>Alert e-mailadres</label>
                <input 
                  type="email" 
                  value={alertEmail}
                  onChange={(e) => setAlertEmail(e.target.value)}
                  className={styles.input}
                  placeholder={email || 'alerts@voorbeeld.nl'}
                />
                <p className={styles.inputHint}>Optioneel: stuur alerts naar een ander e-mailadres</p>
              </div>

              {saveMessage && activeTab === 'profile' && (
                <div className={`${styles.saveMessage} ${styles[saveMessage.type]}`}>
                  {saveMessage.text}
                </div>
              )}

              <div className={styles.formActions}>
                <button 
                  className={styles.saveButton}
                  onClick={handleSaveProfile}
                  disabled={isSaving || isUpdating}
                >
                  {isSaving || isUpdating ? 'Opslaan...' : 'Wijzigingen opslaan'}
                </button>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Wachtwoord wijzigen</h2>
            <p className={styles.sectionDescription}>Zorg voor een sterk en uniek wachtwoord</p>

            <div className={styles.form}>
              <div className={styles.formGroup}>
                <label>Huidig wachtwoord</label>
                <input type="password" className={styles.input} placeholder="••••••••" />
              </div>

              <div className={styles.formGroup}>
                <label>Nieuw wachtwoord</label>
                <input type="password" className={styles.input} placeholder="••••••••" />
              </div>

              <div className={styles.formGroup}>
                <label>Bevestig nieuw wachtwoord</label>
                <input type="password" className={styles.input} placeholder="••••••••" />
              </div>

              <div className={styles.formActions}>
                <button className={styles.saveButton}>Wachtwoord wijzigen</button>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Danger zone</h2>
            <p className={styles.sectionDescription}>Onomkeerbare acties voor je account</p>

            <div className={styles.dangerZone}>
              <div className={styles.dangerItem}>
                <div>
                  <h3>Account verwijderen</h3>
                  <p>Verwijder permanent je account en alle bijbehorende data</p>
                </div>
                <button className={styles.dangerButton}>Account verwijderen</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className={styles.tabContent}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>E-mail notificaties</h2>
            <p className={styles.sectionDescription}>Kies welke e-mails je wilt ontvangen</p>

            <div className={styles.notificationsList}>
              <label className={styles.toggle}>
                <div className={styles.toggleInfo}>
                  <h4>Downtime meldingen</h4>
                  <p>Ontvang een e-mail wanneer een site offline gaat</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifications.emailDowntime}
                  onChange={(e) => setNotifications({ ...notifications, emailDowntime: e.target.checked })}
                />
                <span className={styles.toggleSlider} />
              </label>

              <label className={styles.toggle}>
                <div className={styles.toggleInfo}>
                  <h4>Herstel meldingen</h4>
                  <p>Ontvang een e-mail wanneer een site weer online is</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifications.emailRecovery}
                  onChange={(e) => setNotifications({ ...notifications, emailRecovery: e.target.checked })}
                />
                <span className={styles.toggleSlider} />
              </label>

              <label className={styles.toggle}>
                <div className={styles.toggleInfo}>
                  <h4>SSL waarschuwingen</h4>
                  <p>Ontvang een waarschuwing als je SSL certificaat bijna verloopt</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifications.emailSslWarning}
                  onChange={(e) => setNotifications({ ...notifications, emailSslWarning: e.target.checked })}
                />
                <span className={styles.toggleSlider} />
              </label>

              <label className={styles.toggle}>
                <div className={styles.toggleInfo}>
                  <h4>Wekelijks rapport</h4>
                  <p>Ontvang elke maandag een gedetailleerd overzicht van de afgelopen week</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={notifications.emailWeeklyReport}
                  onChange={(e) => setNotifications({ ...notifications, emailWeeklyReport: e.target.checked })}
                />
                <span className={styles.toggleSlider} />
              </label>
            </div>

            {saveMessage && activeTab === 'notifications' && (
              <div className={`${styles.saveMessage} ${styles[saveMessage.type]}`}>
                {saveMessage.text}
              </div>
            )}

            <div className={styles.formActions}>
              <button 
                className={styles.saveButton}
                onClick={handleSaveNotifications}
                disabled={isSaving || isUpdating || profileLoading}
              >
                {isSaving || isUpdating ? 'Opslaan...' : 'Voorkeuren opslaan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <div className={styles.tabContent}>
          {/* Current Plan */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Huidig abonnement</h2>
            
            <div className={styles.currentPlan}>
              <div className={styles.planBadge}>
                <span className={styles.planName}>{user.planName}</span>
                {user.plan !== 'free' && (
                  <span className={styles.billingCycle}>
                    {user.billingCycle === 'yearly' ? 'Jaarlijks' : 'Maandelijks'}
                  </span>
                )}
              </div>
              
              <div className={styles.planStats}>
                <div className={styles.planStat}>
                  <span className={styles.planStatLabel}>Sites gebruikt</span>
                  <div className={styles.planStatValue}>
                    <strong>{user.sitesUsed}</strong>
                    <span>/ {user.sitesLimit}</span>
                  </div>
                  <div className={styles.usageBar}>
                    <div 
                      className={styles.usageProgress} 
                      style={{ width: `${(user.sitesUsed / user.sitesLimit) * 100}%` }}
                    />
                  </div>
                </div>
                
                {user.plan !== 'free' && (
                  <div className={styles.planStat}>
                    <span className={styles.planStatLabel}>Volgende factuurdatum</span>
                    <strong>{formatDate(user.nextBillingDate)}</strong>
                  </div>
                )}
                
                {user.plan !== 'free' && (
                  <div className={styles.planStat}>
                    <span className={styles.planStatLabel}>Bedrag</span>
                    <strong>€{user.monthlyPrice}/maand</strong>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Available Plans */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Beschikbare abonnementen</h2>
            <p className={styles.sectionDescription}>Upgrade of downgrade je abonnement</p>

            <div className={styles.plansGrid}>
              {plans.map(plan => (
                <div 
                  key={plan.id} 
                  className={`${styles.planCard} ${plan.id === user.plan ? styles.current : ''} ${plan.popular ? styles.popular : ''}`}
                >
                  {plan.popular && <span className={styles.popularBadge}>Populair</span>}
                  {plan.id === user.plan && <span className={styles.currentBadge}>Huidig</span>}
                  
                  <h3 className={styles.planCardName}>{plan.name}</h3>
                  
                  <div className={styles.planCardPrice}>
                    <span className={styles.priceAmount}>€{plan.priceYearly}</span>
                    <span className={styles.pricePeriod}>/maand</span>
                  </div>
                  {plan.price > plan.priceYearly && (
                    <p className={styles.yearlyNote}>Bij jaarlijkse betaling</p>
                  )}
                  
                  <ul className={styles.planFeatures}>
                    {plan.features.map((feature, i) => (
                      <li key={i}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  {plan.id !== user.plan ? (
                    <button 
                      className={`${styles.planButton} ${plan.id === 'free' ? styles.downgrade : ''}`}
                      onClick={() => {
                        setSelectedPlan(plan.id);
                        setShowUpgradeModal(true);
                      }}
                    >
                      {plans.findIndex(p => p.id === plan.id) < plans.findIndex(p => p.id === user.plan) 
                        ? 'Downgraden' 
                        : 'Upgraden'}
                    </button>
                  ) : (
                    <button className={styles.planButton} disabled>
                      Huidig plan
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.enterpriseCard}>
              <div className={styles.enterpriseContent}>
                <h3>Enterprise</h3>
                <p>Onbeperkt websites, custom integraties en dedicated support</p>
              </div>
              <a href="mailto:enterprise@webstability.nl" className={styles.enterpriseButton}>
                Contact opnemen
              </a>
            </div>
          </div>

          {/* Payment Method */}
          {user.plan !== 'free' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Betaalmethode</h2>
              
              <div className={styles.paymentMethod}>
                <div className={styles.cardIcon}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                </div>
                <div className={styles.cardDetails}>
                  <p className={styles.cardNumber}>•••• •••• •••• 4242</p>
                  <p className={styles.cardExpiry}>Verloopt 12/2026</p>
                </div>
                <button className={styles.editButton}>Wijzigen</button>
              </div>
            </div>
          )}

          {/* Billing History */}
          {user.plan !== 'free' && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Facturen</h2>
              
              <div className={styles.invoicesList}>
                <div className={styles.invoice}>
                  <div className={styles.invoiceInfo}>
                    <span className={styles.invoiceDate}>15 juni 2024</span>
                    <span className={styles.invoiceAmount}>€228,00</span>
                  </div>
                  <div className={styles.invoiceStatus}>
                    <span className={styles.paid}>Betaald</span>
                    <button className={styles.downloadButton}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedPlan && (
        <div className={styles.modalOverlay} onClick={() => setShowUpgradeModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setShowUpgradeModal(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            
            <h2>Abonnement wijzigen</h2>
            <p>
              Je wijzigt van <strong>{user.planName}</strong> naar{' '}
              <strong>{plans.find(p => p.id === selectedPlan)?.name}</strong>
            </p>
            
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setShowUpgradeModal(false)} disabled={isUpgrading}>
                Annuleren
              </button>
              <button className={styles.confirmButton} onClick={handleUpgrade} disabled={isUpgrading}>
                {isUpgrading ? 'Bezig...' : 'Bevestigen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
