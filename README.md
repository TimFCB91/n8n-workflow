# Tim Schoster – KI-Automation | Website

Professionelle, auf **SEO** und **GEO** (Generative Engine Optimization) optimierte
One-Page-Website für Tim Schoster als KI-Automation Experte.

Statisch (HTML/CSS/JS), **kein Build-Step** – läuft überall (GitHub Pages, Netlify,
Vercel, eigener Webspace).

## Inhalt

| Datei | Zweck |
|---|---|
| `index.html` | Startseite (Hero, Leistungen, Vorgehen, Über mich, FAQ, Kontakt) |
| `assets/css/styles.css` | Design (Dark-Theme, responsive) |
| `assets/js/main.js` | Mobile-Menü, Footer-Jahr, Formular-Handling |
| `impressum.html` / `datenschutz.html` | Pflichtseiten (DE) – **Platzhalter ausfüllen!** |
| `robots.txt` | Crawler-Steuerung inkl. KI-Bots (GPTBot, PerplexityBot, ClaudeBot …) |
| `sitemap.xml` | XML-Sitemap für Suchmaschinen |
| `llms.txt` | Strukturierte Kurzfassung für KI-Suchmaschinen (GEO) |
| `site.webmanifest` | PWA-Manifest |

## SEO-Features
- Sprechender `<title>` + Meta-Description, Canonical-URL
- Open Graph & Twitter-Cards für Link-Previews
- Semantisches HTML, eine `<h1>`, saubere Heading-Struktur
- Schema.org JSON-LD: `Person`, `ProfessionalService`, `WebSite`, `FAQPage`
- Sitemap + robots.txt, schnelle Ladezeit (kein Framework)

## GEO-Features (Generative Engine Optimization)
- `llms.txt` mit klarer, zitierbarer Zusammenfassung
- FAQ in natürlicher Frage-Antwort-Form (`FAQPage`-Schema) → ideal für KI-Antworten
- KI-Crawler in `robots.txt` ausdrücklich erlaubt
- Faktische, eindeutige Aussagen statt Marketing-Floskeln

## Vor dem Livegang anpassen
1. **Domain:** Überall `https://www.timschoster.de/` durch deine echte Domain ersetzen
   (in `index.html`, `sitemap.xml`, `robots.txt`, `llms.txt`).
2. **Kontaktdaten:** E-Mail/Telefon in `index.html`, `impressum.html`, `datenschutz.html`.
3. **Impressum & Datenschutz:** Platzhalter `[…]` durch echte Angaben ersetzen (rechtlich Pflicht).
4. **Social-Links:** LinkedIn/GitHub im JSON-LD (`sameAs`) prüfen.
5. **Bilder:** `assets/img/tim-schoster.jpg` (Portrait) und `assets/img/og-image.png`
   (1200×630, Link-Preview) hinzufügen.
6. **Formular:** Aktuell öffnet das Formular den Mail-Client. Für echtes Versenden ein
   Backend (z.&nbsp;B. Formspree, eigenes n8n-Webhook) anbinden.

## Lokal testen
```bash
python3 -m http.server 8080
# dann http://localhost:8080 öffnen
```
