'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Check, Zap, Building2, Rocket, ArrowRight, Sparkles } from 'lucide-react';
import { Header, Footer, Background } from '@/components/layout';
import styles from './page.module.css';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Perfect om te starten',
    icon: Zap,
    features: [
      '3 websites',
      '5 minuten checks',
      'Email alerts',
      'SSL monitoring',
      '7 dagen historie',
      'Status pagina',
    ],
    limitations: [
      'Geen SMS alerts',
      'Geen webhooks',
      'Geen priority support',
    ],
    cta: 'Huidige plan',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9,
    description: 'Voor professionals',
    icon: Rocket,
    features: [
      '20 websites',
      '1 minuut checks',
      'Email & SMS alerts',
      'SSL monitoring',
      '90 dagen historie',
      'Status pagina',
      'Webhooks',
      'API toegang',
    ],
    limitations: [],
    cta: 'Upgrade naar Pro',
    popular: false,
  },
  {
    id: 'business',
    name: 'Business',
    price: 29,
    description: 'Voor teams en agencies',
    icon: Building2,
    features: [
      '100 websites',
      '30 seconden checks',
      'Alle Pro features',
      'Priority support',
      '1 jaar historie',
      'Custom webhooks',
      'White-label status pagina',
      'Team members (binnenkort)',
    ],
    limitations: [],
    cta: 'Upgrade naar Business',
    popular: true,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const currentPlan = (session?.user as { plan?: string })?.plan || 'free';

  const handleUpgrade = async (planId: string) => {
    if (!session) {
      router.push('/register');
      return;
    }

    if (planId === 'free' || planId === currentPlan) return;

    setLoading(planId);
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Er ging iets mis');
        return;
      }

      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Er ging iets mis bij het starten van de checkout');
    } finally {
      setLoading(null);
    }
  };

  const getPrice = (price: number) => {
    if (billingPeriod === 'yearly') {
      return Math.round(price * 10); // 2 months free
    }
    return price;
  };

  return (
    <div className={styles.container}>
      <Background />
      <Header />

      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.badge}>
            <Sparkles size={14} />
            <span>20% korting met code 2026</span>
          </div>
          <h1 className={styles.title}>
            Simpele, transparante prijzen
          </h1>
          <p className={styles.subtitle}>
            Kies het plan dat bij je past. Upgrade of downgrade wanneer je wilt.
          </p>

          {/* Billing Toggle */}
          <div className={styles.billingToggle}>
            <button
              className={`${styles.billingOption} ${billingPeriod === 'monthly' ? styles.billingOptionActive : ''}`}
              onClick={() => setBillingPeriod('monthly')}
            >
              Maandelijks
            </button>
            <button
              className={`${styles.billingOption} ${billingPeriod === 'yearly' ? styles.billingOptionActive : ''}`}
              onClick={() => setBillingPeriod('yearly')}
            >
              Jaarlijks
              <span className={styles.saveBadge}>Bespaar 17%</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className={styles.plansGrid}>
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan;
            const Icon = plan.icon;

            return (
              <div
                key={plan.id}
                className={`${styles.planCard} ${plan.popular ? styles.planCardPopular : ''} ${isCurrentPlan ? styles.planCardCurrent : ''}`}
              >
                {plan.popular && (
                  <div className={styles.popularBadge}>Meest gekozen</div>
                )}

                <div className={styles.planHeader}>
                  <div className={styles.planIcon}>
                    <Icon size={24} />
                  </div>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <p className={styles.planDescription}>{plan.description}</p>
                </div>

                <div className={styles.planPricing}>
                  <span className={styles.planPrice}>€{getPrice(plan.price)}</span>
                  <span className={styles.planPeriod}>
                    /{billingPeriod === 'yearly' ? 'jaar' : 'maand'}
                  </span>
                </div>

                <ul className={styles.planFeatures}>
                  {plan.features.map((feature, i) => (
                    <li key={i} className={styles.planFeature}>
                      <Check size={16} className={styles.checkIcon} />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation, i) => (
                    <li key={i} className={styles.planLimitation}>
                      <span className={styles.xIcon}>×</span>
                      <span>{limitation}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`${styles.planButton} ${plan.popular ? styles.planButtonPrimary : ''}`}
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrentPlan || loading === plan.id}
                >
                  {loading === plan.id ? (
                    <span className={styles.spinner} />
                  ) : isCurrentPlan ? (
                    'Huidige plan'
                  ) : (
                    <>
                      {plan.cta}
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ or Additional Info */}
        <div className={styles.infoSection}>
          <h2>Veelgestelde vragen</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h4>Kan ik op elk moment upgraden of downgraden?</h4>
              <p>Ja, je kunt je plan op elk moment aanpassen. Bij een upgrade betaal je direct het verschil.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>Hoe werkt de betaling?</h4>
              <p>We gebruiken Mollie voor veilige betalingen. Je kunt betalen met iDEAL, creditcard of andere methodes.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>Is er een geld-terug-garantie?</h4>
              <p>Ja, we bieden 14 dagen geld-terug-garantie als je niet tevreden bent.</p>
            </div>
            <div className={styles.faqItem}>
              <h4>Wat gebeurt er als ik mijn limiet bereik?</h4>
              <p>Je ontvangt een melding om te upgraden. Je huidige monitoring blijft gewoon werken.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className={styles.ctaSection}>
          <h2>Klaar om te starten?</h2>
          <p>Begin gratis met 3 websites. Geen creditcard nodig.</p>
          <Link href="/register" className={styles.ctaButton}>
            Gratis account aanmaken
            <ArrowRight size={18} />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
