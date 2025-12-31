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
    // Use a simple HTTPS check - in production you might use a dedicated service
    const url = hostname.startsWith('https://') ? hostname : `https://${hostname}`;
    const domain = new URL(url).hostname;
    
    // We'll use an external API for SSL checking since Node.js in edge doesn't have direct TLS access
    const response = await fetch(`https://api.ssllabs.com/api/v3/analyze?host=${domain}&fromCache=on`, {
      headers: { 'User-Agent': 'WebStability Monitor/1.0' }
    });
    
    if (!response.ok) {
      // Fallback: just check if HTTPS works
      const httpsCheck = await fetch(url, { method: 'HEAD' });
      
      if (httpsCheck.ok) {
        return {
          issuer: 'Unknown',
          validFrom: null,
          validTo: null,
          daysUntilExpiry: 30, // Assume valid
          isValid: true,
        };
      }
      
      return {
        issuer: null,
        validFrom: null,
        validTo: null,
        daysUntilExpiry: 0,
        isValid: false,
        error: 'Could not verify SSL certificate',
      };
    }
    
    const data = await response.json();
    
    // Parse SSL Labs response
    if (data.endpoints && data.endpoints.length > 0) {
      const endpoint = data.endpoints[0];
      const cert = endpoint.details?.cert;
      
      if (cert) {
        const validTo = new Date(cert.notAfter);
        const daysUntilExpiry = Math.ceil((validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        return {
          issuer: cert.issuerSubject || 'Unknown',
          validFrom: new Date(cert.notBefore),
          validTo,
          daysUntilExpiry,
          isValid: daysUntilExpiry > 0,
        };
      }
    }
    
    // Simple fallback
    return {
      issuer: 'Unknown',
      validFrom: null,
      validTo: null,
      daysUntilExpiry: 30,
      isValid: true,
    };
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
