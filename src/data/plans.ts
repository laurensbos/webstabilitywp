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
      '3 websites',
      '5 minuten interval',
      'Email alerts',
      '7 dagen historie',
      '1 team member',
      'Basis support'
    ],
    cta: 'Start gratis',
    ctaLink: '/register'
  },
  {
    name: 'Pro',
    description: 'Voor groeiende bedrijven',
    monthlyPrice: 24,
    yearlyPrice: 19,
    icon: Zap,
    popular: true,
    features: [
      '20 websites',
      '1 minuut interval',
      'Email, SMS & Slack alerts',
      '12 maanden historie',
      '5 team members',
      'SSL monitoring',
      'API toegang',
      'Priority support'
    ],
    cta: 'Start 14 dagen gratis',
    ctaLink: '/register?plan=pro'
  },
  {
    name: 'Business',
    description: 'Voor agencies & teams',
    monthlyPrice: 59,
    yearlyPrice: 49,
    icon: Crown,
    popular: false,
    features: [
      '100 websites',
      '30 seconden interval',
      'Alle alert kanalen',
      'Onbeperkte historie',
      'Onbeperkt team members',
      'SSL & Domain monitoring',
      'Custom status pages',
      'Whitelabel rapporten',
      'Dedicated support'
    ],
    cta: 'Start 14 dagen gratis',
    ctaLink: '/register?plan=business'
  },
  {
    name: 'Enterprise',
    description: 'Maatwerk vanaf 100+ sites',
    monthlyPrice: -1, // Custom pricing
    yearlyPrice: -1,
    icon: Building2,
    popular: false,
    isEnterprise: true,
    features: [
      'Onbeperkt websites',
      'Custom check interval',
      '99.99% SLA garantie',
      'Dedicated support',
      'On-premise optie',
      'Custom integraties'
    ],
    cta: 'Neem contact op',
    ctaLink: '/contact?plan=enterprise'
  }
];
