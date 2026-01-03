'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Zap,
  Webhook,
  Share2,
  Mail,
  Loader2
} from 'lucide-react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sitesCount, setSitesCount] = useState(0);
  const [alertsCount, setAlertsCount] = useState(0);
  const [showVerifyBanner, setShowVerifyBanner] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
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
          <Zap size={20} />
          <span>webstability</span>
        </Link>
        <Link href="/dashboard/sites/new" className={styles.mobileAddBtn}>
          <Plus size={20} />
        </Link>
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
            <div className={styles.logoIcon}>
              <Zap size={20} />
            </div>
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

        {/* Plan Usage */}
        <div className={styles.planUsage}>
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
          {sitesCount >= planLimits[session?.user?.plan || 'free'] * 0.8 && (
            <Link href="/dashboard/settings?tab=billing" className={styles.upgradeLink}>
              Upgrade plan
              <ChevronRight size={14} />
            </Link>
          )}
        </div>

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
          <button 
            className={styles.logoutBtn} 
            aria-label="Uitloggen"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
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
    </div>
  );
}
