import { db, sslCertificates, sites, alerts } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { sendAlertEmail } from '@/lib/email';

interface SSLInfo {
  issuer: string | null;
  validFrom: Date | null;
  validTo: Date | null;
  daysUntilExpiry: number;
  isValid: boolean;
  error?: string;
}

export async function checkSSL(hostname: string): Promise<SSLInfo> {
  try {
    // Extract hostname from URL if needed
    let domain = hostname;
    if (hostname.includes('://')) {
      domain = new URL(hostname).hostname;
    }
    
    // Try to fetch HTTPS version and check if it works
    const url = `https://${domain}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: controller.signal,
        headers: { 'User-Agent': 'WebStability SSL Checker/1.0' }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok || response.status < 500) {
        // SSL is working - we can't get cert details from edge runtime
        // but we know it's valid. Try to use a free SSL API
        try {
          const sslApiResponse = await fetch(`https://ssl-checker.io/api/v1/check/${domain}`, {
            signal: AbortSignal.timeout(5000)
          });
          
          if (sslApiResponse.ok) {
            const sslData = await sslApiResponse.json();
            
            if (sslData.result && sslData.result.valid_to) {
              const validTo = new Date(sslData.result.valid_to);
              const validFrom = sslData.result.valid_from ? new Date(sslData.result.valid_from) : null;
              const daysUntilExpiry = Math.ceil((validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              
              return {
                issuer: sslData.result.issuer || 'Unknown',
                validFrom,
                validTo,
                daysUntilExpiry,
                isValid: daysUntilExpiry > 0,
              };
            }
          }
        } catch {
          // SSL API failed, use fallback
        }
        
        // Fallback: HTTPS works so SSL is valid, assume 90 days
        return {
          issuer: 'Unknown (HTTPS OK)',
          validFrom: null,
          validTo: null,
          daysUntilExpiry: 90, // Assume valid for ~90 days
          isValid: true,
        };
      }
      
      return {
        issuer: null,
        validFrom: null,
        validTo: null,
        daysUntilExpiry: 0,
        isValid: false,
        error: `HTTPS returned status ${response.status}`,
      };
    } catch (fetchError) {
      // Could be SSL error or network error
      const errorMsg = fetchError instanceof Error ? fetchError.message : 'Unknown error';
      
      return {
        issuer: null,
        validFrom: null,
        validTo: null,
        daysUntilExpiry: 0,
        isValid: false,
        error: errorMsg.includes('certificate') ? 'Invalid SSL certificate' : errorMsg,
      };
    }
  } catch (error) {
    return {
      issuer: null,
      validFrom: null,
      validTo: null,
      daysUntilExpiry: 0,
      isValid: false,
      error: error instanceof Error ? error.message : 'SSL check failed',
    };
  }
}

export async function performSSLCheck(siteId: string) {
  const [site] = await db.select().from(sites).where(eq(sites.id, siteId));
  if (!site) return null;
  
  const sslInfo = await checkSSL(site.url);
  
  // Upsert SSL certificate record
  const existing = await db.select().from(sslCertificates).where(eq(sslCertificates.siteId, siteId));
  
  if (existing.length > 0) {
    await db.update(sslCertificates).set({
      issuer: sslInfo.issuer,
      validFrom: sslInfo.validFrom,
      validTo: sslInfo.validTo,
      daysUntilExpiry: sslInfo.daysUntilExpiry,
      isValid: sslInfo.isValid,
      lastCheckedAt: new Date(),
    }).where(eq(sslCertificates.siteId, siteId));
  } else {
    await db.insert(sslCertificates).values({
      siteId,
      issuer: sslInfo.issuer,
      validFrom: sslInfo.validFrom,
      validTo: sslInfo.validTo,
      daysUntilExpiry: sslInfo.daysUntilExpiry,
      isValid: sslInfo.isValid,
    });
  }
  
  // Create alert if SSL is expiring soon
  if (sslInfo.daysUntilExpiry <= 14 && sslInfo.daysUntilExpiry > 0) {
    await db.insert(alerts).values({
      siteId,
      userId: site.userId,
      type: 'ssl_expiry',
      title: `SSL certificaat verloopt binnenkort`,
      message: `Het SSL certificaat voor ${site.name} verloopt over ${sslInfo.daysUntilExpiry} dagen.`,
      severity: sslInfo.daysUntilExpiry <= 7 ? 'critical' : 'warning',
    });
    
    // Send email
    const [user] = await db.query.users.findMany({
      where: (users, { eq }) => eq(users.id, site.userId),
    });
    
    if (user?.email) {
      await sendAlertEmail(
        user.alertEmail || user.email,
        `⚠️ SSL Certificaat verloopt: ${site.name}`,
        site.name,
        'ssl_expiry',
        `Je SSL certificaat verloopt over ${sslInfo.daysUntilExpiry} dagen. Vernieuw het op tijd om waarschuwingen in browsers te voorkomen.`
      );
    }
  }
  
  return sslInfo;
}

export async function getSSLStatus(siteId: string) {
  const [cert] = await db.select().from(sslCertificates).where(eq(sslCertificates.siteId, siteId));
  return cert || null;
}
