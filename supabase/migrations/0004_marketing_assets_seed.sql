-- Seed a starter set of marketing assets so the download center isn't empty
-- on a fresh install. Admins can add/replace these via the admin panel.

insert into public.marketing_assets (title, type, file_url, content, dimensions, is_active) values
  ('VELANTHOR Logo (Hell)', 'logo', '/marketing/logo-light.svg', null, 'SVG · Vektorformat', true),
  ('VELANTHOR Logo (Dunkel)', 'logo', '/marketing/logo-dark.svg', null, 'SVG · Vektorformat', true),
  ('Banner 728x90', 'banner', '/marketing/banner-728x90.png', null, '728×90 px', true),
  ('Banner 300x250', 'banner', '/marketing/banner-300x250.png', null, '300×250 px', true),
  ('Banner 1200x628 (Social)', 'social', '/marketing/social-1200x628.png', null, '1200×628 px', true),
  ('Instagram Story Template', 'social', '/marketing/story-1080x1920.png', null, '1080×1920 px', true),
  ('Dashboard Screenshot', 'screenshot', '/marketing/screenshot-dashboard.png', null, '1920×1080 px', true),
  ('Produktvorstellung (30s)', 'video', '/marketing/product-teaser.mp4', null, 'MP4 · 1920×1080', true),
  (
    'E-Mail-Vorlage: Empfehlung an Freunde',
    'email_template',
    null,
    'Betreff: Diese KI-Trading-Plattform solltest du dir ansehen

Hallo {{name}},

ich nutze seit einiger Zeit VELANTHOR für meine Krypto-Analysen und wollte es
dir empfehlen — die KI-gestützten Insights haben meine Trading-Entscheidungen
deutlich verbessert.

Falls du neugierig bist, schau es dir hier an: {{referral_link}}

Viele Grüße',
    null,
    true
  ),
  (
    'Social-Media-Text: Kurzvorstellung',
    'text',
    null,
    'Ich nutze VELANTHOR für meine Krypto-Analysen — KI-gestützte Insights,
Echtzeit-Daten, klare Signale. Wer tiefer in Krypto-Trading einsteigen will,
sollte sich das ansehen: {{referral_link}} #Krypto #Trading #KI',
    null,
    true
  );
