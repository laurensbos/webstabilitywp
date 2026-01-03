'use client';

import Link from 'next/link';
import { Book, Zap, Bell, Shield, BarChart2, Webhook, ExternalLink } from 'lucide-react';
import { Header, Footer, Background } from '@/components/layout';
import styles from './page.module.css';

const sections = [
  {
    icon: Zap,
    title: 'Aan de slag',
    description: 'Begin binnen 2 minuten met website monitoring',
    links: [
      { title: 'Account aanmaken', href: '/register' },
      { title: 'Je eerste website toevoegen', href: '#add-site' },
      { title: 'Dashboard overzicht', href: '#dashboard' },
    ]
  },
  {
    icon: Bell,
    title: 'Notificaties',
    description: 'Configureer hoe en wanneer je alerts ontvangt',
    links: [
      { title: 'E-mail notificaties', href: '#email' },
      { title: 'Webhook integraties', href: '#webhooks' },
      { title: 'Slack & Discord', href: '#integrations' },
    ]
  },
  {
    icon: Shield,
    title: 'SSL Monitoring',
    description: 'Houd je SSL certificaten in de gaten',
    links: [
      { title: 'SSL checks instellen', href: '#ssl-setup' },
      { title: 'Vervaldatum alerts', href: '#ssl-alerts' },
      { title: 'Certificaat details', href: '#ssl-details' },
    ]
  },
  {
    icon: BarChart2,
    title: 'Rapportages',
    description: 'Analyseer je uptime statistieken',
    links: [
      { title: 'Uptime percentage', href: '#uptime' },
      { title: 'Response time grafieken', href: '#response-time' },
      { title: 'Wekelijkse rapporten', href: '#weekly-reports' },
    ]
  },
  {
    icon: Webhook,
    title: 'API & Webhooks',
    description: 'Integreer met je eigen systemen',
    links: [
      { title: 'REST API documentatie', href: '#api' },
      { title: 'Webhook events', href: '#webhook-events' },
      { title: 'Authenticatie', href: '#auth' },
    ]
  },
];

export default function DocsPage() {
  return (
    <div className={styles.container}>
      <Background />
      <Header />

      <main className={styles.main}>
        <div className={styles.hero}>
          <Book size={48} className={styles.heroIcon} />
          <h1>Documentatie</h1>
          <p>Alles wat je nodig hebt om het meeste uit webstability te halen</p>
        </div>

        <div className={styles.grid}>
          {sections.map((section, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.iconWrapper}>
                  <section.icon size={24} />
                </div>
                <div>
                  <h2>{section.title}</h2>
                  <p>{section.description}</p>
                </div>
              </div>
              <ul className={styles.linkList}>
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href={link.href}>
                      {link.title}
                      <ExternalLink size={14} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.helpSection}>
          <h2>Hulp nodig?</h2>
          <p>Neem contact op met ons support team voor persoonlijke hulp.</p>
          <Link href="/contact" className={styles.contactBtn}>
            Contact opnemen
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
