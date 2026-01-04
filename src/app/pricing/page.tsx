'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Check, Zap, Building2, Rocket, ArrowRight, Sparkles, Crown, X } from 'lucide-react';
import { Header, Footer, Background } from '@/components/layout';
import styles from './page.module.css';

const plans = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Perfect om te starten',
    icon: Rocket,
    features: [
      '2 websites monitoren',
      '5 minuten check interval',
      'Email notificaties',
      '24 uur historie',
      'Basis uptime dashboard',
    ],
    limitations: [
      'Geen SSL monitoring',
      'Geen webhooks',
      'Geen team members',
    ],
    cta: 'Huidige plan',
    popular: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 9,
    yearlyPrice: 7,
    description: 'Voor freelancers',
    icon: Zap,
    badge: 'Nieuw',
    features: [
      '10 websites monitoren',
      '3 minuten check interval',
      'Email & Slack alerts',
      '30 dagen historie',
      'SSL monitoring',
      'Response time alerts',
      'Publieke status pagina',
    ],
    limitations: [],
    cta: 'Start 14 dagen gratis',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 29,
    yearlyPrice: 24,
    description: 'Voor agencies',
    icon: Crown,
    features: [
      '50 websites monitoren',
      '1 minuut check interval',
      'Alle alert kanalen',
      '12 maanden historie',
      'SSL & Performance monitoring',
      'Onderhoudsmodus',
      'API toegang',
      'Webhooks (Slack, Discord)',
      '5 team members',
      'Priority support',
    ],
    limitations: [],
    cta: 'Start 14 dagen gratis',
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    monthlyPrice: 79,
    yearlyPrice: 65,
    description: 'Voor grote teams',
    icon: Building2,
    features: [
      'Onbeperkt websites',
      '30 seconden check interval',
      'Alle alert kanalen + SMS',
      'Onbeperkte historie',
      'White-label status pages',
      'Custom domein status page',
      'Multi-region monitoring',
      'Geavanceerde rapporten',
      'Onbeperkt team members',
      '99.9% SLA garantie',
      'Dedicated account manager',
    ],
    limitations: [],
    cta: 'Neem contact op',
    popular: false,
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

  const getPrice = (plan: typeof plans[0]) => {
    if (billingPeriod === 'yearly') {
      return plan.yearlyPrice;
    }
    return plan.monthlyPrice;
  };

  return (
    <div className={styles.container}>
      <Background />
      <Header />

      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.badge}>
            <Sparkles size={14} />
            <span>14 dagen gratis proberen</span>
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
                {'badge' in plan && plan.badge && (
                  <div className={styles.newBadge}>{plan.badge}</div>
                )}

                <div className={styles.planHeader}>
                  <div className={styles.planIcon}>
                    <Icon size={24} />
                  </div>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <p className={styles.planDescription}>{plan.description}</p>
                </div>

                <div className={styles.planPricing}>
                  <span className={styles.planPrice}>€{getPrice(plan)}</span>
                  <span className={styles.planPeriod}>
                    /{billingPeriod === 'yearly' ? 'maand' : 'maand'}
                  </span>
                  {billingPeriod === 'yearly' && plan.monthlyPrice > 0 && (
                    <span className={styles.yearlyNote}>gefactureerd per jaar</span>
                  )}
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
                      <X size={14} className={styles.xIcon} />
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
          <p>Begin gratis met 2 websites. Geen creditcard nodig.</p>
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
