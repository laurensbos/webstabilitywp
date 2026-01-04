export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    sites: 2,
    checkInterval: 5, // minutes
    historyDays: 1,
    features: [
      '2 websites',
      '5 minuten checks',
      'Email alerts',
      '24 uur historie',
    ],
    limits: {
      visualMonitoring: false,
      performanceMonitoring: false,
      sslMonitoring: false,
      apiAccess: false,
      webhooks: false,
      smsAlerts: false,
      maintenance: false,
      teamMembers: 1,
    },
  },
  starter: {
    name: 'Starter',
    price: 9,
    sites: 10,
    checkInterval: 3,
    historyDays: 30,
    features: [
      '10 websites',
      '3 minuten checks',
      'Email & Slack alerts',
      'SSL monitoring',
      '30 dagen historie',
      'Status pagina',
    ],
    limits: {
      visualMonitoring: false,
      performanceMonitoring: true,
      sslMonitoring: true,
      apiAccess: false,
      webhooks: true,
      smsAlerts: false,
      maintenance: true,
      teamMembers: 2,
    },
  },
  pro: {
    name: 'Pro',
    price: 29,
    sites: 50,
    checkInterval: 1,
    historyDays: 365,
    features: [
      '50 websites',
      '1 minuut checks',
      'Alle alert kanalen',
      'SSL & Performance monitoring',
      '12 maanden historie',
      'Webhooks & API toegang',
      '5 team members',
    ],
    limits: {
      visualMonitoring: true,
      performanceMonitoring: true,
      sslMonitoring: true,
      apiAccess: true,
      webhooks: true,
      smsAlerts: true,
      maintenance: true,
      teamMembers: 5,
    },
  },
  business: {
    name: 'Business',
    price: 79,
    sites: 999,
    checkInterval: 0.5, // 30 seconds
    historyDays: 730, // 2 years
    features: [
      'Onbeperkt websites',
      '30 seconden checks',
      'Alle Pro features',
      'Multi-region monitoring',
      'White-label status pages',
      'Onbeperkt team members',
      'Dedicated support',
      '99.9% SLA garantie',
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
      maintenance: true,
      teamMembers: 999,
      multiRegion: true,
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
