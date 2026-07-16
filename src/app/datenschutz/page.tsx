import { LegalPage } from "@/components/marketing/legal-page";

export const metadata = { title: "Datenschutz — VELANTHOR" };

export default function DatenschutzPage() {
  return (
    <LegalPage title="Datenschutzerklärung">
      <p className="text-warning bg-warning/10 border border-warning/20 rounded-lg px-4 py-3">
        <strong>Hinweis:</strong> Dieser Text beschreibt die im Code implementierte Datenverarbeitung
        wahrheitsgemäß und dient als fachlich fundierte Grundlage. Er ersetzt keine anwaltliche Prüfung —
        bitte vor Livegang von einem Fachanwalt für Datenschutzrecht gegenprüfen lassen und mit den
        Firmendaten aus dem Impressum vervollständigen.
      </p>

      <section>
        <h2 className="text-foreground font-semibold text-base mb-2">1. Verantwortlicher</h2>
        <p>
          Verantwortlich für die Datenverarbeitung auf dieser Website ist [Firmenname], [Anschrift],
          erreichbar unter partner@velanthor.org.
        </p>
      </section>

      <section>
        <h2 className="text-foreground font-semibold text-base mb-2">2. Welche Daten wir im Partnerprogramm verarbeiten</h2>
        <p>Im Rahmen des VELANTHOR-Partnerprogramms verarbeiten wir folgende Datenkategorien:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>
            <strong>Registrierungsdaten:</strong> Vorname, Nachname, E-Mail-Adresse, Land, optional
            Auszahlungsdaten (PayPal-E-Mail, IBAN/BIC) und Steuerinformationen.
          </li>
          <li>
            <strong>Tracking-Daten:</strong> Beim Klick auf einen Referral-Link erfassen wir Gerätetyp,
            Browser, Betriebssystem, Referrer-URL, UTM-Parameter sowie eine{" "}
            <strong>gehashte, nicht rückführbare Version deiner IP-Adresse</strong> (täglich rotierender
            SHA-256-Hash). Die IP-Adresse selbst wird zu keinem Zeitpunkt im Klartext gespeichert.
          </li>
          <li>
            <strong>Cookie- und LocalStorage-Daten:</strong> Ein Tracking-Cookie mit einer Laufzeit von 90
            Tagen ordnet Käufe dem jeweiligen Partner zu. Ist die Cookie-Speicherung durch den Browser
            eingeschränkt, verwenden wir ergänzend LocalStorage als technischen Fallback.
          </li>
          <li>
            <strong>Transaktionsdaten:</strong> Provisionen, Auszahlungshistorie und zugehörige
            Bestellwerte, soweit für die Abrechnung erforderlich.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-foreground font-semibold text-base mb-2">3. Rechtsgrundlage</h2>
        <p>
          Die Verarbeitung erfolgt zur Erfüllung des Partnerschaftsvertrags (Art. 6 Abs. 1 lit. b DSGVO)
          sowie, soweit gesetzlich vorgeschrieben, zur Erfüllung steuerrechtlicher Aufbewahrungspflichten
          (Art. 6 Abs. 1 lit. c DSGVO).
        </p>
      </section>

      <section>
        <h2 className="text-foreground font-semibold text-base mb-2">4. Speicherdauer</h2>
        <p>
          Tracking-Cookies und die zugehörige Session-Zuordnung werden nach 90 Tagen automatisch
          ungültig. Konto- und Abrechnungsdaten werden für die Dauer der Partnerschaft sowie
          anschließend gemäß gesetzlicher Aufbewahrungsfristen gespeichert.
        </p>
      </section>

      <section>
        <h2 className="text-foreground font-semibold text-base mb-2">5. Empfänger</h2>
        <p>
          Für den Betrieb dieser Plattform setzen wir folgende Auftragsverarbeiter ein: Supabase Inc.
          (Datenbank-Hosting), Vercel Inc. (Anwendungs-Hosting), IONOS SE (E-Mail-Versand) sowie
          hCaptcha / Intuition Machines Inc. (Spam-Schutz bei der Registrierung). Mit allen genannten
          Anbietern bestehen bzw. sind Auftragsverarbeitungsverträge abzuschließen.
        </p>
      </section>

      <section>
        <h2 className="text-foreground font-semibold text-base mb-2">6. Deine Rechte</h2>
        <p>
          Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
          Datenübertragbarkeit sowie Widerspruch gegen die Verarbeitung deiner Daten. Wende dich hierzu
          an partner@velanthor.org. Zudem steht dir ein Beschwerderecht bei der zuständigen
          Datenschutzaufsichtsbehörde zu.
        </p>
      </section>

      <section>
        <h2 className="text-foreground font-semibold text-base mb-2">7. Zwei-Faktor-Authentifizierung</h2>
        <p>
          Aktivierst du die optionale Zwei-Faktor-Authentifizierung, wird ein kryptografischer Schlüssel
          (TOTP-Secret) verschlüsselt in unserer Datenbank hinterlegt. Dieser dient ausschließlich der
          Absicherung deines Kontos und wird nicht für andere Zwecke verwendet.
        </p>
      </section>
    </LegalPage>
  );
}
