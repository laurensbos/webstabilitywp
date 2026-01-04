import { Rocket, Zap, Crown, Building2, LucideIcon } from 'lucide-react';

export interface Plan {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  icon: LucideIcon;
  popular: boolean;
  features: string[];
  cta: string;
  ctaLink: string;
  isEnterprise?: boolean;
  badge?: string;
}

export const plans: Plan[] = [
  {
    name: 'Free',
    description: 'Perfect om te starten',
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: Rocket,
    popular: false,
    features: [
      '2 websites monitoren',
      '5 minuten check interval',
      'Email notificaties',
      '24 uur historie',
      'Basis uptime dashboard'
    ],
    cta: 'Start gratis',
    ctaLink: '/register'
  },
  {
    name: 'Starter',
    description: 'Voor freelancers',
    monthlyPrice: 9,
    yearlyPrice: 7,
    icon: Zap,
    popular: false,
    badge: 'Nieuw',
    features: [
      '10 websites monitoren',
      '3 minuten check interval',
      'Email & Slack alerts',
      '30 dagen historie',
      'SSL monitoring',
      'Response time alerts',
      'Publieke status pagina'
    ],
    cta: 'Start 14 dagen gratis',
    ctaLink: '/register?plan=starter'
  },
  {
    name: 'Pro',
    description: 'Voor agencies',
    monthlyPrice: 29,
    yearlyPrice: 24,
    icon: Crown,
    popular: true,
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
      'Priority support'
    ],
    cta: 'Start 14 dagen gratis',
    ctaLink: '/register?plan=pro'
  },
  {
    name: 'Business',
    description: 'Voor grote teams',
    monthlyPrice: 79,
    yearlyPrice: 65,
    icon: Building2,
    popular: false,
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
      'Dedicated account manager'
    ],
    cta: 'Neem contact op',
    ctaLink: '/contact?plan=business'
  }
];
