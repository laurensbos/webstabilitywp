'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input } from '@/components/ui';
import { getPlan, PLANS, PlanType } from '@/lib/plans';
import styles from './page.module.css';
import { Crown, Check } from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const currentPlan = getPlan((session?.user as { plan?: string })?.plan);

  const handleUpgrade = async (plan: PlanType) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageBilling = async () => {
    try {
      const res = await fetch('/api/billing');
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Portal failed:', error);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Beheer je account en abonnement</p>
      </header>

      <div className={styles.grid}>
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.field}>
              <label>Email</label>
              <p>{session?.user?.email}</p>
            </div>
            <div className={styles.field}>
              <label>Naam</label>
              <p>{session?.user?.name || '-'}</p>
            </div>
            <div className={styles.field}>
              <label>Huidig plan</label>
              <p className={styles.planBadge}>
                <Crown size={14} />
                {currentPlan.name}
              </p>
            </div>
            {currentPlan.name !== 'Free' && (
              <Button variant="secondary" onClick={handleManageBilling}>
                Facturatie beheren
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upgrade je plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={styles.plans}>
              {(Object.entries(PLANS) as [PlanType, typeof PLANS[PlanType]][]).map(([key, plan]) => (
                <div 
                  key={key} 
                  className={`${styles.planCard} ${currentPlan.name === plan.name ? styles.currentPlan : ''}`}
                >
                  <div className={styles.planHeader}>
                    <h3>{plan.name}</h3>
                    <p className={styles.planPrice}>
                      €{plan.price}<span>/maand</span>
                    </p>
                  </div>
                  <ul className={styles.planFeatures}>
                    <li>
                      <Check size={14} />
                      {plan.sites} {plan.sites === 1 ? 'site' : 'sites'}
                    </li>
                    <li>
                      <Check size={14} />
                      {plan.checkInterval} min checks
                    </li>
                    {plan.features.slice(0, 3).map((feature, i) => (
                      <li key={i}>
                        <Check size={14} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {currentPlan.name === plan.name ? (
                    <Button variant="secondary" disabled className={styles.planButton}>
                      Huidige plan
                    </Button>
                  ) : plan.price > 0 ? (
                    <Button 
                      onClick={() => handleUpgrade(key)} 
                      isLoading={isLoading}
                      className={styles.planButton}
                    >
                      Upgraden
                    </Button>
                  ) : (
                    <Button variant="ghost" disabled className={styles.planButton}>
                      Gratis
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
