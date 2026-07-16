import Link from "next/link";

const columns = [
  {
    title: "Produkt",
    links: [
      { href: "#features", label: "Features" },
      { href: "#calculator", label: "Verdienstrechner" },
      { href: "/register", label: "Partner werden" },
    ],
  },
  {
    title: "Konto",
    links: [
      { href: "/login", label: "Login" },
      { href: "/register", label: "Registrieren" },
      { href: "/forgot-password", label: "Passwort vergessen" },
    ],
  },
  {
    title: "Rechtliches",
    links: [
      { href: "/impressum", label: "Impressum" },
      { href: "/datenschutz", label: "Datenschutz" },
      { href: "/agb", label: "AGB" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-12">
      <div className="container py-16 grid sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <span className="text-lg font-extrabold tracking-tight gradient-text">VELANTHOR</span>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            KI-gestützte Krypto-Analyse- und Trading-Plattform mit einem der fairsten
            Partnerprogramme der Branche.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-foreground mb-4">{col.title}</h4>
            <ul className="space-y-3">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/[0.06] py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} VELANTHOR. Alle Rechte vorbehalten.
      </div>
    </footer>
  );
}
