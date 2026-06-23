# UMBAU-REPORT: Artikel-Generator FCBinside → SCHALKETOTAL

**Datum:** 2026-06-23
**Vorlage:** `FCBinsideArtikel_erstellen_v6_3.json` (122 Nodes)
**Ergebnis:** `SCHALKETOTAL_Artikel_Generator.json` (122 Nodes, in n8n importierbar)

Portierung des **Artikel-Generator-Workflows** (Trello-Karte → Volltext/Apify → KI-Artikel → WordPress-Entwurf + Meta/Tags/VG-Wort + eigener Kontext-Suche) auf FC Schalke 04. Struktur/Logik unverändert.

---

## 0. Validierung (selbst geprüft)
| Kriterium | Ergebnis |
|---|---|
| JSON parst, Node-Anzahl unverändert | ✅ 122 = 122 |
| `connections` (Topologie) unverändert | ✅ 139 Kanten, nur 5 umbenannte Context-Nodes |
| Node-IDs/-Typen/-Positionen unverändert | ✅ |
| JS-Syntax aller Code-Nodes (`node --check`) | ✅ alle |
| Kein Ursprungsverein-Begriff mehr (Bayern/FCBinside/Kompany/Eberl/Säbener/…) | ✅ 0 Treffer |
| Kein Klartext-Token | ✅ Apify-Token entfernt |

---

## 1. Was wurde geändert
- **Verein/Personen/Orte:** FC Bayern→FC Schalke 04/S04/Knappen; **Muslić/Tillmann/Baumann/Hefer** statt Kompany/Eberl/Dreesen/Hoeneß/Rummenigge; Säbener Straße→Berger Feld, Allianz Arena→Veltins-Arena, München→Gelsenkirchen; aktueller S04-Kader (gleicher Stand wie der Schalke-Scanner-Port).
- **WordPress:** alle REST-URLs `fcbinside.de` → **`schalketotal.de`** (Create Post, WP-Tags, Update WP Meta Fields, VG-Wort, Kontext-Suche). Credential-Referenzen (`wordpressApi` + HTTP Basic Auth) **unverändert** → in n8n auf SCHALKETOTAL-Zugang setzen. Kategorie: **[1]** (Default).
- **VG-Wort:** Custom-Route → **`…/SCHALKETOTAL_VGWORT_NAMESPACE/v1/worthy/…`** (Platzhalter). „Verify VG Wort Counter" nutzt Standard-`wp/v2`, kein Platzhalter.
- **Trello:** Listen auf Schalke-Board `6a356567c8832f22fcb10c84`: „Automation Artikelentwurf erstellen" **`6a3565aad9087a607f896265`** (getCards + Trigger + IF-Filter), „Manuelle Artikelanlage" **`6a3565ae883da31cb298c6d0`**.
- **DataTables (Platzhalter):** `SCHALKETOTAL_DATATABLE_style_rules_ID`, `_style_examples_ID`, `_feedback_items_ID` → echte Schalke-IDs eintragen (s. To-do).
- **Eigene Kontext-Suche:** durchsucht jetzt `schalketotal.de`; `knownPeople`/Entity-/Tag-Listen auf S04-Kader.
- **LLM-Prompts** (3× OpenAI, 2× Anthropic) auf Schalke 04 umgeschrieben; **Modelle & Credentials unverändert**.
- **Sicherheit:** Klartext-Apify-Token entfernt → Credential „Header Auth account".
- **pinData** (alte FC-Bayern-Testkarte) gelöscht.

---

## 2. Manuelle To-dos
1. **DataTables**: 3 Tabellen-IDs (`schalketotal_style_rules`, `schalketotal_style_examples`, `schalketotal_feedback_items`) in den 5 DataTable-Nodes eintragen (Platzhalter ersetzen). Schick mir die IDs, dann trage ich sie ein.
2. **WordPress-Credentials** auf **schalketotal.de** setzen (`wordpressApi` + HTTP Basic Auth); Kategorie ggf. von **[1]** auf euer News-Ressort.
3. **VG-Wort** ⚠️: Platzhalter **`SCHALKETOTAL_VGWORT_NAMESPACE`** (Nodes „Assign/Debug Worthy") durch den echten Plugin-Namespace ersetzen — **oder** die 2 Nodes deaktivieren, falls schalketotal.de kein VG-Wort-Plugin hat.
4. **Apify-Token rotieren** → in „Header Auth account". Actors sind generisch (keine Neukonfig).
5. **Trello-Trigger reaktivieren** (neue Webhooks fürs Schalke-Board).

---

## 3. Hinweis
- Spielernamen entsprechen dem Schalke-Scanner-Port; bei offenem Transferfenster vor Dauerbetrieb gegen den aktuellen Kader prüfen.
