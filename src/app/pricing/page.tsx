import Link from 'next/link';
import { PLANS, PlanType } from '@/lib/plans';
import styles from './page.module.css';
import { Check } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <span>⚡</span> Web Stability
        </Link>
        <div className={styles.navLinks}>
          <Link href="/login" className={styles.navLink}>Inloggen</Link>
          <Link href="/register" className={styles.ctaButton}>Gratis starten</Link>
        </div>
      </nav>

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>Simpele, eerlijke prijzen</h1>
          <p className={styles.subtitle}>
            Kies het plan dat bij je past. Altijd maandelijks opzegbaar.
          </p>
        </header>

        <div className={styles.plans}>
          {(Object.entries(PLANS) as [PlanType, typeof PLANS[PlanType]][]).map(([key, plan]) => (
            <div 
              key={key} 
              className={`${styles.planCard} ${key === 'pro' ? styles.featured : ''}`}
            >
              {key === 'pro' && (
                <div className={styles.badge}>Populair</div>
              )}
              
              <div className={styles.planHeader}>
                <h2 className={styles.planName}>{plan.name}</h2>
                <div className={styles.planPrice}>
                  <span className={styles.currency}>€</span>
                  <span className={styles.amount}>{plan.price}</span>
                  <span className={styles.period}>/maand</span>
                </div>
              </div>

              <ul className={styles.features}>
                <li>
                  <Check />
                  {plan.sites} {plan.sites === 1 ? 'site' : 'sites'}
                </li>
                <li>
                  <Check />
                  {plan.checkInterval} minuut check interval
                </li>
                {plan.features.map((feature, i) => (
                  <li key={i}>
                    <Check />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link 
                href={plan.price === 0 ? '/register' : '/register'} 
                className={`${styles.planCta} ${key === 'pro' ? styles.primary : ''}`}
              >
                {plan.price === 0 ? 'Gratis starten' : 'Aan de slag'}
              </Link>
            </div>
          ))}
        </div>

        <div className={styles.faq}>
          <h2>Veelgestelde vragen</h2>
          
          <div className={styles.faqItem}>
            <h3>Kan ik op elk moment opzeggen?</h3>
            <p>Ja, je kunt je abonnement maandelijks opzeggen. Je houdt toegang tot het einde van je factureringsperiode.</p>
          </div>
          
          <div className={styles.faqItem}>
            <h3>Wat gebeurt er als mijn limiet is bereikt?</h3>
            <p>Je ontvangt een melding en kunt upgraden naar een hoger plan voor meer sites.</p>
          </div>
          
          <div className={styles.faqItem}>
            <h3>Is er een gratis proefperiode?</h3>
            <p>Het Free plan is altijd gratis. Voor betaalde plannen kun je ook eerst het Free plan proberen.</p>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>© 2025 Web Stability. Alle rechten voorbehouden.</p>
      </footer>
    </div>
  );
}
