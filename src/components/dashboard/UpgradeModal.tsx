'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './UpgradeModal.module.css';

interface Plan {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlighted?: boolean;
  current?: boolean;
}

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
  highlightFeature?: string;
}

const plans: Plan[] = [
  {
    name: 'Free',
    price: '€0',
    period: '/maand',
    features: [
      '3 websites',
      '5 min check interval',
      'E-mail notificaties',
      '7 dagen historie',
      'Basis SSL monitoring',
    ],
  },
  {
    name: 'Pro',
    price: '€9',
    period: '/maand',
    highlighted: true,
    features: [
      '25 websites',
      '1 min check interval',
      'E-mail + Slack notificaties',
      '90 dagen historie',
      'SSL + Performance monitoring',
      'Publieke status pagina',
      'Team leden (3)',
      'API toegang',
    ],
  },
  {
    name: 'Business',
    price: '€29',
    period: '/maand',
    features: [
      'Onbeperkt websites',
      '30 sec check interval',
      'Alle notificatie kanalen',
      '1 jaar historie',
      'Alle monitoring features',
      'Meerdere status pagina\'s',
      'Onbeperkt team leden',
      'Priority support',
      'Custom webhooks',
      'SLA rapportages',
    ],
  },
];

const featureComparison = [
  { name: 'Websites', free: '3', pro: '25', business: 'Onbeperkt' },
  { name: 'Check interval', free: '5 min', pro: '1 min', business: '30 sec' },
  { name: 'Data historie', free: '7 dagen', pro: '90 dagen', business: '1 jaar' },
  { name: 'E-mail notificaties', free: true, pro: true, business: true },
  { name: 'Slack/Discord/Teams', free: false, pro: true, business: true },
  { name: 'SMS notificaties', free: false, pro: false, business: true },
  { name: 'SSL monitoring', free: true, pro: true, business: true },
  { name: 'Performance monitoring', free: false, pro: true, business: true },
  { name: 'Status pagina', free: false, pro: '1', business: 'Onbeperkt' },
  { name: 'Team leden', free: false, pro: '3', business: 'Onbeperkt' },
  { name: 'API toegang', free: false, pro: true, business: true },
  { name: 'Webhooks', free: false, pro: 'Basic', business: 'Custom' },
  { name: 'Wekelijks rapport', free: false, pro: true, business: true },
  { name: 'CSV export', free: false, pro: true, business: true },
  { name: 'Priority support', free: false, pro: false, business: true },
];

export function UpgradeModal({ isOpen, onClose, currentPlan = 'free' }: UpgradeModalProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className={styles.header}>
          <h2>Upgrade je plan</h2>
          <p>Kies het plan dat het beste bij je past</p>
        </div>

        <div className={styles.viewToggle}>
          <button 
            className={`${styles.viewButton} ${viewMode === 'cards' ? styles.active : ''}`}
            onClick={() => setViewMode('cards')}
          >
            Plannen
          </button>
          <button 
            className={`${styles.viewButton} ${viewMode === 'table' ? styles.active : ''}`}
            onClick={() => setViewMode('table')}
          >
            Vergelijken
          </button>
        </div>

        {viewMode === 'cards' ? (
          <div className={styles.plansGrid}>
            {plans.map((plan) => {
              const isCurrent = plan.name.toLowerCase() === currentPlan.toLowerCase();
              return (
                <div 
                  key={plan.name} 
                  className={`${styles.planCard} ${plan.highlighted ? styles.highlighted : ''} ${isCurrent ? styles.current : ''}`}
                >
                  {plan.highlighted && <span className={styles.badge}>Populair</span>}
                  {isCurrent && <span className={styles.currentBadge}>Huidig plan</span>}
                  
                  <h3>{plan.name}</h3>
                  <div className={styles.price}>
                    <span className={styles.amount}>{plan.price}</span>
                    <span className={styles.period}>{plan.period}</span>
                  </div>
                  
                  <ul className={styles.features}>
                    {plan.features.map((feature, i) => (
                      <li key={i}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  {isCurrent ? (
                    <button className={styles.currentButton} disabled>
                      Huidig plan
                    </button>
                  ) : (
                    <Link 
                      href={`/dashboard/settings?tab=billing&plan=${plan.name.toLowerCase()}`}
                      className={`${styles.selectButton} ${plan.highlighted ? styles.primaryButton : ''}`}
                      onClick={onClose}
                    >
                      {plan.name === 'Free' ? 'Downgrade' : 'Upgrade naar ' + plan.name}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.comparisonTable}>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th className={currentPlan === 'free' ? styles.currentColumn : ''}>Free</th>
                  <th className={`${styles.highlightedColumn} ${currentPlan === 'pro' ? styles.currentColumn : ''}`}>Pro</th>
                  <th className={currentPlan === 'business' ? styles.currentColumn : ''}>Business</th>
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((row, i) => (
                  <tr key={i}>
                    <td>{row.name}</td>
                    <td className={currentPlan === 'free' ? styles.currentColumn : ''}>
                      {renderValue(row.free)}
                    </td>
                    <td className={`${styles.highlightedColumn} ${currentPlan === 'pro' ? styles.currentColumn : ''}`}>
                      {renderValue(row.pro)}
                    </td>
                    <td className={currentPlan === 'business' ? styles.currentColumn : ''}>
                      {renderValue(row.business)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td></td>
                  <td className={currentPlan === 'free' ? styles.currentColumn : ''}>
                    <span className={styles.footerPrice}>€0/maand</span>
                  </td>
                  <td className={`${styles.highlightedColumn} ${currentPlan === 'pro' ? styles.currentColumn : ''}`}>
                    <span className={styles.footerPrice}>€9/maand</span>
                  </td>
                  <td className={currentPlan === 'business' ? styles.currentColumn : ''}>
                    <span className={styles.footerPrice}>€29/maand</span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        <p className={styles.footer}>
          Vragen? <a href="mailto:support@webstability.nl">Neem contact op</a>
        </p>
      </div>
    </div>
  );
}

function renderValue(value: boolean | string) {
  if (value === true) {
    return (
      <svg className={styles.checkIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  if (value === false) {
    return (
      <svg className={styles.crossIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    );
  }
  return <span>{value}</span>;
}
