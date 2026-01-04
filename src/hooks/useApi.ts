import { useState, useEffect, useCallback } from 'react';

// Types
export interface Site {
  id: string;
  userId: string;
  url: string;
  name: string;
  isActive: boolean;
  checkInterval: number;
  lastCheckedAt: string | null;
  currentStatus: 'up' | 'down' | 'unknown';
  uptimePercentage: string;
  avgResponseTime: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  siteId: string;
  userId: string;
  type: 'downtime' | 'visual_change' | 'slow_response' | 'ssl_expiry' | 'security';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  isRead: boolean;
  createdAt: string;
}

export interface SiteWithDetails extends Site {
  uptime?: {
    day: number;
    week: number;
    month: number;
  };
  ssl?: {
    issuer: string | null;
    validTo: string | null;
    daysUntilExpiry: number | null;
    isValid: boolean;
  } | null;
  performance?: {
    score: number | null;
    accessibility: number | null;
    bestPractices: number | null;
    seo: number | null;
  } | null;
  recentChecks?: Array<{
    id: string;
    status: number;
    responseTime: number;
    isUp: boolean;
    checkedAt: string;
  }>;
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Generic fetch hook
function useApi<T>(url: string, options?: { skip?: boolean }) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: !options?.skip,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Er ging iets mis');
      }
      const data = await res.json();
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: (err as Error).message });
    }
  }, [url]);

  useEffect(() => {
    if (!options?.skip) {
      fetchData();
    }
  }, [fetchData, options?.skip]);

  return { ...state, refetch: fetchData };
}

// Sites hooks
export function useSites() {
  const { data, loading, error, refetch } = useApi<{ sites: Site[] }>('/api/sites');
  return { sites: data?.sites ?? [], loading, error, refetch };
}

export function useSite(id: string) {
  const { data, loading, error, refetch } = useApi<{
    site: Site;
    uptime: { day: number; week: number; month: number };
    ssl: { issuer: string | null; validTo: string | null; daysUntilExpiry: number | null; isValid: boolean } | null;
    recentChecks: Array<{ id: string; status: number; responseTime: number; isUp: boolean; checkedAt: string }>;
  }>(`/api/sites/${id}`, { skip: !id });

  return { 
    site: data?.site ?? null, 
    uptime: data?.uptime ?? null,
    ssl: data?.ssl ?? null,
    recentChecks: data?.recentChecks ?? [],
    loading, 
    error, 
    refetch 
  };
}

export function useCreateSite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSite = async (data: { url: string; name: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/sites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Er ging iets mis');
      }
      
      const result = await res.json();
      setLoading(false);
      return result.site as Site;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return null;
    }
  };

  return { createSite, loading, error };
}

export function useUpdateSite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSite = async (id: string, data: { name?: string; isActive?: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sites/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Er ging iets mis');
      }
      
      const result = await res.json();
      setLoading(false);
      return result.site as Site;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return null;
    }
  };

  return { updateSite, loading, error };
}

export function useDeleteSite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteSite = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sites/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Er ging iets mis');
      }
      
      setLoading(false);
      return true;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return false;
    }
  };

  return { deleteSite, loading, error };
}

// Performance hooks
export interface PerformanceMetric {
  id: string;
  siteId: string;
  performanceScore: number | null;
  accessibilityScore: number | null;
  bestPracticesScore: number | null;
  seoScore: number | null;
  lcp: string | null;
  fid: string | null;
  cls: string | null;
  ttfb: string | null;
  createdAt: string;
}

export function useSitePerformance(siteId: string) {
  const { data, loading, error, refetch } = useApi<{
    latest: PerformanceMetric | null;
    history: PerformanceMetric[];
  }>(`/api/sites/${siteId}/performance`, { skip: !siteId });

  return {
    latest: data?.latest ?? null,
    history: data?.history ?? [],
    loading,
    error,
    refetch,
  };
}

export function useRunPerformanceCheck() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runCheck = async (siteId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sites/${siteId}/performance`, {
        method: 'POST',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Er ging iets mis');
      }

      const data = await res.json();
      setLoading(false);
      return data.metric as PerformanceMetric;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return null;
    }
  };

  return { runCheck, loading, error };
}

// Alerts hooks
export function useAlerts() {
  const { data, loading, error, refetch } = useApi<{ alerts: Alert[] }>('/api/alerts');
  return { alerts: data?.alerts ?? [], loading, error, refetch };
}

export function useMarkAlertRead() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markAsRead = async (alertId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, isRead: true }),
      });
      
      if (!res.ok) {
        throw new Error('Kon alert niet updaten');
      }
      
      setLoading(false);
      return true;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return false;
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      
      if (!res.ok) {
        throw new Error('Kon alerts niet updaten');
      }
      
      setLoading(false);
      return true;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return false;
    }
  };

  return { markAsRead, markAllAsRead, loading, error };
}

// Dashboard stats hook
export function useDashboardStats() {
  const { sites, loading: sitesLoading } = useSites();
  const { alerts, loading: alertsLoading } = useAlerts();

  const stats = {
    totalSites: sites.length,
    sitesUp: sites.filter(s => s.currentStatus === 'up').length,
    sitesDown: sites.filter(s => s.currentStatus === 'down').length,
    avgUptime: sites.length > 0 
      ? sites.reduce((acc, s) => acc + parseFloat(s.uptimePercentage || '0'), 0) / sites.length 
      : 0,
    avgResponseTime: sites.length > 0 
      ? Math.round(sites.reduce((acc, s) => acc + (s.avgResponseTime || 0), 0) / sites.filter(s => s.avgResponseTime).length) || 0
      : 0,
    activeAlerts: alerts.filter(a => !a.isRead).length,
    criticalAlerts: alerts.filter(a => a.severity === 'critical' && !a.isRead).length,
  };

  return {
    stats,
    sites,
    alerts,
    loading: sitesLoading || alertsLoading,
  };
}

// Sites with full details (SSL, performance) for dashboard
export function useSitesWithDetails() {
  const { data, loading, error, refetch } = useApi<{ sites: SiteWithDetails[] }>('/api/sites/with-details');
  return { sites: data?.sites ?? [], loading, error, refetch };
}

// Dashboard stats with full details
export function useDashboardStatsWithDetails() {
  const { sites, loading: sitesLoading } = useSitesWithDetails();
  const { alerts, loading: alertsLoading } = useAlerts();

  const stats = {
    totalSites: sites.length,
    sitesUp: sites.filter(s => s.currentStatus === 'up').length,
    sitesDown: sites.filter(s => s.currentStatus === 'down').length,
    avgUptime: sites.length > 0 
      ? sites.reduce((acc, s) => acc + parseFloat(s.uptimePercentage || '0'), 0) / sites.length 
      : 0,
    avgResponseTime: sites.length > 0 
      ? Math.round(sites.reduce((acc, s) => acc + (s.avgResponseTime || 0), 0) / sites.filter(s => s.avgResponseTime).length) || 0
      : 0,
    activeAlerts: alerts.filter(a => !a.isRead).length,
    criticalAlerts: alerts.filter(a => a.severity === 'critical' && !a.isRead).length,
    sslIssues: sites.filter(s => s.ssl && (!s.ssl.isValid || (s.ssl.daysUntilExpiry !== null && s.ssl.daysUntilExpiry < 30))).length,
    avgPerformance: sites.length > 0 && sites.some(s => s.performance?.score)
      ? Math.round(sites.filter(s => s.performance?.score).reduce((acc, s) => acc + (s.performance?.score || 0), 0) / sites.filter(s => s.performance?.score).length)
      : null,
  };

  return {
    stats,
    sites,
    alerts,
    loading: sitesLoading || alertsLoading,
  };
}

// Force check hook - manually trigger an uptime check
export function useForceCheck() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const forceCheck = async (siteId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sites/${siteId}/check`, {
        method: 'POST',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Check mislukt');
      }
      
      const result = await res.json();
      setLoading(false);
      return result;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return null;
    }
  };

  return { forceCheck, loading, error };
}

// Site alerts hook - get alerts for a specific site
export function useSiteAlerts(siteId: string) {
  const { data, loading, error, refetch } = useApi<{ alerts: Alert[] }>(
    `/api/alerts?siteId=${siteId}`, 
    { skip: !siteId }
  );
  return { alerts: data?.alerts ?? [], loading, error, refetch };
}

// User profile hook
export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  alertEmail: string | null;
  plan: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  downtime: boolean;
  recovery: boolean;
  sslExpiry: boolean;
  weeklyReport: boolean;
}

export function useUserProfile() {
  const { data, loading, error, refetch } = useApi<{
    profile: UserProfile;
    notifications: NotificationPreferences;
  }>('/api/user/profile');

  return {
    profile: data?.profile ?? null,
    notifications: data?.notifications ?? null,
    loading,
    error,
    refetch
  };
}

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (data: {
    name?: string;
    alertEmail?: string;
    notifications?: Partial<NotificationPreferences>;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Er ging iets mis');
      }
      
      const result = await res.json();
      setLoading(false);
      return result;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return null;
    }
  };

  return { updateProfile, loading, error };
}
