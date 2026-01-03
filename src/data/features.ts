import { Activity, Zap, Shield, Bell, BarChart3, Globe, LucideIcon } from 'lucide-react';

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const features: Feature[] = [
  {
    icon: Activity,
    title: 'Uptime Monitoring',
    description: 'Checks elke 30 seconden vanaf meerdere locaties. Direct alert wanneer je site down gaat.'
  },
  {
    icon: Zap,
    title: 'Performance Tracking',
    description: 'Meet laadtijden en Core Web Vitals. Zie direct waar je site traag is.'
  },
  {
    icon: Shield,
    title: 'SSL Monitoring',
    description: 'Automatische alerts 30, 14 en 7 dagen voordat je certificaat verloopt.'
  },
  {
    icon: Bell,
    title: 'Instant Alerts',
    description: 'Krijg notificaties via Email, SMS of Slack. Jij bepaalt hoe en wanneer.'
  },
  {
    icon: BarChart3,
    title: 'Rapporten',
    description: 'Bekijk historische trends en uptime percentages. Export naar PDF of CSV.'
  },
  {
    icon: Globe,
    title: 'Multi-locatie',
    description: 'Monitoring vanaf Europa, Amerika en Azië voor een globaal beeld.'
  }
];
