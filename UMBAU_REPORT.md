# UMBAU-REPORT: FCBinside News-Scanner → BVBWLD (Borussia Dortmund)

**Datum:** 2026-06-17
**Quelle:** `FCBinside_Workflow_fixed.json` (98 Nodes)
**Ergebnis:** `BVBWLD_News_Scanner.json` (98 Nodes, importierbar)

Es wurde ausschließlich der **News-Scanner / Discovery-Workflow** portiert (RSS/Web/X → Relevanzfilter → Entdopplung → KI-Check → Trello-Titel → Trello-Karte). Der Artikel-Generator ist nicht Teil dieses Umbaus.

---

## 0. Validierung (selbst geprüft)

| Akzeptanzkriterium | Ergebnis |
|---|---|
| JSON parst fehlerfrei | ✅ |
| Node-Anzahl vorher = nachher | ✅ 98 = 98 |
| `connections` (Topologie) unverändert | ✅ 103 Kanten identisch (nur umbenannte Nodes) |
| Node-IDs / -Typen / -Positionen unverändert | ✅ |
| JS-Syntax aller Code-Nodes valide (`node --check`) | ✅ alle |
| Kein „Bayern/FCB/Säbener/Allianz Arena/Kompany/Eberl/Kehl/iMiaSanMia" mehr | ✅ (außer bewusst als Gegner, s. u.) |
| Trello-Board/Liste korrekt | ✅ Karten → Liste `6a32f5eaea8f0a97ff84c0a1` |
| Kein Klartext-Token in der JSON | ✅ Apify-Token entfernt |
| Alle Platzhalter eindeutig benannt | ✅ (DataTables, Label, Telegram) |

**Funktionaler Smoke-Test der Relevanz-Logik (Node „BVB-Relevanz prüfen", real ausgeführt):**

| Test-Artikel | erkannt als |
|---|---|
| „Borussia Dortmund verpflichtet neuen Innenverteidiger" | ✅ relevant (transfer_context) |
| „Schlotterbeck spricht über seine Zukunft beim BVB" | ✅ relevant (first_team) |
| „Dortmund gewinnt Topspiel gegen Leipzig" | ✅ relevant (first_team) |
| „Kovač fordert mehr Konstanz" | ✅ relevant (club_staff) |
| „Geschäftsführer Ricken erklärt die Transferplanung" | ✅ relevant (club_staff) |
| „FC Bayern verlängert mit Kimmich" | ✅ **nicht** relevant (Fremdklub) |
| „Gladbach verpflichtet neuen Stürmer" | ✅ **nicht** relevant (Fremdklub) |
| „Formel 1: Verstappen gewinnt" | ✅ **nicht** relevant |

> **Hinweis zu verbleibenden „Bayern"-Treffern (16, alle gewollt):** Bayern München ist jetzt als **Gegner/Fremdklub** in den Ausschluss-Listen (`foreignClubKeywords`, `foreignOnlyPatterns`) und in der Gegner-Erkennung (`opponents`) der Fingerprint-Nodes hinterlegt – analog dazu, wie im FCB-Workflow Dortmund als Fremdklub geführt war.

---

## 1. Änderungsübersicht (was wurde geändert)

### Verein / Schreibweise / Orte
- „FC Bayern (München)" / „Bayern" / „FCB" / „Münchner" → „Borussia Dortmund" / „BVB" / „Dortmund(er)" / „Schwarz-Gelbe".
- „Säbener Straße" → „Strobelallee"; „Allianz Arena" → „Signal Iduna Park / Westfalenstadion".
- Feld-/Wertnamen mit `bayern` umbenannt **inkl. aller lesenden Stellen**:
  - `is_bayern_relevant` → `is_bvb_relevant` (Nodes 6, 7, 74, 75, 76, 78, 79, 92)
  - `is_bayern_relevant_ai` → `is_bvb_relevant_ai`, `bayern_relevance_reason(_ai)` → `bvb_relevance_reason(_ai)`
  - `x_relevance_mode`: `bayern_strict` → `bvb_strict`, `bayern_default` → `bvb_default`
  - `source_category: bayern_aggregator` → `bvb_aggregator`, `bayern_reporter` → `bvb_reporter`
  - Entity-Typen `bayern_player`/`former_bayern_player` → `bvb_player`/`former_bvb_player` (inkl. aller Helper-Funktionen `isBayernPlayerEntity` → `isBvbPlayerEntity`, `hasBayernClubText` → `hasBvbClubText` …)

### Sportliche Leitung / Personen
- Trainer **Niko Kovač** (+ Co-Trainer **Robert Kovač**) ersetzt Kompany.
- Geschäftsführer Sport **Lars Ricken** (← Eberl), Sportdirektor **Ole Book** (← Freund), Sprecher der Geschäftsführung **Carsten Cramer** (← Dreesen), Boss/Patron **Hans-Joachim Watzke** (← Hoeneß/Rummenigge/Hainer).
- **Sebastian Kehl vollständig entfernt** (Kehl hat den BVB am 22.03.2026 verlassen – bestätigt; Nachfolger als Sportdirektor: Ole Book).
- Boss-Signale generisch ergänzt: „Geschäftsführer/Sportdirektor/Sportvorstand/Boss/Vorstand".

### Aktueller BVB-Kader (verifiziert, Stand Mitte 2026)
Quellen: bvb.de, kicker.de, transfermarkt, sport.de, fussballtransfers (per WebSearch gegengeprüft – siehe §3).

- **Tor:** Kobel, Drewes, Ostrzinski, (A.) Meyer
- **Abwehr:** Couto, Anton, Schlotterbeck, Bensebaini, Svensson, Ryerson, Süle*
- **Mittelfeld:** Groß, Nmecha, Sabitzer, Jobe Bellingham, Chukwuemeka, Can, Brandt*, Duranville
- **Sturm:** Guirassy, Adeyemi, Beier, Fábio Silva

\* **Süle** (Karriereende zum 30.06.2026) und **Brandt** (Vertrag nicht verlängert) sind aktuell noch im Kader und daher noch als aktive Spieler geführt. **To-do:** nach Saisonende in die Liste `formerPlayers` verschieben.
- **Ehemalige (für „Ex-Spieler"-Logik):** Sancho, Bynoe-Gittens, Reyna, Moukoko, Jude Bellingham, Malen.
- **Legenden:** Reus, Hummels, Weidenfeller, Zorc, Klopp, Sahin, Großkreutz, Chapuisat, Emmerich, Burgsmüller.

### Regex-Bugfixes (wie beauftragt)
- Namens-Kollisionen mit deutschen/englischen Wörtern entschärft: kollisionsgefährdete Nachnamen werden **nur als Vollname** gematcht (kein bloßes `groß`, `can`, `book`, `silva`, `meyer`, `bellingham`).
- Der „neuer"-Adjektiv-Guard (Manuel Neuer ↔ „neuer") wurde zum **„Groß"-Adjektiv-Guard** umgebaut (Pascal **Groß** ↔ „groß/große/großer"), in Node 6 und in beiden Fingerprint-Nodes.
- In Node „Determine Title Style Cluster" hatten die Kader-Trigger `/boey/`, `/ulreich/`, `/neuer/` **keine Wortgrenzen** → durch wortgrenzen-sichere BVB-Torhüter `/\bkobel\b/`, `/\bdrewes\b/`, `/\bmeyer\b/` ersetzt.

### Quellen-Nodes (verifiziert, siehe §3)
- **RSS** (Node „Quellenliste (RSS Feeds)"): kicker-BVB-Teamfeed, kicker allgemein, transfermarkt, sport.de (te258), Sportschau-Fußball, Fear The Wall, BVB Buzz, sportbild, spox, fussballtransfers.
- **Web** (Node „Web-Quellen"): sport1 (BVB-Teamseite), Sky, Transferfeed, **schwatzgelb.de** (neu ergänzt).
- **Web-Spezial** (Node „Web-Spezial-Quellen" + „Spezial-Quelle vorbereiten"): bvb.de (← fcbayern.com).
- **X** (Node „X-Quellen"): **@berger_pj** (Patrick Berger, wichtigster Account), @Plettigoal, @FabrizioRomano, @BVB, @BlackYellow. `iMiaSanMia` entfernt; die „Trusted-Aggregator"-Sonderlogik in Node 6/75 zeigt jetzt auf **@BlackYellow**.

### Relevanz-/Filter-/Cluster-Logik
- Alle Keyword-/Regex-Listen in „BVB-Relevanz prüfen", „Sportart filtern", „Artikel-Links filtern", „Content Fingerprint", „BVBWLD Fingerprints vorbereiten", „Determine Title Style Cluster", „Externe gegen BVBWLD Bestand prüfen" auf BVB umgestellt.
- **Fremdklub-Logik invertiert:** Dortmund/BVB aus den `foreignClubKeywords` entfernt; Bayern München + Schalke/Gladbach etc. als Fremdklubs ergänzt. In der Gegner-Erkennung (`opponents`) der Fingerprint-Nodes wurde der Eintrag `dortmund` durch `bayern` ersetzt.
- **Node „Final Trello Gatekeeper" bewusst verschlankt:** Die dort fest verdrahteten, FCB-/spielspezifischen Dubletten-Cluster (Bayern-PSG-CL-Spiel: Kompany-Sperre, Upamecano/Dembélé, Schweinsteiger-Warnung, „der BVB-Plan"-als-Fremdklub usw.) wurden entfernt, weil sie für BVB nicht zutreffen und – im Fall der „bvb-as-foreign"-Regeln – echte BVB-Artikel blockiert hätten. **Erhalten bleiben:** Newsletter-Block, generischer TV-Evergreen-Block, Dublettenschutz über `content_fingerprint` + 48h-Cache. Tonalität/Struktur unverändert.

### LLM-Nodes
- Prompts in „Trello-Titel generieren" und „KI Redaktioneller Check" (System + User) auf BVB/Borussia Dortmund umgeschrieben (Tonalität/Struktur identisch, nur Verein/Personen/Beispiel-Headlines getauscht). **Modelle (GPT-5.4-mini) und Credentials unverändert.** Autorenname „Sebastian Mittag" → „BVBWLD-Redaktion".

### Sicherheit
- **Klartext-Apify-Token aus den Node-URLs entfernt** („Apify – BVB News/Dataset abrufen"). Beide Nodes nutzen jetzt – wie die X-Apify-Nodes – die Credential **`httpHeaderAuth` „Header Auth account"** (`genericCredentialType`). → **Token rotieren (s. To-dos).**
- Eigener Bestands-Feed `fcbinside.de/feed/` → `bvbwld.de/feed/` (Node „BVBWLD Artikel laden"); die Response-Property `fcbinside_rss_xml` → `bvbwld_rss_xml` und wurde zusätzlich in die Lese-Fallback-Kette des Fingerprinters aufgenommen, damit der Bestands-Abgleich greift.

---

## 2. Manuelle To-dos (vom Nutzer zu erledigen)

### 2.1 n8n DataTables anlegen
Es können keine DataTables vom Skript angelegt werden. Lege **8 neue, separate BVBWLD-Tabellen** an (damit sich FCB- und BVB-Daten nicht vermischen) und trage die echten IDs in die JSON ein (ersetze die Platzhalter `BVBWLD_DATATABLE_*_ID`):

| Platzhalter-ID | Tabellenname (Vorschlag) | Zweck | Spalten-Schema |
|---|---|---|---|
| `BVBWLD_DATATABLE_seen_articles_ID` | `bvbwld_seen_articles` | URL-Bestand / URL-Dedup | `url` |
| `BVBWLD_DATATABLE_seen_content_ID` | `bvbwld_seen_content` | Content-Fingerprints / Dubletten | `content_fingerprint`, `url`, `title`, `source`, `created_at` |
| `BVBWLD_DATATABLE_content_items_ID` | `bvbwld_content_items` | Haupt-Content-Store (inkl. Trello-Card-ID, Story-Threads) | `item_id`, `source_url`, `source_title`, `source_type`, `published_at`, `content_fingerprint`, `priority`, `generated_trello_title`, `social_caption`, `generated_article`, `final_title`, `final_article`, `editor_feedback_tags`, `approved_example`, `trello_card_id`, `fingerprint_key`, `story_thread_key`, `story_topic`, `story_entity`, `story_stage`, `story_stage_detail`, `recommended_action_ai`, `duplicate_decision_ai`, `duplicate_relationship_ai`, `editorial_angle_ai`, `source_description`, `source_raw_text` |
| `BVBWLD_DATATABLE_error_alert_log_ID` | `bvbwld_error_alert_log` | RSS-Fehler-Alert (Telegram-Entprellung) | `error_key`, `last_alert_at`, `error_source`, `source`, `error_message_short` |
| `BVBWLD_DATATABLE_topic_fingerprints_ID` | `bvbwld_topic_fingerprints` | Eigener BVBWLD-Bestand (Themen-Fingerprints) | `item_id`, `content_fingerprint`, `fingerprint_key`, `title`, `url`, `published_at`, `source` |
| `BVBWLD_DATATABLE_article_filter_log_ID` | `bvbwld_article_filter_log` | Filter-/KI-Entscheidungs-Log | `created_at`, `filter_stage`, `filter_reason`, `title`, `url`, `source`, `is_bvb_relevant_code`, `relevance_type_code`, `is_bvb_relevant_ai`, `ai_action`, `ai_duplicate_decision`, `ai_relationship`, `ai_confidence`, `ai_priority`, `ai_angle`, `ai_reason`, `duplicate_of`, `content_fingerprint`, `story_thread_key`, `story_topic`, `story_entity`, `debug_keywords` |
| `BVBWLD_DATATABLE_style_rules_ID` | `bvbwld_style_rules` | Genehmigte Titel-Stil-Regeln (nur lesend im Scanner) | `style_rule_id`, `rule_text`, `rule_type`, `rule_kind`, `rule_area`, `rule_status`, `rule_priority`, `target_prompt`, `generalization_level`, `article_change_level`, `ai_confidence`, `approved_example`, `approved_at` |
| `BVBWLD_DATATABLE_style_examples_ID` | `bvbwld_style_examples` | Titel-Stil-Beispiele pro Cluster (nur lesend) | `style_example_cluster`, `topic_type`, `topic_cluster`, `subtype`, `priority`, `example_title`, `example_intro`, `example_h`, `structure_notes`, `style_notes`, `approved_example`, `active` |

> Die letzten beiden Tabellen werden im Scanner nur **gelesen**; ihr Spaltenschema entspricht den o. g. im Code referenzierten Feldern (kann anfangs leer bleiben – der Workflow läuft auch ohne Regeln/Beispiele, generiert dann nur ohne dynamischen Stilblock).

### 2.2 Telegram-Gruppe
- Neue **BVBWLD-Telegram-Gruppe** anlegen, den vorhandenen Telegram-Bot hinzufügen, Chat-ID ermitteln und den Platzhalter **`BVBWLD_TELEGRAM_CHAT_ID`** im Node „Send a text message" eintragen. Telegram-Credential bleibt unverändert.

### 2.3 Trello-Labels
- Die BVBWLD-Board-Labels haben noch **keine Namen/IDs**. Der Node „Add a label to a card" enthält daher den Platzhalter **`BVBWLD_LABEL_ID_HIER`**. Lege im Board `6a32f5bdef032e78872eed41` die gewünschten Prioritäts-Labels (high/medium/low) an und ersetze den Platzhalter durch die echte Label-Logik/-IDs.

### 2.4 Apify
- **Token rotieren:** Der alte FCB-Apify-Token stand im Klartext in der Vorlage (Node-URL) und ist als kompromittiert zu betrachten → **bitte rotieren**. Der neue Token gehört in die n8n-Credential „Header Auth account" (`httpHeaderAuth`, sendet `Authorization: Bearer <token>`), nicht in die URL.
- **Apify-Task neu konfigurieren:** Der Web-Spezial-Scrape läuft über den Apify-Task `oaUciwcLP5kv4t9AW` (Node „Apify – BVB News abrufen", POST ohne Body → Task-Config bestimmt die Ziel-URL). Dieser Task war auf **fcbayern.com** konfiguriert. Bitte den Task in Apify auf **bvb.de** umstellen (oder neuen Task anlegen und dessen ID in der URL eintragen). `article_includes/excludes` im Node „Spezial-Quelle vorbereiten" sind bereits auf `bvb.de` gesetzt – ggf. an die echte Artikel-URL-Struktur anpassen.

### 2.5 Eigener Bestands-Feed (bvbwld.de)
- Node „BVBWLD Artikel laden" lädt `https://bvbwld.de/feed/`. Bitte prüfen, ob das die korrekte Feed-URL des BVBWLD-CMS ist (WordPress-Standard `/feed/`); falls das Portal statisch/anders ist, URL anpassen. Wird kein Feed geliefert, bleibt nur der Bestands-Abgleich gegen die DataTable wirksam.

### 2.6 Paywall / Cookies
- **Ruhr Nachrichten** (regionale BVB-Quelle) hat **keinen Artikel-RSS** und ist hinter Paywall → derzeit **nicht** als RSS eingebunden. Wenn gewünscht, später per Apify + Login (Cookies) als Volltext-Quelle ergänzen.

### 2.7 Nachwuchs/Talente
- Die Liste `talents` (Node „BVB-Relevanz prüfen") ist **bewusst leer** gelassen, da kein verifizierter aktueller U19/U23-Kader vorlag (kein Raten). Bitte mit aktuellen, geprüften Nachwuchs-Namen befüllen, um die Talent-Relevanz zu aktivieren.

---

## 3. Quellen-Verifikation (per HTTP/WebSearch geprüft)

> **Methodenhinweis:** In dieser Sandbox sind `curl`/`wget` und direktes `WebFetch` für die deutschen Sportseiten netzseitig geblockt (HTTP 403 / host_not_allowed). Die Verifikation erfolgte daher per **WebSearch** (Existenz + kanonische URL/Pattern) sowie – wo möglich – `WebFetch`. **Empfehlung:** Vor Produktivbetrieb die mit „⚠ live testen" markierten Feeds einmal aus einer nicht geblockten Umgebung (`curl`) auf 200 + valides XML prüfen.

### RSS (eingetragen = aktiv)
| Quelle | URL | Status |
|---|---|---|
| kicker BVB-Teamfeed | `https://newsfeed.kicker.de/team/borussia-dortmund` | ✅ ok |
| kicker allgemein | `https://newsfeed.kicker.de/news/aktuell` | ✅ ok |
| sport.de BVB | `https://www.sport.de/rss/news/te258/borussia-dortmund/` | ⚠ te258 plausibel/laut Vorgabe verifiziert – live testen |
| transfermarkt | `https://www.transfermarkt.de/rss/news` | ⚠ Host geblockt – live testen (URL aus FCB-Setup) |
| Sportschau Fußball | `https://www.sportschau.de/fussball/index~rss2.xml` | ✅ ok (kostenlos, keine Paywall) |
| Fear The Wall (EN) | `https://www.fearthewall.com/rss/current.xml` | ✅ ok |
| BVB Buzz (EN) | `https://bvbbuzz.com/feed/` | ✅ ok (WordPress) |
| sportbild (national) | `https://sportbild.bild.de/feed/sportbild-home.xml` | ➖ aus FCB-Setup beibehalten (national, BVB-gefiltert) |
| spox | `https://feeds.footballco.com/spox/feed/in9xv2rmbt7qjzpk` | ➖ wie beauftragt unverändert übernommen |
| fussballtransfers | `https://www.fussballtransfers.com/rss-feed` | ➖ wie beauftragt unverändert übernommen |

**Nicht eingetragen (mit Grund):**
| Quelle | Grund |
|---|---|
| Ruhr Nachrichten | Kein Artikel-RSS gefunden (nur ein Podcast-Feed); BVB-Bereich ist reine HTML-Seite + Paywall → s. To-do 2.6 |
| BILD-Dortmund/BVB-Feed | Kein Dortmund-/BVB-Regionalfeed nachweisbar (BILD-`/feed/<x>.xml` ist nach Bundesland, nicht Stadt; kein `dortmund.xml`/`bvb.xml` belegt) |

### Web (Scraping-Übersichtsseiten)
| Quelle | URL | Status |
|---|---|---|
| Transferfeed BVB | `https://www.transferfeed.com/clubs/borussia-dortmund/64` | ✅ ok |
| Sky BVB | `https://sport.sky.de/borussia-dortmund` | ✅ ok |
| Sport1 BVB | `https://www.sport1.de/team/borussia-dortmund/opta_157/news` | ✅ ok (kanonischer `/team/.../opta_157/news`-Pfad) |
| bvb.de (offiziell, Spezial) | `https://www.bvb.de/de/de/aktuelles/news.html` | ✅ ok |
| schwatzgelb.de | `https://www.schwatzgelb.de/` | ✅ ok |

### X / Twitter (über Apify)
| Account | Person/Rolle | Status |
|---|---|---|
| `@berger_pj` | Patrick Berger (Sky, BVB + Transfers) – wichtigster Account | ✅ existiert |
| `@Plettigoal` | Florian Plettenberg (Sky) | ✅ existiert |
| `@FabrizioRomano` | Fabrizio Romano (global, niedrigere Prio) | ✅ existiert |
| `@BVB` | offizieller Vereinsaccount (DE) | ✅ existiert |
| `@BlackYellow` | offizieller Vereinsaccount (EN, Aggregator-Rolle) | ✅ existiert |
| `iMiaSanMia` | Bayern-Aggregator | ❌ entfernt |

---

## 4. Trello-Mapping
- **Board-ID:** `6a32f5bdef032e78872eed41` (shortLink `mXBjkxXc`).
- **Karten-Erstellung → Liste „Testphase Automation"** `6a32f5eaea8f0a97ff84c0a1` (Node „Trello-Karte erstellen", `listId`).
- Weitere Listen-IDs des Boards sind dokumentiert/bekannt (Pipeline, Next Day, Ready to publish, Zur Abnahme, Geplant, In Bearbeitung, Testphase Automation erledigt, Automation Artikelentwurf, Manuelle Artikelanlage, Feedback-Auswertung, ✅ Regel übernehmen/verarbeitet) – im Scanner wird aber nur die Zielliste benötigt.
- **Label:** Platzhalter `BVBWLD_LABEL_ID_HIER` (s. To-do 2.3).

---

## 5. Bekannte Einschränkungen / Empfehlungen
1. Die portierten Regex-/Keyword-Listen wurden systematisch und konsistent von „bayern" auf „bvb/dortmund" umgestellt und stichprobenartig + funktional getestet (§0). Vor Dauerbetrieb empfiehlt sich ein Beobachtungszeitraum, um Recall/Precision für BVB feinzujustieren (insb. die Talent-Liste, §2.7).
2. Süle/Brandt nach dem 30.06.2026 in `formerPlayers` verschieben (§1).
3. Die „Trusted-Aggregator"-Sonderfreigabe zeigt nun auf `@BlackYellow` (offizieller EN-Account). Falls stattdessen ein reiner News-Aggregator gewünscht ist, kann `account_handle`/`source_category` im Node „X-Quellen" angepasst werden.
4. Apify-Token zwingend rotieren (§2.4).
