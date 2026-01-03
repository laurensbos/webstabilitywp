'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Sparkles, Gift, X } from 'lucide-react';
import { plans } from '@/data';
import styles from './PricingSection.module.css';

// Nieuwjaarskorting 20%
const DISCOUNT_PERCENTAGE = 20;
const applyDiscount = (price: number) => {
  if (price === 0) return 0;
  return Math.round(price * (1 - DISCOUNT_PERCENTAGE / 100));
};

// Feature rows for comparison table - shorter labels for mobile
const comparisonFeatures = [
  { label: 'Websites', labelShort: 'Sites', key: 'websites' },
  { label: 'Check interval', labelShort: 'Interval', key: 'interval' },
  { label: 'Alerts', labelShort: 'Alerts', key: 'alerts' },
  { label: 'Historie', labelShort: 'Historie', key: 'history' },
  { label: 'Team members', labelShort: 'Team', key: 'team' },
  { label: 'Support', labelShort: 'Support', key: 'support' },
];

// Map plan features to comparison values
const planFeatureValues: Record<string, Record<string, string>> = {
  'Free': {
    websites: '3',
    interval: '5 min',
    alerts: 'Email',
    history: '7 dagen',
    team: '1',
    support: 'Basis',
  },
  'Pro': {
    websites: '20',
    interval: '1 min',
    alerts: 'Email, SMS, Slack',
    history: '12 mnd',
    team: '5',
    support: 'Priority',
  },
  'Business': {
    websites: '100',
    interval: '30 sec',
    alerts: 'Alle kanalen',
    history: 'Onbeperkt',
    team: 'Onbeperkt',
    support: 'Dedicated',
  },
  'Enterprise': {
    websites: 'Onbeperkt',
    interval: 'Custom',
    alerts: 'Alle kanalen',
    history: 'Onbeperkt',
    team: 'Onbeperkt',
    support: 'Dedicated',
  },
};

interface PricingSectionProps {
  variant?: 'full' | 'compact';
}

export function PricingSection({ variant = 'full' }: PricingSectionProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [activeCard, setActiveCard] = useState(1); // Start at middle card (popular)
  const gridRef = useRef<HTMLDivElement>(null);

  // Track scroll position for dots indicator
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const handleScroll = () => {
      const scrollLeft = grid.scrollLeft;
      const cardWidth = grid.scrollWidth / plans.length;
      const newActive = Math.round(scrollLeft / cardWidth);
      setActiveCard(Math.min(newActive, plans.length - 1));
    };

    grid.addEventListener('scroll', handleScroll, { passive: true });
    return () => grid.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="pricing" className={styles.pricing}>
      <div className={styles.container}>
        {variant === 'full' && (
          <div className={`${styles.header} reveal`}>
            <div className={styles.promoBadge}>
              <Gift size={14} />
              Nieuwjaarsactie: 20% korting
            </div>
            <h2 className={styles.title}>Eerlijke, <span className={styles.titleGradient}>transparante prijzen</span></h2>
            <p className={styles.subtitle}>
              Geen verborgen kosten. Upgrade of downgrade wanneer je wilt.
            </p>
          </div>
        )}

        <div className={styles.billingToggle}>
          <button 
            className={`${styles.toggleBtn} ${billingPeriod === 'monthly' ? styles.toggleActive : ''}`}
            onClick={() => setBillingPeriod('monthly')}
          >
            Maandelijks
          </button>
          <button 
            className={`${styles.toggleBtn} ${billingPeriod === 'yearly' ? styles.toggleActive : ''}`}
            onClick={() => setBillingPeriod('yearly')}
          >
            Jaarlijks
            <span className={styles.saveBadge}>-20%</span>
          </button>
        </div>

        <div className={styles.grid} ref={gridRef}>
          {plans.map((plan, idx) => (
            <div 
              key={idx} 
              className={`${styles.card} ${plan.popular ? styles.cardPopular : ''} ${plan.isEnterprise ? styles.cardEnterprise : ''} reveal stagger-${idx + 1}`}
            >
              {plan.popular && (
                <div className={styles.popularBadge}>
                  <Sparkles size={14} />
                  Meest gekozen
                </div>
              )}
              <div className={styles.cardHeader}>
                <h3 className={styles.planName}>{plan.name}</h3>
                <p className={styles.planDescription}>{plan.description}</p>
              </div>
              
              {plan.isEnterprise ? (
                // Enterprise card - custom pricing
                <div className={styles.customPricing}>
                  <span className={styles.customPricingText}>Op maat</span>
                  <span className={styles.customPricingSubtext}>Neem contact op voor pricing</span>
                </div>
              ) : (
                // Regular pricing
                (() => {
                  const originalPrice = billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
                  const discountedPrice = applyDiscount(originalPrice);
                  const hasDiscount = originalPrice > 0;
                  
                  return (
                    <>
                      <div className={styles.priceWrapper}>
                        {hasDiscount && (
                          <span className={styles.originalPrice}>€{originalPrice}</span>
                        )}
                        <div className={styles.priceMain}>
                          <span className={styles.currency}>€</span>
                          <span className={styles.amount}>
                            {hasDiscount ? discountedPrice : originalPrice}
                          </span>
                        </div>
                        <span className={styles.period}>/maand excl. BTW</span>
                      </div>
                      {billingPeriod === 'yearly' && plan.yearlyPrice > 0 && (
                        <p className={styles.yearlyNote}>
                          €{applyDiscount(plan.yearlyPrice) * 12}/jaar
                        </p>
                      )}
                    </>
                  );
                })()
              )}
              
              <Link 
                href={plan.ctaLink} 
                className={`${styles.cta} ${plan.popular ? styles.ctaPopular : ''} ${plan.isEnterprise ? styles.ctaEnterprise : ''}`}
              >
                {plan.cta}
                <ArrowRight size={16} />
              </Link>
              <ul className={styles.featureList}>
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx}>
                    <Check size={16} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile scroll indicator dots */}
        <div className={styles.scrollIndicator}>
          {plans.map((_, idx) => (
            <button
              key={idx}
              className={`${styles.scrollDot} ${idx === activeCard ? styles.scrollDotActive : ''}`}
              onClick={() => {
                const grid = gridRef.current;
                if (grid) {
                  const cardWidth = grid.scrollWidth / plans.length;
                  grid.scrollTo({ left: cardWidth * idx, behavior: 'smooth' });
                }
              }}
              aria-label={`Ga naar plan ${idx + 1}`}
            />
          ))}
        </div>

        {/* Mobile Comparison Table */}
        <div className={styles.mobileComparison}>
          {/* Plan headers with prices */}
          <div className={styles.comparisonHeader}>
            <div className={styles.comparisonHeaderCell}></div>
            {plans.filter(p => !p.isEnterprise).map((plan, idx) => (
              <div 
                key={idx} 
                className={`${styles.comparisonHeaderCell} ${plan.popular ? styles.comparisonHeaderPopular : ''}`}
              >
                <span className={styles.comparisonPlanName}>{plan.name}</span>
                <span className={styles.comparisonPrice}>
                  {plan.monthlyPrice === 0 ? 'Gratis' : (
                    <>€{applyDiscount(billingPeriod === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice)}<span className={styles.comparisonPriceUnit}>/mo*</span></>
                  )}
                </span>
              </div>
            ))}
          </div>

          {/* Feature rows */}
          <div className={styles.comparisonBody}>
            {comparisonFeatures.map((feature, fIdx) => (
              <div key={fIdx} className={`${styles.comparisonRow} ${fIdx % 2 === 1 ? styles.comparisonRowAlt : ''}`}>
                <div className={styles.comparisonLabel}>
                  <span className={styles.labelFull}>{feature.label}</span>
                  <span className={styles.labelShort}>{feature.labelShort}</span>
                </div>
                {plans.filter(p => !p.isEnterprise).map((plan, pIdx) => (
                  <div 
                    key={pIdx} 
                    className={`${styles.comparisonValue} ${plan.popular ? styles.comparisonValuePopular : ''}`}
                  >
                    {planFeatureValues[plan.name]?.[feature.key] || '-'}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div className={styles.comparisonCtas}>
            <div className={styles.comparisonCtaCell}></div>
            {plans.filter(p => !p.isEnterprise).map((plan, idx) => (
              <div key={idx} className={styles.comparisonCtaCell}>
                <Link 
                  href={plan.ctaLink} 
                  className={`${styles.comparisonCta} ${plan.popular ? styles.comparisonCtaPopular : ''}`}
                >
                  {plan.monthlyPrice === 0 ? 'Start gratis' : `Kies ${plan.name}`}
                </Link>
              </div>
            ))}
          </div>

          {/* Enterprise link */}
          <a href="mailto:enterprise@webstability.nl?subject=Enterprise%20Plan%20Aanvraag" className={styles.enterpriseLink}>
            <span>Groter team? Vraag Enterprise aan</span>
            <ArrowRight size={14} />
          </a>
          
          <p className={styles.vatNote}>* Prijzen excl. BTW</p>
        </div>
      </div>
    </section>
  );
}
