# Roadmap — nächste Ausbauschritte

Dieses Dokument listet, was als Nächstes gebaut wird (in Folge-Antworten dieses Chats).

## Phase 2 — Affiliate-Dashboard
- [ ] Sidebar-Layout + Header (Dark, Glassmorphism)
- [ ] Übersichts-Widgets (Umsatz, Provisionen, Klicks, Conversions, Conversion-Rate)
- [ ] Referral-Link-Karte mit Kopier-Button, QR-Code-Generierung & Download
- [ ] Statistik-Seite mit Charts (Recharts): Klicks/Conversions/Provision/Umsatz über Zeit
- [ ] Top-Länder / Top-Geräte / Top-Browser / Top-Kampagnen Auswertungen
- [ ] Datumsfilter (Heute / 7 Tage / 30 Tage / 365 Tage / benutzerdefiniert)
- [ ] CSV/Excel-Export der Statistiken

## Bereits fertig (Phase 2)
- [x] Dashboard-Layout (Sidebar, Header, Mobile-Menü, Logout)
- [x] Übersichts-Widgets (Umsatz, Provisionen, Klicks, Conversions, Conversion-Rate, Heute/Woche/Monat)
- [x] Referral-Link-Karte mit QR-Code-Generierung, Kopier- und Download-Button
- [x] Statistik-Seite mit Recharts (Klicks/Conversions, Umsatz/Provision über Zeit)
- [x] Top-Länder / Top-Geräte / Top-Browser Balkendiagramme
- [x] Datumsfilter (Heute / 7 Tage / 30 Tage / 365 Tage / benutzerdefiniert)
- [x] CSV/Excel-Export der Provisions-Historie
- [x] `/api/affiliate/stats` — vollständige serverseitige Aggregation

## Phase 3 — Auszahlungssystem (Affiliate-Seite)
- [ ] Auszahlung beantragen (mit Mindestbetrag-Prüfung)
- [ ] Status-Übersicht (Offen / Genehmigt / Abgelehnt / Bezahlt)
- [ ] Auszahlungsmethode verwalten (PayPal / SEPA / Krypto)

## Phase 4 — Marketingmaterial-Bereich
- [ ] Download-Center für Banner, Logos, Screenshots, Social-Media-Bilder, Videos
- [ ] E-Mail-Vorlagen mit Copy-to-Clipboard

## Bereits fertig (Phase 3 & 4)
- [x] Auszahlung beantragen mit Mindestbetrag- und Guthabenprüfung (Race-Condition-sicher)
- [x] Automatische Reservierung genehmigter Provisionen pro Auszahlung
- [x] Status-Übersicht (Offen / Genehmigt / Abgelehnt / Bezahlt) mit Ablehnungsgrund
- [x] Auszahlungsmethode verwalten (PayPal / SEPA / Krypto) inkl. Vorbefüllung aus Profil
- [x] Marketingmaterial Download-Center mit Kategorie-Tabs (Banner, Logos, Screenshots, Social, Video, Texte, E-Mail-Vorlagen)
- [x] Automatische Personalisierung von Text-/E-Mail-Vorlagen mit dem persönlichen Referral-Link
- [x] Einstellungsseite: Profil, Auszahlungsdaten
- [x] Vollständige TOTP-2FA-Aktivierung mit QR-Code-Setup (nicht nur vorbereitet — funktionsfähig)

## Phase 5 — Admin-Panel
- [ ] Affiliate-Verwaltung (Liste, Suche, Filter, Sperren, Provisionen anpassen)
- [ ] Auszahlungs-Genehmigung mit Bulk-Aktionen
- [ ] Plattform-weite Statistiken (Top-Affiliates, Top-Länder)
- [ ] CSV/Excel-Export
- [ ] Audit-Log-Ansicht
- [ ] Globale Einstellungen (Mindestauszahlung, Cookie-Laufzeit, Standard-Provision)

## Bereits fertig (Phase 5 — Admin-Panel)
- [x] Geschütztes Admin-Layout (Rollenprüfung server-seitig, eigene Sidebar/Header)
- [x] Admin-Übersicht: Plattform-KPIs, 30-Tage-Chart, Top-Affiliates, Top-Länder
- [x] Affiliate-Verwaltung: Suche (Name/E-Mail/Code), Statusfilter, Pagination
- [x] Affiliate bearbeiten: Status ändern, sperren, Provisionssatz anpassen, interne Notizen
- [x] Provision manuell hinzufügen/entfernen (mit Audit-Log-Eintrag)
- [x] Auszahlungen: Genehmigen / Ablehnen (mit Grund) / Als bezahlt markieren
- [x] Automatische Freigabe reservierter Provisionen bei Ablehnung
- [x] Kampagnen-Verwaltung (UTM-Kampagnen anlegen, Performance pro Kampagne)
- [x] CSV/Excel-Export für Affiliates und Auszahlungen
- [x] Audit-Log-Ansicht (paginiert, mit Klartextbeschreibung jeder Aktion)
- [x] Globale Einstellungen: Mindestauszahlung, Cookie-Laufzeit, Support-E-Mail
- [x] Provisionsplan-Verwaltung: mehrere Tarife, Standard-Plan festlegen, aktivieren/deaktivieren

## Bereits fertig (Phase 6 — Rechtstexte)
- [x] Impressum, Datenschutz, AGB als vollständige, anpassbare Seiten
- [x] Datenschutztext beschreibt wahrheitsgemäß die tatsächliche Datenverarbeitung im Code
      (IP-Hashing, Cookie-Laufzeit, Auftragsverarbeiter, 2FA-Secrets)
- [x] Setup-Skript `npm run create-admin` zur Einrichtung des ersten Admin-Accounts
- [x] README vollständig mit Setup-, Deployment- und Admin-Bootstrap-Anleitung

---

## Das Projekt ist damit funktional vollständig ✅

Alle im ursprünglichen Auftrag geforderten Bereiche sind produktionsreif implementiert:
Landingpage, Registrierung/Login/2FA, Affiliate-Dashboard mit Statistiken, Referral-Tracking,
Provisionssystem (inkl. Multi-Tier), Auszahlungssystem, Marketingmaterial, Admin-Panel,
Benachrichtigungen, Datenbankschema, Sicherheit und Dokumentation.

## Mögliche spätere Erweiterungen (bewusst modular vorbereitet)

- **Coupon-Codes:** Das Schema unterstützt bereits `campaigns` als Gruppierungseinheit —
  eine `coupons`-Tabelle mit `discount_type`/`discount_value`/`affiliate_id`-Referenz und
  ein zusätzlicher Trigger analog zu `generate_tiered_commissions` lassen sich ohne
  Breaking Changes ergänzen.
- **Partner-Rankings:** Eine öffentliche oder interne Bestenliste lässt sich direkt aus
  den vorhandenen `affiliates`-Aggregatspalten (`total_revenue_generated` etc.) bauen —
  keine Schemaänderung nötig, nur eine neue Seite + API-Route mit `ORDER BY`.
- **Echte Marketing-Assets:** Aktuell verweisen die Seed-Daten in
  `0004_marketing_assets_seed.sql` auf Platzhalter-Pfade unter `/marketing/*`. Für den
  Live-Betrieb echte Dateien in Supabase Storage (kostenloser Free-Tier-Bucket) hochladen
  und `file_url` in der Datenbank entsprechend aktualisieren.
- **Weitere Sprachen:** Aktuell komplett auf Deutsch. Struktur ist so aufgebaut, dass sich
  eine i18n-Bibliothek (z. B. `next-intl`) ohne Architekturumbau ergänzen lässt.
- **Webhooks nach außen:** Für Zapier/Make-Integrationen könnte eine `webhooks`-Tabelle
  plus Dispatch-Service ergänzt werden, der bei Events wie `payout.paid` einen POST an
  eine vom Admin hinterlegte URL sendet.

## Bereits fertig (Phase 1)
- [x] Projektstruktur & Konfiguration
- [x] Vollständiges Supabase-Schema mit Multi-Tier-Provisionen
- [x] Row Level Security auf allen Tabellen
- [x] Registrierung, Login, E-Mail-Verifizierung, Passwort-Reset, TOTP-2FA-Grundlage
- [x] IONOS-SMTP-Mailer mit allen Transaktions-E-Mail-Templates
- [x] Klick- und Conversion-Tracking (DSGVO-konform)
- [x] Landingpage komplett (Hero, Features, Rechner, Testimonials, FAQ, Footer)
- [x] Rate-Limiting ohne Redis (Postgres-basiert, Vercel-kompatibel)
