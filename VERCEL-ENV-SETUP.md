# Vercel Environment Variables Setup

## ⚠️ BELANGRIJK: Zet deze environment variables in Vercel

Ga naar: https://vercel.com/laurensbos/webstabilitywp/settings/environment-variables

### Vereiste Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXTAUTH_SECRET` | `rO7ZXWJhy2oSURmPJEJjHZ45v0178bXr/LWoEMCZRww=` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://app.webstability.nl` | Production |
| `NEXTAUTH_URL` | `http://localhost:3000` | Development |
| `DATABASE_URL` | *(al ingesteld)* | All |
| `MOLLIE_API_KEY` | *(al ingesteld)* | All |
| `PAGESPEED_API_KEY` | *(al ingesteld)* | All |

### Stappen:

1. Open Vercel Dashboard → Project Settings → Environment Variables
2. Voeg `NEXTAUTH_SECRET` toe met bovenstaande waarde
3. Zorg dat `NEXTAUTH_URL` correct is voor productie (`https://app.webstability.nl`)
4. Deploy opnieuw na het toevoegen

### Nieuw Secret Genereren (indien nodig):

```bash
openssl rand -base64 32
```

### Verificatie:

Na deploy, controleer of auth werkt door in te loggen op het dashboard.

---

*Gegenereerd: 5 januari 2026*
