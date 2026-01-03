import { MessageSquare, Mail, Smartphone, Bell, Code, LucideIcon } from 'lucide-react';

export interface Integration {
  name: string;
  icon: LucideIcon;
  description?: string;
}

export const integrations: Integration[] = [
  { name: 'Slack', icon: MessageSquare, description: 'Direct alerts in je Slack channels' },
  { name: 'Email', icon: Mail, description: 'Klassieke email notificaties' },
  { name: 'SMS', icon: Smartphone, description: 'Tekstberichten voor kritieke alerts' },
  { name: 'Discord', icon: MessageSquare, description: 'Alerts naar je Discord server' },
  { name: 'Webhooks', icon: Code, description: 'Custom integraties met webhooks' },
  { name: 'PagerDuty', icon: Bell, description: 'On-call management integratie' }
];
