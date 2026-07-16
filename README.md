# VELANTHOR Affiliate Platform

Ein vollständig selbst gehostetes, Open-Source Affiliate-System für VELANTHOR.
100% kostenlos betreibbar auf Vercel + Supabase Free Tier.

> **Status:** Vollständig implementiert — Landingpage, Auth-System, Affiliate-Dashboard,
> Auszahlungssystem, Marketingmaterial-Center und Admin-Panel sind produktionsreif.
> Mögliche spätere Erweiterungen (Coupon-Codes, Partner-Rankings, echte Marketing-
> Assets statt Platzhalter-Bilder) sind in `docs/ROADMAP.md` skizziert.

## Tech-Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Datenbank:** Supabase (PostgreSQL, Free Tier)
- **Styling:** TailwindCSS + shadcn/ui-Pattern + Framer Motion
- **Auth:** Supabase Auth + eigene Verifizierungs-/Reset-Token-Logik + TOTP-2FA
- **E-Mail:** Nodemailer über IONOS SMTP
- **Captcha:** hCaptcha (kostenlos, DSGVO-freundlich)
- **Hosting:** Vercel (empfohlen), alternativ Cloudflare Pages / IONOS

## Features (vollständig implementiert)

- Multi-Tier-Affiliate-Schema (bis zu 3 Provisionsebenen, DB-seitig automatisiert)
- Vollständige Registrierung mit Captcha, E-Mail-Verifizierung, Rate-Limiting
- Login mit optionalem TOTP-2FA (RFC 6238, ohne externe Abhängigkeit, mit QR-Setup)
- Passwort-Reset-Flow
- DSGVO-konformes Klick-Tracking (IP wird nur als täglich rotierender Hash gespeichert)
- 90-Tage Cookie- + LocalStorage-Fallback-Attribution
- Server-zu-Server Conversion-Webhook mit HMAC-Signatur
- Automatische, tier-übergreifende Provisionsberechnung per DB-Trigger
- Transaktions-E-Mails (Verifizierung, Willkommen, Conversion, Auszahlung, Reset)
- Landingpage mit Hero, Features, Verdienstrechner, Testimonials, FAQ
- Affiliate-Dashboard: Widgets, Referral-Link mit QR-Code, Zeitreihen-Charts, Top-Länder/Geräte/Browser, CSV/Excel-Export
- Auszahlungssystem: Beantragung mit Guthabenprüfung, Status-Tracking, PayPal/SEPA/Krypto
- Marketingmaterial-Download-Center mit personalisierten Text-/E-Mail-Vorlagen
- Vollständiges Admin-Panel: Affiliate-Verwaltung, Auszahlungs-Genehmigung, Kampagnen, Audit-Logs, globale Einstellungen, Provisionsplan-Verwaltung
- Rechtstexte (Impressum, Datenschutz, AGB) als anpassbare Vorlagen, inhaltlich passend zur tatsächlichen Datenverarbeitung im Code

## Setup

### 1. Repository klonen & Dependencies installieren

```bash
npm install
```

### 2. Supabase-Projekt anlegen (kostenlos)

1. Gehe zu [supabase.com](https://supabase.com) → neues Projekt erstellen
2. Unter **SQL Editor** die Dateien aus `supabase/migrations/` in Reihenfolge ausführen:
   - `0001_init.sql`
   - `0002_rate_limits.sql`
   - `0003_atomic_counters.sql`
3. Unter **Project Settings → API** die URL und Keys kopieren

### 3. Umgebungsvariablen

```bash
cp .env.example .env.local
```

Alle Werte gemäß Kommentaren in `.env.example` eintragen (Supabase, IONOS SMTP, hCaptcha, Secrets).

### 4. Lokal starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

### 5. Ersten Admin-Account einrichten

1. Registriere dich normal über `/register` als Affiliate
2. Bestätige deine E-Mail-Adresse über den zugesendeten Link
3. Befördere dein Konto zum Admin:

   ```bash
   npm run create-admin -- deine@email.de
   ```

4. Logge dich erneut ein — `/admin` ist jetzt erreichbar

## Deployment

### Vercel (empfohlen)

1. Repository zu GitHub pushen
2. Auf [vercel.com](https://vercel.com) → "Import Project" → Repository auswählen
3. Environment Variables aus `.env.local` im Vercel-Dashboard eintragen
4. Deploy — Vercel erkennt Next.js automatisch, keine weitere Konfiguration nötig
5. Domain in Vercel unter **Settings → Domains** verbinden (z. B. `velanthor.org`)

### Cloudflare Pages (Alternative)

1. Build-Command: `npm run build`
2. Output-Verzeichnis: `.next`
3. Node-Kompatibilitätsmodus in den Cloudflare-Projekteinstellungen aktivieren
4. Environment Variables identisch zu oben eintragen

### IONOS Webspace

IONOS-Standard-Webspace unterstützt kein serverseitiges Next.js (nur statisches Hosting).
Empfehlung: Domain bei IONOS behalten, DNS auf Vercel zeigen lassen (CNAME/A-Record gemäß
Vercel-Anleitung). So bleibt die bestehende IONOS-Domain nutzbar, während das Hosting
kostenlos über Vercel läuft.

## Projektstruktur

```
src/
  app/
    (marketing)/        Landingpage-Routen
    (auth)/              Login, Registrierung, Passwort-Reset, E-Mail-Verifizierung
    (dashboard)/         Affiliate-Dashboard (in Arbeit)
    (admin)/             Admin-Panel (in Arbeit)
    api/
      auth/               Registrierung, Login, Verifizierung, Passwort-Reset
      track/               Klick- und Conversion-Tracking
      affiliate/           Affiliate-Endpunkte (in Arbeit)
      admin/               Admin-Endpunkte (in Arbeit)
  components/
    ui/                   Wiederverwendbare UI-Primitives (Button, Input, Card...)
    marketing/             Landingpage-Komponenten
    dashboard/             Dashboard-Komponenten (in Arbeit)
    admin/                 Admin-Komponenten (in Arbeit)
  lib/                    Utils, Validierung (Zod), Supabase-Clients
  services/               Mailer, Captcha, Rate-Limit, TOTP
  types/                  Datenbank-Typen
supabase/
  migrations/             Vollständiges SQL-Schema, RLS-Policies, Trigger
```

## Sicherheit

- Row Level Security (RLS) auf allen Tabellen aktiv
- Passwort-Hashing über Supabase Auth (bcrypt-basiert)
- HTTP-only Cookies für Session-Management
- Rate-Limiting auf Auth-Endpunkten (Postgres-basiert, kein Redis nötig)
- IP-Adressen werden nie im Klartext gespeichert (täglich rotierender SHA-256-Hash)
- HMAC-signierte Server-zu-Server-Webhooks für Conversion-Tracking
- Security-Header (CSP-relevant) in `next.config.js`

## Lizenz

Open Source — frei nutzbar und erweiterbar für das VELANTHOR-Projekt.
