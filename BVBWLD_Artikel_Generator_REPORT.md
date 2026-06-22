# UMBAU-REPORT: Artikel-Generator FCBinside → BVBWLD

**Datum:** 2026-06-22
**Vorlage:** `FCBinsideArtikel_erstellen_v6_2.json` (122 Nodes)
**Ergebnis:** `BVBWLD_Artikel_Generator.json` (122 Nodes, in n8n importierbar)

Portierung des **Artikel-Generator-Workflows** (Trello-Karte → Volltext/Apify → KI-Artikel → WordPress-Entwurf + Meta/Tags/VG-Wort, plus eigener Kontext-Suche). Tonalität/Struktur/Logik unverändert — nur Verein/Personen/Quellen/IDs portiert.

---

## 0. Validierung (selbst geprüft)
| Kriterium | Ergebnis |
|---|---|
| JSON parst, Node-Anzahl unverändert | ✅ 122 = 122 |
| `connections` (Topologie) unverändert | ✅ 139 Kanten, nur 5 umbenannte Nodes |
| Node-IDs/-Typen/-Positionen unverändert | ✅ |
| JS-Syntax aller Code-Nodes (`node --check`) | ✅ alle |
| Kein Ursprungsverein-Begriff mehr (Bayern/FC Bayern/FCBinside/Kompany/Eberl/Säbener/…) | ✅ |
| Kein Klartext-Token | ✅ Apify-Token entfernt |

---

## 1. Was wurde geändert
- **Verein/Personen/Orte:** FC Bayern→Borussia Dortmund/BVB; Kovač/Ricken/Book/Cramer/Watzke statt Kompany/Eberl/Freund/Dreesen/Hoeneß/Rummenigge; Säbener Straße→Strobelallee, Allianz Arena→Signal Iduna Park; aktuelle BVB-Spieler (gleicher Stand wie der Scanner-Port).
- **WordPress:** alle REST-URLs `fcbinside.de` → **`bvbwld.de`** (Create Post, WP-Tags suchen/erstellen, Update WP Meta Fields, VG-Wort-Counter, Kontext-Suche). Credential-Referenzen (`wordpressApi` „Wordpress account" + HTTP Basic Auth) **unverändert** — bitte in n8n auf BVBWLD-Zugang setzen. Kategorie der Entwürfe: **[1]** (Default, anpassbar).
- **VG-Wort:** Custom-Route `…/fcbinside/v1/worthy/…` → **`…/BVBWLD_VGWORT_NAMESPACE/v1/worthy/…`** (Platzhalter, s. To-do). „Verify VG Wort Counter" nutzt Standard-`wp/v2` und braucht keinen Platzhalter.
- **Trello:** Listen-IDs auf BVBWLD-Board `6a32f5bdef032e78872eed41`: „Automation Artikelentwurf erstellen" **`6a32f5f32ccf20e03d342331`** (getCards + Trigger + IF-Filter) und „Manuelle Artikelanlage" **`6a32f5fb2f995710c4f2f525`**. Karten-Updates/Kommentare laufen über Card-IDs (kein Listenwechsel).
- **DataTables (echte BVBWLD-IDs eingetragen):** `style_rules` → `Fru6ZtGlmbNemxzh`, `style_examples` → `0Fp2SKHN5t9iUfdt`, `feedback_items` → `qkjQbw7NyanL1nVs`.
- **Eigene Kontext-Suche** (Pendant zum FCBinside-Archiv): durchsucht jetzt `bvbwld.de` (Nodes „… BVBWLD Context …"). `knownPeople`/Entity-/Tag-Listen auf BVB-Kader umgestellt.
- **LLM-Prompts** (3× OpenAI, 2× Anthropic) auf Borussia Dortmund umgeschrieben; **Modelle & Credentials unverändert** (GPT-5.x, claude-opus-4-8).
- **Sicherheit:** Klartext-Apify-Token aus den Node-URLs entfernt → Credential `httpHeaderAuth` „Header Auth account".
- **pinData** (alte FC-Bayern-Testkarte „… Müller empfiehlt dem FC Bayern …" auf „FCBinside Tagesplanung") **gelöscht** — war stale Testdaten mit altem Board.

---

## 2. Manuelle To-dos
1. **WordPress-Credentials** prüfen: `wordpressApi` „Wordpress account" und die HTTP-Basic-Auth-Credential (Nodes „Update WP Meta Fields", „Assign VG Wort Marker" etc.) müssen auf **bvbwld.de** zeigen. Kategorie ggf. von **[1]** auf euer News-Ressort ändern (Node „Create a post").
2. **VG-Wort** ⚠️: Platzhalter **`BVBWLD_VGWORT_NAMESPACE`** in den Nodes „Assign VG Wort Marker" + „Debug Worthy Marker" durch den echten REST-Namespace eures VG-Wort-Plugins auf bvbwld.de ersetzen — **oder** diese beiden Nodes deaktivieren, falls bvbwld.de (noch) kein VG-Wort-Zählmarken-Plugin hat. („Verify VG Wort Counter" läuft über Standard-WP-REST und funktioniert sobald WP steht.)
3. **Apify-Token rotieren** (alter Klartext-Token galt als kompromittiert) → in Credential „Header Auth account" hinterlegen. Die Apify-Actors (`aYG0l9s7dbB7j3gbS` Volltext-Fetch, `nFJndFXA5zjCTuudP` Externe-Suche) sind generische Scraper (URL/Query kommen aus dem Workflow) — **keine** Neukonfiguration nötig, nur Credential verknüpfen.
4. **Trello-Trigger reaktivieren:** Nach Import die beiden Trigger neu verbinden (n8n registriert neue Webhooks für das BVBWLD-Board). Prüfen, dass sie auf das richtige Board/die richtige Liste hören.
5. **DataTables** in den 5 DataTable-Nodes gegenchecken (sollten bereits auf die o. g. BVBWLD-IDs zeigen).
6. **Optional:** eine BVBWLD-Beispielkarte als pinData neu anpinnen, falls du ohne Live-Trigger testen willst.

---

## 3. Hinweise
- Die Logik (Volltext-Fetch + Rewrite-Fallback, Kontext-Anreicherung intern/extern, KI-Artikel, WP-Tags+Meta, VG-Wort, Feedback-Zeile, Trello-Kommentare) ist **strukturell identisch** zur Vorlage übernommen.
- Spielernamen entsprechen dem Scanner-Port-Stand; bei offenem Transferfenster vor Dauerbetrieb gegen den aktuellen Kader prüfen.
