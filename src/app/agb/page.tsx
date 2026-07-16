import { LegalPage } from "@/components/marketing/legal-page";

export const metadata = { title: "AGB — VELANTHOR Partnerprogramm" };

export default function AgbPage() {
  return (
    <LegalPage title="Allgemeine Geschäftsbedingungen — Partnerprogramm">
      <p className="text-warning bg-warning/10 border border-warning/20 rounded-lg px-4 py-3">
        <strong>Hinweis:</strong> Dieser Text ist eine fachlich fundierte Vorlage passend zu den im System
        implementierten Regeln (Provisionsmodell, Cookie-Laufzeit, Auszahlungsbedingungen). Er ersetzt
        keine rechtliche Prüfung durch einen Anwalt vor dem Livegang.
      </p>

      <section>
        <h2 className="text-foreground font-semibold text-base mb-2">1. Geltungsbereich</h2>
        <p>
          Diese Bedingungen regeln die Teilnahme am VELANTHOR-Partnerprogramm zwischen [Firmenname]
          („VELANTHOR“) und der teilnehmenden Person („Partner“).
        </p>
      </section>

      <section>
        <h2 className="text-foreground font-semibold text-base mb-2">2. Teilnahmevoraussetzungen</h2>
        <p>
          Die Teilnahme setzt eine vollständige Registrierung, die Angabe wahrheitsgemäßer Daten sowie die
          Bestätigung der E-Mail-Adresse voraus. VELANTHOR behält sich vor, Registrierungen ohne Angabe
          von Gründen abzulehnen oder Konten bei Verstoß gegen diese Bedingungen zu sperren.
        </p>
      </section>

      <section>
        <h2 className="text-foreground font-semibold text-base mb-2">3. Referral-Links und Tracking</h2>
        <p>
          Jeder Partner erhält einen individuellen Referral-Link. Käufe werden über ein Tracking-Cookie
          mit einer Laufzeit von 90 Tagen ab dem letzten Klick zugeordnet. Bei deaktivierten Cookies wird
          ergänzend ein technischer LocalStorage-Fallback verwendet. Eine Zuordnung nach Ablauf der
          Cookie-Laufzeit erfolgt nicht.
        </p>
      </section>

      <section>
        <h2 className="text-foreground font-semibold text-base mb-2">4. Provisionen</h2>
        <p>
          Die Höhe der Provision richtet sich nach dem dem Partner zugewiesenen Provisionsplan und kann
          prozentual, als Festbetrag, als Lifetime-Provision oder als Einmalprovision ausgestaltet sein.
          Wirbt ein Partner weitere Partner, kann zusätzlich eine mehrstufige Provision (bis zu drei
          Ebenen) anfallen. VELANTHOR behält sich vor, Provisionssätze mit Wirkung für die Zukunft
          anzupassen.
        </p>
      </section>

      <section>
        <h2 className="text-foreground font-semibold text-base mb-2">5. Auszahlungen</h2>
        <p>
          Auszahlungen können ab Erreichen des im Dashboard angezeigten Mindestbetrags beantragt werden.
          Provisionen werden erst nach Prüfung und Genehmigung durch VELANTHOR zur Auszahlung freigegeben.
          Zur Verfügung stehende Auszahlungsmethoden sind PayPal, SEPA-Überweisung und Krypto-Wallet.
          VELANTHOR behält sich vor, Auszahlungen bei begründetem Betrugsverdacht zurückzuhalten.
        </p>
      </section>

      <section>
        <h2 className="text-foreground font-semibold text-base mb-2">6. Verbotene Praktiken</h2>
        <p>Nicht gestattet sind insbesondere:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Selbstwerbung (Verwendung des eigenen Referral-Links für eigene Käufe)</li>
          <li>Irreführende oder falsche Werbeaussagen über VELANTHOR</li>
          <li>Spam-Versand, Cookie-Stuffing oder sonstige manipulative Tracking-Methoden</li>
          <li>Werbung auf Plattformen mit rechtswidrigen oder diskriminierenden Inhalten</li>
        </ul>
        <p className="mt-2">Verstöße können zur sofortigen Sperrung des Partnerkontos führen.</p>
      </section>

      <section>
        <h2 className="text-foreground font-semibold text-base mb-2">7. Laufzeit und Kündigung</h2>
        <p>
          Die Partnerschaft kann von beiden Seiten jederzeit ohne Angabe von Gründen mit Wirkung für die
          Zukunft beendet werden. Bereits verdiente, genehmigte Provisionen bleiben hiervon unberührt.
        </p>
      </section>

      <section>
        <h2 className="text-foreground font-semibold text-base mb-2">8. Änderungen dieser Bedingungen</h2>
        <p>
          VELANTHOR behält sich vor, diese Bedingungen mit angemessener Vorankündigung per E-Mail zu
          ändern. Widerspricht der Partner nicht innerhalb von 14 Tagen, gelten die geänderten
          Bedingungen als angenommen.
        </p>
      </section>
    </LegalPage>
  );
}
