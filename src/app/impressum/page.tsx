import { LegalPage } from "@/components/marketing/legal-page";

export const metadata = { title: "Impressum — VELANTHOR" };

export default function ImpressumPage() {
  return (
    <LegalPage title="Impressum">
      <p className="text-warning bg-warning/10 border border-warning/20 rounded-lg px-4 py-3">
        <strong>Hinweis:</strong> Dies ist ein Platzhaltertext. Bitte ersetze die folgenden Angaben durch die
        rechtsverbindlichen Daten deines Unternehmens gemäß § 5 TMG bzw. Art. 5 ECG (Schweiz) / § 5 ECG
        (Österreich), je nach Sitz des Unternehmens.
      </p>

      <section>
        <h2 className="text-foreground font-semibold text-base mb-2">Angaben gemäß § 5 TMG</h2>
        <p>
          [Firmenname]<br />
          [Straße und Hausnummer]<br />
          [PLZ, Ort]<br />
          [Land]
        </p>
      </section>

      <section>
        <h2 className="text-foreground font-semibold text-base mb-2">Vertreten durch</h2>
        <p>[Name der Geschäftsführung / des Vorstands]</p>
      </section>

      <section>
        <h2 className="text-foreground font-semibold text-base mb-2">Kontakt</h2>
        <p>
          Telefon: [Telefonnummer]<br />
          E-Mail: partner@velanthor.org
        </p>
      </section>

      <section>
        <h2 className="text-foreground font-semibold text-base mb-2">Registereintrag</h2>
        <p>
          Eintragung im Handelsregister.<br />
          Registergericht: [Registergericht]<br />
          Registernummer: [Registernummer]
        </p>
      </section>

      <section>
        <h2 className="text-foreground font-semibold text-base mb-2">Umsatzsteuer-ID</h2>
        <p>
          Umsatzsteuer-Identifikationsnummer gemäß §27a Umsatzsteuergesetz:<br />
          [USt-IdNr.]
        </p>
      </section>

      <section>
        <h2 className="text-foreground font-semibold text-base mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
        <p>[Name, Anschrift wie oben]</p>
      </section>

      <section>
        <h2 className="text-foreground font-semibold text-base mb-2">EU-Streitschlichtung</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
          <a href="https://ec.europa.eu/consumers/odr/" className="text-primary-400 hover:underline" target="_blank" rel="noopener noreferrer">
            https://ec.europa.eu/consumers/odr/
          </a>
          . Unsere E-Mail-Adresse findest du oben im Impressum.
        </p>
      </section>

      <section>
        <h2 className="text-foreground font-semibold text-base mb-2">Verbraucherstreitbeilegung</h2>
        <p>
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
          Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </section>
    </LegalPage>
  );
}
