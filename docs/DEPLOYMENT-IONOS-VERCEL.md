# VELANTHOR Deployment: IONOS-Domain + Vercel-Hosting

Diese Anleitung verbindet deine bestehende IONOS-Domain mit einem kostenlosen
Vercel-Hosting für die VELANTHOR-Affiliate-Plattform. Am Ende läuft deine Seite
unter deiner gewohnten Domain, technisch aber komplett auf Vercels
Infrastruktur — inklusive automatischem SSL-Zertifikat.

Geschätzte Dauer: 20–30 Minuten aktive Arbeit, danach bis zu 24 Std. Wartezeit
für die DNS-Propagierung (meist deutlich schneller).

---

## Voraussetzungen

- [ ] GitHub-Account (kostenlos)
- [ ] Vercel-Account (kostenlos, Anmeldung direkt mit GitHub möglich)
- [ ] Supabase-Projekt bereits angelegt (siehe README.md, Schritt 2)
- [ ] Zugriff auf das IONOS-Kundencenter für deine Domain
- [ ] `.env.local` bereits mit echten Werten befüllt (zum Übertragen in Vercel)

---

## Teil 1: Code zu GitHub pushen

Falls das Projekt noch nicht in einem Git-Repository liegt:

```bash
cd velanthor-affiliate
git init
git add .
git commit -m "Initial commit: VELANTHOR Affiliate Platform"
```

Neues Repository auf [github.com/new](https://github.com/new) anlegen
(kann privat sein), dann:

```bash
git remote add origin https://github.com/DEIN-USERNAME/velanthor-affiliate.git
git branch -M main
git push -u origin main
```

> **Wichtig:** `.env.local` ist bereits über `.gitignore` von Next.js
> standardmäßig ausgeschlossen. Prüfe das trotzdem mit `git status` — es darf
> **niemals** committet werden, da es deine Supabase Service-Role-Keys enthält.

---

## Teil 2: Projekt auf Vercel importieren

1. Auf [vercel.com](https://vercel.com) einloggen (mit GitHub-Account)
2. **"Add New..." → "Project"**
3. Dein `velanthor-affiliate`-Repository auswählen → **"Import"**
4. Vercel erkennt automatisch "Next.js" als Framework — keine Änderung nötig
5. Unter **"Environment Variables"** alle Werte aus deiner `.env.local`
   eintragen:

   | Variable | Wert |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | aus Supabase-Projekteinstellungen |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | aus Supabase-Projekteinstellungen |
   | `SUPABASE_SERVICE_ROLE_KEY` | aus Supabase-Projekteinstellungen |
   | `NEXT_PUBLIC_APP_URL` | `https://velanthor.org` (deine finale Domain) |
   | `SMTP_HOST` | `smtp.ionos.de` |
   | `SMTP_PORT` | `587` |
   | `SMTP_USER` | dein IONOS-Postfach |
   | `SMTP_PASSWORD` | dein IONOS-Postfach-Passwort |
   | `SMTP_FROM_EMAIL` | dein IONOS-Postfach |
   | `ADMIN_NOTIFICATION_EMAIL` | E-Mail für neue Registrierungen |
   | `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` | aus hcaptcha.com |
   | `HCAPTCHA_SECRET_KEY` | aus hcaptcha.com |
   | `IP_HASH_SECRET` | zufälliger String (`openssl rand -hex 32`) |
   | `CONVERSION_WEBHOOK_SECRET` | zufälliger String (`openssl rand -hex 32`) |

6. **"Deploy"** klicken

Nach 1–2 Minuten ist die App unter einer automatischen Vercel-URL erreichbar
(z. B. `velanthor-affiliate.vercel.app`) — das ist bereits ein voll
funktionsfähiges Deployment, nur eben noch nicht unter deiner eigenen Domain.

---

## Teil 3: Eigene Domain in Vercel hinterlegen

1. Im Vercel-Projekt: **Settings → Domains**
2. Domain eingeben, z. B. `velanthor.org` → **"Add"**
3. Vercel zeigt dir jetzt die benötigten DNS-Einträge an. In der Regel:

   | Typ | Name | Wert |
   |---|---|---|
   | `A` | `@` | `76.76.21.21` |
   | `CNAME` | `www` | `cname.vercel-dns.com` |

   > Die exakten Werte können sich ändern — **verwende immer die Werte, die
   > dir Vercel live im Dashboard anzeigt**, nicht diese Tabelle blind
   > kopieren.

4. Optional: Vercel fragt, ob `www.velanthor.org` auf `velanthor.org`
   weiterleiten soll (empfohlen, "Redirect to..." auswählen)

---

## Teil 4: DNS bei IONOS umstellen

1. Im [IONOS-Kundencenter](https://www.ionos.de/kundencenter) einloggen
2. **Domains & SSL** → deine Domain (`velanthor.org`) auswählen
3. Zum Menüpunkt **DNS** navigieren
4. Bestehende Einträge prüfen:
   - Vorhandenen **`A`-Record** für `@` (Root-Domain) **löschen** oder auf
     Vercels IP-Adresse **bearbeiten**
   - Vorhandenen **`CNAME`-Record** für `www` löschen/bearbeiten
5. Neue Einträge gemäß den Werten aus Vercel (Teil 3) anlegen:
   - `A` | `@` | `76.76.21.21` (TTL: Standard/automatisch)
   - `CNAME` | `www` | `cname.vercel-dns.com`
6. Änderungen speichern

> **Hinweis zu MX-Records:** Falls du E-Mail-Postfächer bei IONOS auf dieser
> Domain nutzt (z. B. `partner@velanthor.org` für den SMTP-Versand), lasse die
> **MX-Records unverändert** — die betreffen nur E-Mail-Empfang und stehen in
> keinem Konflikt mit dem Website-Hosting auf Vercel.

---

## Teil 5: Propagierung abwarten & prüfen

DNS-Änderungen brauchen Zeit, um sich weltweit zu verbreiten — meist 15
Minuten bis 2 Stunden, in Einzelfällen bis zu 24 Stunden.

**Status prüfen:**
```bash
# Prüft, welche IP-Adresse für die Domain aktuell zurückgegeben wird
dig velanthor.org +short
```

Sobald der Vercel-Wert erscheint, im Vercel-Dashboard unter
**Settings → Domains** nachsehen — dort wechselt der Status von
"Invalid Configuration" zu **"Valid Configuration"** mit grünem Haken.
Vercel stellt danach automatisch ein kostenloses SSL-Zertifikat aus
(Let's Encrypt), das dauert nach erfolgreicher DNS-Erkennung meist nur
wenige Minuten.

---

## Teil 6: Finale Checks

- [ ] `https://velanthor.org` lädt die Landingpage
- [ ] Schloss-Symbol im Browser zeigt gültiges SSL-Zertifikat
- [ ] Registrierung testen → Bestätigungs-E-Mail kommt über IONOS-SMTP an
- [ ] `npm run create-admin -- deine@email.de` lokal ausführen (mit den
      Produktions-Supabase-Zugangsdaten in `.env.local`), dann unter
      `https://velanthor.org/admin` einloggen
- [ ] Einen Test-Referral-Klick über `?ref=` auslösen und im Dashboard prüfen,
      ob der Klick erfasst wird

---

## Laufende Kosten — Übersicht

| Dienst | Kosten |
|---|---|
| Vercel (Hosting) | 0 € im Hobby/Free-Tier |
| Supabase (Datenbank) | 0 € im Free-Tier |
| IONOS (nur Domain-Registrierung) | wie gehabt, unverändert |
| IONOS SMTP (E-Mail-Versand) | im bestehenden Postfach enthalten |
| hCaptcha | 0 € |

Das gesamte System läuft damit weiterhin zu deinen ursprünglichen
Bedingungen: keine laufenden Zusatzkosten außer der ohnehin vorhandenen
IONOS-Domain.

---

## Troubleshooting

**"Invalid Configuration" bleibt dauerhaft bestehen**
→ Prüfe mit `dig velanthor.org +short`, ob wirklich die Vercel-IP
zurückkommt. Falls nicht: Cache im IONOS-DNS-Interface kann bis zu 1 Stunde
brauchen, bis Änderungen sichtbar werden — auch wenn sie schon gespeichert
sind.

**E-Mails kommen nicht an**
→ SMTP-Zugangsdaten in den Vercel-Environment-Variables prüfen (Tippfehler
im Passwort sind die häufigste Ursache). IONOS-Postfach-Login separat testen.

**Middleware/Auth funktioniert nicht auf der Live-Domain**
→ `NEXT_PUBLIC_APP_URL` in den Vercel-Environment-Variables muss exakt
`https://velanthor.org` (ohne trailing slash) sein, sonst schlagen
Redirect-URLs in E-Mails fehl.
