export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    sites: 1,
    checkInterval: 30, // minutes
    features: [
      'Uptime monitoring',
      'Email alerts',
      'Basic dashboard',
    ],
    limits: {
      visualMonitoring: false,
      performanceMonitoring: false,
      sslMonitoring: true,
      apiAccess: false,
    },
  },
  starter: {
    name: 'Starter',
    price: 9,
    sites: 3,
    checkInterval: 5,
    features: [
      'Everything in Free',
      '5-minute checks',
      '3 sites',
      'Performance monitoring',
      'SSL monitoring',
    ],
    limits: {
      visualMonitoring: false,
      performanceMonitoring: true,
      sslMonitoring: true,
      apiAccess: false,
    },
  },
  pro: {
    name: 'Pro',
    price: 29,
    sites: 10,
    checkInterval: 1,
    features: [
      'Everything in Starter',
      '1-minute checks',
      '10 sites',
      'Visual regression monitoring',
      'SMS alerts',
      'Priority support',
    ],
    limits: {
      visualMonitoring: true,
      performanceMonitoring: true,
      sslMonitoring: true,
      apiAccess: true,
    },
  },
  agency: {
    name: 'Agency',
    price: 79,
    sites: 50,
    checkInterval: 1,
    features: [
      'Everything in Pro',
      '50 sites',
      'White-label reports',
      'Team members',
      'API access',
      'Dedicated support',
    ],
    limits: {
      visualMonitoring: true,
      performanceMonitoring: true,
      sslMonitoring: true,
      apiAccess: true,
      whiteLabel: true,
      teamMembers: 5,
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
