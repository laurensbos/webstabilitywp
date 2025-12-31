import Link from 'next/link';import { auth } from '@/lib/auth';import { redirect } from 'next/navigation';import styles from './page.module.css';export default async function HomePage() {  const session = await auth();    if (session) {    redirect('/dashboard');  }  return (    <div className={styles.container}>      <nav className={styles.nav}>        <div className={styles.logo}>          <span className={styles.logoIcon}>⚡</span>          <span>Web Stability</span>        </div>        <div className={styles.navLinks}>          <Link href="/pricing" className={styles.navLink}>Pricing</Link>          <Link href="/login" className={styles.navLink}>Inloggen</Link>          <Link href="/register" className={styles.ctaButton}>Gratis starten</Link>        </div>      </nav>      <main className={styles.main}>        <div className={styles.hero}>          <div className={styles.badge}>            <span className={styles.badgeDot}></span>            Nu live: Real-time monitoring          </div>                    <h1 className={styles.title}>            Weet wanneer je website            <br />            <span className={styles.gradient}>offline gaat</span>          </h1>                    <p className={styles.subtitle}>            Monitor uptime, performance en SSL van je websites.            <br />            Ontvang direct alerts via email of SMS wanneer er iets misgaat.          </p>          <div className={styles.ctas}>            <Link href="/register" className={styles.primaryCta}>              Start gratis monitoring              <span className={styles.ctaArrow}>→</span>            </Link>            <Link href="/pricing" className={styles.secondaryCta}>              Bekijk pricing            </Link>          </div>          <div className={styles.stats}>            <div className={styles.stat}>              <span className={styles.statNumber}>99.9%</span>              <span className={styles.statLabel}>Uptime garantie</span>            </div>            <div className={styles.statDivider}></div>            <div className={styles.stat}>
              <span className={styles.statNumber}>1 min</span>
              <span className={styles.statLabel}>Check interval</span>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>24/7</span>
              <span className={styles.statLabel}>Monitoring</span>
            </div>
          </div>
        </div>

        <div className={styles.features}>
          <h2 className={styles.featuresTitle}>Alles wat je nodig hebt</h2>
          
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📊</div>
              <h3>Uptime Monitoring</h3>
              <p>Check elke minuut of je site online is. Direct alert bij downtime.</p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⚡</div>
              <h3>Performance Tracking</h3>
              <p>Meet laadtijden en Core Web Vitals. Weet wanneer je site traag wordt.</p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🔒</div>
              <h3>SSL Monitoring</h3>
              <p>Ontvang een melding voordat je SSL certificaat verloopt.</p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🔔</div>
              <h3>Instant Alerts</h3>
              <p>Email, SMS of Slack notificaties. Jij kiest hoe je gewaarschuwd wordt.</p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📈</div>
              <h3>Historische Data</h3>
              <p>Bekijk trends over tijd. Spot problemen voordat gebruikers ze zien.</p>
            </div>
            
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🌍</div>
              <h3>Multi-locatie</h3>
              <p>Checks vanaf meerdere locaties wereldwijd voor nauwkeurige resultaten.</p>
            </div>
          </div>
        </div>

        <div className={styles.ctaSection}>
          <h2>Start vandaag nog met monitoren</h2>
          <p>Gratis plan beschikbaar. Geen creditcard nodig.</p>
          <Link href="/register" className={styles.primaryCta}>
            Maak gratis account
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2025 Web Stability. Alle rechten voorbehouden.</p>
      </footer>
    </div>
  );
}
