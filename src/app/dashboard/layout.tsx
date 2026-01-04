'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  LayoutDashboard, 
  Globe, 
  Bell, 
  Settings, 
  LogOut,
  Menu,
  X,
  Plus,
  ChevronRight,
  Webhook,
  Share2,
  Mail,
  Loader2,
  Crown,
  Check,
  Sparkles,
  AlertTriangle,
  Command
} from 'lucide-react';
import { CommandPalette, ThemeToggle, UpgradeModal } from '@/components/dashboard';
import styles from './layout.module.css';

// Plan limits
const planLimits: Record<string, number> = {
  free: 3,
  pro: 20,
  business: 100,
  enterprise: 1000,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sitesCount, setSitesCount] = useState(0);
  const [alertsCount, setAlertsCount] = useState(0);
  const [showVerifyBanner, setShowVerifyBanner] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const pathname = usePathname();

  // Fetch sites count and unread alerts
  useEffect(() => {
    async function fetchData() {
      try {
        const [sitesRes, alertsRes] = await Promise.all([
          fetch('/api/sites'),
          fetch('/api/alerts')
        ]);
        
        if (sitesRes.ok) {
          const sites = await sitesRes.json();
          setSitesCount(sites.length);
        }
        
        if (alertsRes.ok) {
          const alerts = await alertsRes.json();
          const unread = alerts.filter((a: { isRead: boolean }) => !a.isRead).length;
          setAlertsCount(unread);
        }

        // Check if email is verified
        const user = session?.user as { emailVerified?: boolean };
        if (user && user.emailVerified === false) {
          setShowVerifyBanner(true);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    
    if (session?.user) {
      fetchData();
    }
  }, [session, pathname]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/sites', label: 'Sites', icon: Globe },
    { href: '/dashboard/incidents', label: 'Incidenten', icon: AlertTriangle },
    { href: '/dashboard/alerts', label: 'Alerts', icon: Bell, badge: alertsCount > 0 ? alertsCount : undefined },
    { href: '/dashboard/webhooks', label: 'Webhooks', icon: Webhook },
    { href: '/dashboard/status-page', label: 'Status', icon: Share2 },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };

  // Resend verification email
  const handleResendVerification = async () => {
    if (!session?.user?.id || resendingEmail) return;
    
    setResendingEmail(true);
    try {
      const response = await fetch(`/api/auth/verify-email?resend=true&userId=${session.user.id}`);
      if (response.ok) {
        alert('Verificatie email verstuurd! Check je inbox.');
      } else {
        const data = await response.json();
        alert(data.error || 'Kon email niet versturen');
      }
    } catch {
      alert('Er is een fout opgetreden');
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className={styles.dashboardLayout}>
      {/* Command Palette (⌘K) */}
      <CommandPalette />

      {/* Mobile Header */}
      <header className={styles.mobileHeader}>
        <button 
          className={styles.menuBtn}
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <Link href="/dashboard" className={styles.mobileLogo}>
          <span className={styles.logoTextMobile}>webstability</span>
        </Link>
        <div className={styles.mobileHeaderActions}>
          <ThemeToggle />
          <Link href="/dashboard/sites/new" className={styles.mobileAddBtn}>
            <Plus size={20} />
          </Link>
        </div>
      </header>

      {/* Sidebar Overlay (mobile) */}
      <div 
        className={`${styles.sidebarOverlay} ${sidebarOpen ? styles.sidebarOverlayActive : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/dashboard" className={styles.logo}>
            <span className={styles.logoText}>webstability</span>
          </Link>
          <button 
            className={styles.closeSidebarBtn}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Quick Add Button */}
        <Link href="/dashboard/sites/new" className={styles.addSiteBtn}>
          <Plus size={18} />
          <span>Site toevoegen</span>
        </Link>

        {/* Navigation */}
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive(item.href) ? styles.navItemActive : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.badge && (
                <span className={styles.navBadge}>{item.badge}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Plan Usage - Clickable */}
        <button 
          className={styles.planUsage}
          onClick={() => setShowUpgradeModal(true)}
        >
          <div className={styles.planHeader}>
            <span className={styles.planName}>
              {(session?.user?.plan || 'free').charAt(0).toUpperCase() + (session?.user?.plan || 'free').slice(1)} Plan
            </span>
            <span className={styles.planCount}>
              {sitesCount}/{planLimits[session?.user?.plan || 'free']} sites
            </span>
          </div>
          <div className={styles.planProgress}>
            <div 
              className={styles.planProgressBar} 
              style={{ width: `${(sitesCount / planLimits[session?.user?.plan || 'free']) * 100}%` }}
            />
          </div>
          <div className={styles.upgradeLink}>
            <Crown size={14} />
            Upgrade plan
            <ChevronRight size={14} />
          </div>
        </button>

        {/* User Section */}
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {session?.user?.name?.charAt(0) || 'U'}
            </div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{session?.user?.name || 'Gebruiker'}</span>
              <span className={styles.userEmail}>{session?.user?.email || ''}</span>
            </div>
          </div>
          <div className={styles.userActions}>
            <ThemeToggle />
            <button 
              className={styles.logoutBtn} 
              aria-label="Uitloggen"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
        currentPlan={session?.user?.plan || 'free'}
      />

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Desktop Top Header */}
        <header className={styles.topHeader}>
          <div className={styles.topHeaderLeft}>
            <button className={styles.searchButton} onClick={() => {
              // Trigger command palette with keyboard shortcut
              window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Zoeken...</span>
              <kbd>
                <Command size={12} />K
              </kbd>
            </button>
          </div>
          <div className={styles.topHeaderRight}>
            <Link href="/dashboard/alerts" className={styles.headerIconBtn}>
              <Bell size={20} />
              {alertsCount > 0 && <span className={styles.headerBadge}>{alertsCount}</span>}
            </Link>
            <ThemeToggle />
            <div className={styles.headerDivider} />
            <button 
              className={styles.headerUserBtn}
              onClick={() => router.push('/dashboard/settings')}
            >
              <div className={styles.headerAvatar}>
                {session?.user?.name?.charAt(0) || 'U'}
              </div>
              <span className={styles.headerUserName}>{session?.user?.name || 'Account'}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </header>

        {/* Email Verification Banner */}
        {showVerifyBanner && (
          <div className={styles.verifyBanner}>
            <div className={styles.verifyBannerContent}>
              <Mail size={20} />
              <span>
                Je email is nog niet geverifieerd. Check je inbox of{' '}
                <button 
                  className={styles.verifyBannerLink}
                  onClick={handleResendVerification}
                  disabled={resendingEmail}
                >
                  {resendingEmail ? (
                    <>
                      <Loader2 size={14} className={styles.spinner} />
                      versturen...
                    </>
                  ) : (
                    'verstuur opnieuw'
                  )}
                </button>
              </span>
            </div>
            <button 
              className={styles.verifyBannerClose}
              onClick={() => setShowVerifyBanner(false)}
              aria-label="Sluiten"
            >
              <X size={18} />
            </button>
          </div>
        )}
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className={styles.mobileNav}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.mobileNavItem} ${isActive(item.href) ? styles.mobileNavItemActive : ''}`}
          >
            <item.icon size={22} />
            <span>{item.label}</span>
            {item.badge && (
              <span className={styles.mobileNavBadge}>{item.badge}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className={styles.modalOverlay} onClick={() => setShowUpgradeModal(false)}>
          <div className={styles.upgradeModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowUpgradeModal(false)}>
              <X size={20} />
            </button>
            
            <div className={styles.modalHeader}>
              <Sparkles className={styles.modalIcon} size={32} />
              <h2>Upgrade je plan</h2>
              <p>Krijg meer sites, snellere checks en premium features</p>
            </div>

            <div className={styles.plansGrid}>
              {/* Pro Plan */}
              <div className={`${styles.planCard} ${session?.user?.plan === 'pro' ? styles.planCardCurrent : ''}`}>
                <div className={styles.planCardHeader}>
                  <h3>Pro</h3>
                  <div className={styles.planPrice}>
                    <span className={styles.planPriceAmount}>€9</span>
                    <span className={styles.planPricePeriod}>/maand</span>
                  </div>
                </div>
                <ul className={styles.planFeatures}>
                  <li><Check size={16} /> 20 websites</li>
                  <li><Check size={16} /> 1 minuut checks</li>
                  <li><Check size={16} /> Email & SMS alerts</li>
                  <li><Check size={16} /> SSL monitoring</li>
                </ul>
                <button 
                  className={styles.planBtn}
                  onClick={() => router.push('/pricing')}
                  disabled={session?.user?.plan === 'pro'}
                >
                  {session?.user?.plan === 'pro' ? 'Huidig plan' : 'Kies Pro'}
                </button>
              </div>

              {/* Business Plan */}
              <div className={`${styles.planCard} ${styles.planCardPopular} ${session?.user?.plan === 'business' ? styles.planCardCurrent : ''}`}>
                <div className={styles.planCardBadge}>Populair</div>
                <div className={styles.planCardHeader}>
                  <h3>Business</h3>
                  <div className={styles.planPrice}>
                    <span className={styles.planPriceAmount}>€29</span>
                    <span className={styles.planPricePeriod}>/maand</span>
                  </div>
                </div>
                <ul className={styles.planFeatures}>
                  <li><Check size={16} /> 100 websites</li>
                  <li><Check size={16} /> 30 seconden checks</li>
                  <li><Check size={16} /> Alle Pro features</li>
                  <li><Check size={16} /> Priority support</li>
                  <li><Check size={16} /> Custom webhooks</li>
                </ul>
                <button 
                  className={`${styles.planBtn} ${styles.planBtnPrimary}`}
                  onClick={() => router.push('/pricing')}
                  disabled={session?.user?.plan === 'business'}
                >
                  {session?.user?.plan === 'business' ? 'Huidig plan' : 'Kies Business'}
                </button>
              </div>
            </div>

            <Link href="/pricing" className={styles.viewAllPlans}>
              Bekijk alle plannen
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
