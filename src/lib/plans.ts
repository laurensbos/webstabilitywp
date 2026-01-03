export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    sites: 3,
    checkInterval: 5, // minutes
    historyDays: 7,
    features: [
      '3 websites',
      '5 minuten checks',
      'Email alerts',
      'SSL monitoring',
      '7 dagen historie',
      'Status pagina',
    ],
    limits: {
      visualMonitoring: false,
      performanceMonitoring: false,
      sslMonitoring: true,
      apiAccess: false,
      webhooks: false,
      smsAlerts: false,
    },
  },
  pro: {
    name: 'Pro',
    price: 9,
    sites: 20,
    checkInterval: 1,
    historyDays: 90,
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
    limits: {
      visualMonitoring: false,
      performanceMonitoring: true,
      sslMonitoring: true,
      apiAccess: true,
      webhooks: true,
      smsAlerts: true,
    },
  },
  business: {
    name: 'Business',
    price: 29,
    sites: 100,
    checkInterval: 0.5, // 30 seconds
    historyDays: 365,
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
    limits: {
      visualMonitoring: true,
      performanceMonitoring: true,
      sslMonitoring: true,
      apiAccess: true,
      webhooks: true,
      smsAlerts: true,
      whiteLabel: true,
      prioritySupport: true,
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;

export function getPlan(planName: string | null | undefined) {
  if (!planName || !(planName in PLANS)) {
    return PLANS.free;
  }
  return PLANS[planName as PlanType];
}

export function canAddSite(currentSiteCount: number, planName: string | null | undefined): boolean {
  const plan = getPlan(planName);
  return currentSiteCount < plan.sites;
}

export function getCheckInterval(planName: string | null | undefined): number {
  return getPlan(planName).checkInterval;
}
