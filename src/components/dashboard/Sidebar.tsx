'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import styles from './Sidebar.module.css';
import { 
  LayoutDashboard, 
  Globe, 
  Bell, 
  Settings, 
  LogOut,
  Zap,
  Share2,
  Webhook,
  Users,
  Wrench,
  AlertTriangle
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Sites', href: '/dashboard/sites', icon: Globe },
  { name: 'Alerts', href: '/dashboard/alerts', icon: Bell },
  { name: 'Incidents', href: '/dashboard/incidents', icon: AlertTriangle },
  { name: 'Onderhoud', href: '/dashboard/maintenance', icon: Wrench },
  { name: 'Webhooks', href: '/dashboard/webhooks', icon: Webhook },
  { name: 'Status Pagina', href: '/dashboard/status-page', icon: Share2 },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Zap className={styles.logoIcon} />
        <span>webstability</span>
      </div>

      <nav className={styles.nav}>
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <item.icon className={styles.navIcon} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className={styles.signOut}
        >
          <LogOut className={styles.navIcon} />
          <span>Uitloggen</span>
        </button>
      </div>
    </aside>
  );
}
