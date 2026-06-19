# UMBAU-REPORT: News-Scanner FCBinside (FC Bayern) → SCHALKETOTAL (FC Schalke 04)

**Datum:** 2026-06-19
**Vorlage:** `FCBinside_Workflow_fixed_2.json` (98 Nodes, inkl. Multi-Item-Fix)
**Ergebnis:** `SCHALKETOTAL_News_Scanner.json` (98 Nodes, in n8n importierbar)

Nur der **News-Scanner / Discovery-Workflow** wurde portiert (RSS/Web/X → Relevanz → Entdopplung → KI-Check → Trello-Titel → Trello-Karte). Der Artikel-Generator ist nicht Teil dieses Auftrags.

---

## 0. Validierung (selbst geprüft)

| Kriterium | Ergebnis |
|---|---|
| JSON parst fehlerfrei | ✅ |
| Node-Anzahl vorher = nachher | ✅ 98 = 98 |
| `connections` (Topologie) unverändert | ✅ 103 Kanten, nur umbenannte Nodes |
| Node-IDs / -Typen / -Positionen unverändert | ✅ |
| JS-Syntax aller Code-Nodes valide (`node --check`) | ✅ alle |
| Kein Ursprungsverein-Begriff mehr (Bayern/FC Bayern/Säbener/Allianz Arena/Kompany/Eberl/Dreesen/Hoeneß/Rummenigge/iMiaSanMia) | ✅ (außer Bayern + Dortmund/BVB **bewusst** als Gegner) |
| Trello-Board/Liste/Labels = echte S04-Werte | ✅ |
| Kein Klartext-Token in der JSON | ✅ Apify-Token entfernt |
| Platzhalter eindeutig benannt | ✅ DataTables, Telegram |

**Funktionaler Smoke-Test der Relevanz-Logik (Node „S04-Relevanz prüfen", real ausgeführt):**

| Test-Artikel | erkannt |
|---|---|
| „Karaman trifft beim Sieg von Schalke" | ✅ relevant (first_team) |
| „Muslić fordert mehr Konstanz" | ✅ relevant |
| „Sportvorstand Baumann erklärt die Transferplanung" | ✅ relevant (club_staff) |
| „… Transfer perfekt" (mit Signalwort Transfer) | ✅ relevant (transfer_context) |
| „FC Bayern verlängert mit Kimmich" | ✅ **nicht** relevant (Fremdklub) |
| „Borussia Dortmund holt neuen Verteidiger" | ✅ **nicht** relevant (Revierderby-Rivale, Fremdklub) |
| „Formel 1: Verstappen siegt" | ✅ **nicht** relevant |

> Hinweis: Eine **nackte** Schlagzeile „Schalke verpflichtet neuen Stürmer" (ohne Signalwort wie *Transfer/Wechsel/Vertrag/offiziell* und ohne Spielernamen) gilt — **wie schon im Original-Workflow** — als nicht ausreichend; das ist unverändertes Verhalten der Vorlage, kein Port-Fehler. Reale Meldungen enthalten i. d. R. ein Signalwort oder einen Spielernamen und werden korrekt erkannt.

> Verbleibende „bayern"/„dortmund"-Treffer (foreign-context) sind **gewollt**: Bayern München und Borussia Dortmund/BVB stehen jetzt als **Gegner/Fremdklub** in `foreignClubKeywords`, `foreignOnlyPatterns` und in der Gegner-Erkennung (`opponents`) der Fingerprint-Nodes.

---

## 1. Änderungsübersicht

### Verein / Schreibweise / Orte
- FC Bayern/Bayern/FCB/Münchner → **FC Schalke 04 / Schalke / S04 / die Knappen / die Königsblauen / Schalker**.
- „Säbener Straße" → **Berger Feld**; „Allianz Arena" → **Veltins-Arena / Arena AufSchalke**; München → **Gelsenkirchen**.
- Feld-/Wert-Präfixe umbenannt **inkl. aller Leser**: `is_bayern_relevant`→`is_s04_relevant`, `bayern_relevance_reason(_ai)`→`s04_relevance_reason(_ai)`, `x_relevance_mode` `bayern_strict/default`→`s04_strict/default`, `bayern_aggregator/reporter`→`s04_aggregator/reporter`, Entity-Typen `bayern_player`→`s04`-intern, Helper `isBayernPlayerEntity`→`isS04PlayerEntity`, `hasBayernClubText`→`hasS04ClubText` usw. (`_row_type`-Flags unverändert, da workflow-intern.)

### Personen (Boss-/Coach-/Statement-Erkennung)
- Trainer **Miron Muslić** (← Kompany).
- Vorstandsvorsitzender **Matthias Tillmann** (← Dreesen), Sportvorstand **Frank Baumann** (← Eberl), Vorstand Finanzen **Christina Rühl-Hamers**, Aufsichtsratsvorsitzender **Axel Hefer** (← Hoeneß/Rummenigge/Hainer).
- **Marc Wilmots** und die Alt-Trainer der Vorlage (Kompany etc.) vollständig entfernt.
- Boss-Signale generisch ergänzt: Sportvorstand / Vorstand / Vorstandsvorsitzender / Boss / Sportdirektor / Aufsichtsrat.

### Aktueller S04-Kader (Stand Juni 2026 — **Transferfenster offen, vor Saisonstart neu prüfen!**)
Per WebSearch gegen kicker/sport.de/transfermarkt/fussballtransfers gegengeprüft. **Bestätigt:** Karaman (Aufstiegsheld/Topscorer), Džeko, Sylla, N'Diaye, Aouchiche, Ljubičić, Kevin Müller (2025 von Heidenheim) im Kader. **Eingebaut (Kandidaten aus Auftrag, größtenteils plausibel — bitte zu Saisonbeginn final verifizieren):**
- **Tor:** Karius, Kevin Müller
- **Abwehr:** Kalas, Katić, Kurucay, Ayhan, N'Diaye, Timo Becker
- **Mittelfeld:** Schallenberg, Bachmann, Ljubičić, El-Faouzi, Aouchiche, Porath
- **Sturm:** Karaman, Sylla, Džeko, Lasme, Gomis, Højlund

⚠️ **Hinweis:** S04 war **2025/26 in der 2. Bundesliga** (Tabellenführer) und ist als **Aufsteiger** 2026/27 in der **Bundesliga** — daher ist der Sportschau-**Fußball/Bundesliga**-Feed relevant. Mauro Zalazar wurde verliehen (Sporting Braga) → nicht im Kader. Kollisionsanfällige Namen nur als **Vollname** gematcht (kein bloßes „müller"/„becker"/„gomis"/„sand"/„fischer").
- **Legenden** (konservativ, gängig — bei Bedarf erweitern): Klaus Fischer, Olaf Thon, Anderbrügge, Abramczik, Fichtel, Büskens, Asamoah, Ebbe Sand, Höwedes, Huub Stevens.
- **`talents` (Knappenschmiede/U19/U23)** und **`formerPlayers` (aktuelle Abgänge)**: bewusst leer gelassen (nicht geraten) → bitte mit verifizierten Namen befüllen.

### Regex-/Logik-Fixes
- Den Bayern-spezifischen „neuer"-Adjektiv-Guard (Manuel Neuer ↔ „neuer") **neutralisiert** — der aktuelle S04-Kader hat keine adjektiv-kollidierende Bare-Surname.
- `Final Trello Gatekeeper` von Bayern-/spielspezifischen Dubletten-Clustern befreit (generisches Skelett: Newsletter-/TV-Evergreen-Block + Fingerprint-Dedup).
- **Fremdklub-Logik invertiert:** Schalke/S04 aus `foreignClubKeywords` entfernt; **Bayern + Borussia Dortmund/BVB** als Fremdklubs/Gegner ergänzt (Revierderby). In der `opponents`-Liste der Fingerprint-Nodes Bayern **zusätzlich** als Gegner eingetragen (Dortmund bleibt Gegner).

### Quellen (verifiziert — siehe §3)
- **RSS:** kicker S04-Teamfeed, kicker allgemein, sport.de **te694**, transfermarkt, Sportschau-Fußball, sportbild, spox, fussballtransfers.
- **Web:** sport1 (`opta_167`), Sky, Transferfeed (`schalke-04/63`). **Web-Spezial:** schalke04.de.
- **X:** **@AndiErnst** (wichtigster Account), @RevierSport, @Plettigoal, @berger_pj, @FabrizioRomano, **@s04** (offiziell). Aggregator (iMiaSanMia) entfernt.
- **schalketotal.de wird NICHT gescrapt** (Zielportal, Selbstreferenz vermieden).

### LLM-Prompts
- „Trello-Titel generieren" + „KI Redaktioneller Check" auf Schalke 04 umgeschrieben (Tonalität/Struktur identisch, nur Verein/Personen/Beispiel-Headlines). **Modelle & Credentials unverändert.**

### Sicherheit
- **Klartext-Apify-Token entfernt** (Nodes „Apify – S04 News/Dataset abrufen") → nutzen jetzt die Credential `httpHeaderAuth` „Header Auth account". **Token rotieren.**
- Eigener Bestands-Feed `fcbinside.de/feed/` → `schalketotal.de/feed/` (Property `schalketotal_rss_xml`, in die Lese-Fallback-Kette des Bestand-Fingerprinters aufgenommen).

---

## 2. Manuelle To-dos

### 2.1 DataTables (8 Stück) in n8n anlegen, IDs eintragen (ersetzt `SCHALKETOTAL_DATATABLE_*_ID`)
Spaltenschema identisch zur Vorlage; **Tabellen 1–6 leer** starten, **7–8** Struktur (optional Inhalt) von den Vorlagen kopieren.

| Platzhalter-ID | Tabelle | Zweck | Spalten (Typ) |
|---|---|---|---|
| `SCHALKETOTAL_DATATABLE_seen_articles_ID` | `schalketotal_seen_articles` | URL-Dedup | url (String) |
| `SCHALKETOTAL_DATATABLE_seen_content_ID` | `schalketotal_seen_content` | Content-Fingerprints | content_fingerprint, url, title, source, created_at (String) |
| `SCHALKETOTAL_DATATABLE_content_items_ID` | `schalketotal_content_items` | Haupt-Content-Store | item_id, source_url, source_title, source_type, published_at, content_fingerprint, priority, generated_trello_title, social_caption, generated_article, final_title, final_article, editor_feedback_tags, **approved_example (Boolean)**, trello_card_id, fingerprint_key, story_thread_key, story_topic, story_entity, story_stage, story_stage_detail, recommended_action_ai, duplicate_decision_ai, duplicate_relationship_ai, editorial_angle_ai, source_description, source_raw_text (sonst String) |
| `SCHALKETOTAL_DATATABLE_error_alert_log_ID` | `schalketotal_error_alert_log` | RSS-Fehler-Alert | error_key, last_alert_at, error_source, source, error_message_short (String) |
| `SCHALKETOTAL_DATATABLE_topic_fingerprints_ID` | `schalketotal_topic_fingerprints` | eigener S04-Bestand | item_id, content_fingerprint, fingerprint_key, title, url, published_at, source (String) |
| `SCHALKETOTAL_DATATABLE_article_filter_log_ID` | `schalketotal_article_filter_log` | Filter-/KI-Log | created_at, filter_stage, filter_reason, title, url, source, **is_s04_relevant_code (Boolean)**, relevance_type_code, **is_s04_relevant_ai (Boolean)**, ai_action, ai_duplicate_decision, ai_relationship, **ai_confidence (Number)**, ai_priority, ai_angle, ai_reason, duplicate_of, content_fingerprint, story_thread_key, story_topic, story_entity, debug_keywords, published_at, filter_result, source_description, source_raw_text, payload_json (sonst String) |
| `SCHALKETOTAL_DATATABLE_style_rules_ID` | `schalketotal_style_rules` | Titel-Stil-Regeln (nur lesend) | style_rule_id, rule_text, rule_type, rule_kind, rule_area, rule_status, rule_priority, target_prompt, generalization_level, article_change_level, ai_confidence, approved_example, approved_at |
| `SCHALKETOTAL_DATATABLE_style_examples_ID` | `schalketotal_style_examples` | Titel-Stil-Beispiele (nur lesend) | style_example_cluster, topic_type, topic_cluster, subtype, priority, example_title, example_intro, example_h, structure_notes, style_notes, approved_example, active |

### 2.2 Telegram-Gruppe
Neue SCHALKETOTAL-Telegram-Gruppe anlegen, Bot hinzufügen, Chat-ID ermitteln → Platzhalter **`SCHALKETOTAL_TELEGRAM_CHAT_ID`** im Node „Send a text message" eintragen. Telegram-Credential bleibt.

### 2.3 Trello — schon erledigt im JSON (echte IDs), bitte nur gegenprüfen
- Board `6a356567c8832f22fcb10c84`, Workspace `6a1eee20b0a7e0ee19c003e8`.
- Karten-Erstellung → Liste „Testphase Automation" `6a3565a0b95496ff48c83b52` (gesetzt).
- Prioritäts-Labels gesetzt: High→orange `…cc1`, Medium→yellow `…cc0`, Low→green `…cbf`.

### 2.4 Apify
- **Token rotieren** (alter Klartext-Token galt als kompromittiert) → in Credential „Header Auth account" hinterlegen (`Authorization: Bearer …`), nicht in die URL.
- **Apify-Task `oaUciwcLP5kv4t9AW`** (Node „Apify – S04 News abrufen", POST ohne Body) war auf **fcbayern.com** konfiguriert → in Apify auf **schalke04.de** umstellen (oder neuen Task anlegen, ID in der URL eintragen). `article_includes/excludes` im Node „Spezial-Quelle vorbereiten" sind auf schalke04.de gesetzt — ggf. an die echte Artikel-URL-Struktur anpassen.

### 2.5 Eigener Feed + Quellen-Feinschliff
- `https://schalketotal.de/feed/` (Node „SCHALKETOTAL Artikel laden") prüfen.
- **Regionale Top-Quellen nachrüsten** (RSS nicht eindeutig verifizierbar, teils Paywall → via Apify + Login als Volltext): **RevierSport** (hat RSS via reviersport.de/service.html; Schalke-Sektion), **WAZ/FUNKE „Auf Schalke"**, **Der Westen** (Schalke-Ressort), **Ruhr Nachrichten**. ⚠️ **Dubletten:** Der Westen + WAZ teilen FUNKE-Texte — der Fingerprint-/Dubletten-Check fängt das ab, vor Produktiv beobachten.
- **`talents`/`formerPlayers`** befüllen; Kader zu Saisonbeginn final verifizieren (Transferfenster offen).

---

## 3. Quellen-Verifikation

> Methode: `curl`/`WebFetch` sind in der Sandbox für DE-Sportseiten geblockt (403/host_not_allowed) → Verifikation per **WebSearch** + dokumentierten URL-Mustern. Mit „⚠ live testen" markierte Feeds vor Produktiv einmal aus unblockierter Umgebung (curl → 200 + valides XML) prüfen.

### RSS (aktiv eingetragen)
| Quelle | URL | Status |
|---|---|---|
| kicker S04-Teamfeed | `https://newsfeed.kicker.de/team/fc-schalke-04` | ✅ Muster bestätigt (kicker `/team/<slug>`) — ⚠ live testen |
| kicker allgemein | `https://newsfeed.kicker.de/news/aktuell` | ✅ ok |
| sport.de Schalke | `https://www.sport.de/rss/news/te694/fc-schalke-04/` | ✅ **te694 bestätigt** (sport.de Team-ID) — ⚠ live testen |
| transfermarkt | `https://www.transfermarkt.de/rss/news` | ➖ aus Vorlage übernommen |
| Sportschau Fußball | `https://www.sportschau.de/fussball/index~rss2.xml` | ✅ Muster bestätigt (`~rss2.xml`), kostenlos |
| sportbild (national) | `https://sportbild.bild.de/feed/sportbild-home.xml` | ➖ aus Vorlage |
| spox | `https://feeds.footballco.com/spox/feed/in9xv2rmbt7qjzpk` | ➖ wie beauftragt unverändert |
| fussballtransfers | `https://www.fussballtransfers.com/rss-feed` | ➖ wie beauftragt unverändert |

**Nicht eingetragen (mit Grund):**
| Quelle | Grund |
|---|---|
| WAZ/FUNKE, Der Westen, Ruhr Nachrichten (RSS) | Kein eindeutiger Schalke-RSS-Feed verifizierbar (teils Paywall) → §2.5 als Apify-Scrape nachrüsten |
| RevierSport (RSS) | RSS existiert (reviersport.de/service.html), exakte Schalke-Feed-URL nicht eindeutig → §2.5 |
| BILD-Schalke | Kein Schalke-/Gelsenkirchen-Regionalfeed nachweisbar |
| Englisches S04-Fanzine | Existiert nicht (kein Pendant zu „Fear The Wall") → nicht eingetragen |

### Web (Scraping)
| Quelle | URL | Status |
|---|---|---|
| sport1 | `https://www.sport1.de/team/fc-schalke-04/opta_167/news` | ✅ **opta_167 bestätigt** |
| Sky | `https://sport.sky.de/fc-schalke-04` | ✅ Muster (analog BVB) — ⚠ live testen |
| Transferfeed | `https://www.transferfeed.com/clubs/schalke-04/63` | ✅ laut Auftrag geprüft |
| schalke04.de (Spezial) | `https://schalke04.de/news/` | ✅ Domain bestätigt — News-Pfad ⚠ live testen |

### X / Twitter (über Apify)
| Account | Rolle | Status |
|---|---|---|
| `@AndiErnst` | Andreas Ernst (FUNKE Sport, Schalke) – wichtigster Account | ✅ existiert |
| `@s04` | offizieller FC Schalke 04 | ✅ existiert |
| `@Plettigoal` / `@berger_pj` | Bundesliga-Transfers (decken S04 mit ab) | ✅ existieren |
| `@FabrizioRomano` | global, niedrige Prio | ✅ existiert |
| `@RevierSport` | regionale S04-News | ⚠ Handle bitte gegenprüfen |
| iMiaSanMia (Bayern-Aggregator) | — | ❌ entfernt |

---

## 4. Bekannte Einschränkungen
1. Kader/Quellen wurden per WebSearch verifiziert (Sandbox blockt curl). **Transferfenster offen** → Kader (`currentPlayers`), `talents`, `formerPlayers` vor Saisonstart final abgleichen.
2. Regionale Schalke-Leitmedien (RevierSport/WAZ/Der Westen/Ruhr Nachrichten) sind hochwertig, aber RSS unklar/Paywall → als Apify-Scrape mit Login nachrüsten (§2.5). FUNKE-Dubletten (WAZ↔Der Westen) im Auge behalten.
3. Apify-Token rotieren + Apify-Task auf schalke04.de umstellen (§2.4).
