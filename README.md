# DJ G-SUB & SOULCRAFT // 90s Underground House & AI Prompt Generator

Een complete, operationele full-stack webapplicatie geïnspireerd op de underground house scene van Chicago en Detroit (jaren 90), met een 4-laagse AI Prompt Generator (DSPy architectuur), Pioneer DDJ-FLX4 DJ stappenplan, interactieve vinyl speler en Sneaker Arty Farty studio cross-over.

---

## ⚡ Direct Starten op Windows

Je kunt de app op twee manieren starten:

### Optie 1: One-Click Launcher (Aanbevolen)
Dubbelklik op **[`start-app.bat`](file:///C:/Users/ReMarkt/.gemini/antigravity-ide/scratch/dj-gsub-soulcraft/start-app.bat)** in deze map.
- Dit controleert automatisch de installatie.
- Start de achtergrondserver.
- Opent direct je webbrowser op **[http://localhost:3000](http://localhost:3000)**.

### Optie 2: Via Terminal / PowerShell
```bash
cd C:\Users\ReMarkt\.gemini\antigravity-ide\scratch\dj-gsub-soulcraft
npm start
```
Open vervolgens in je browser: `http://localhost:3000`

---

## 🎛️ Inbegrepen Modules & Features

### 1. Visuele 90s Underground Branding
- **Kleurenpalet**: Neon Geel (`#CCFF00`), Magenta Pink (`#FF007F`), Cyaan Blauw (`#00E5FF`) op donker houtskoolzwart (`#0A0A0F`).
- **Vinyl Platenspeler**: Interactief 1200 MK2 draaitafeldek met roterende vinylplaat, kinetische toonelementen, actieve LED visualizer meters en 909-drum synthese.
- **Partner Showcase**: Sneaker Arty Farty ([www.sneakerartyfarty.nl](https://www.sneakerartyfarty.nl)) custom sneakers integratie.

### 2. Module A: DJ Stappenplan & Content Hub
- **SOULCRAFT Mixen**: Gestreamde audio en metadata van sets zoals *Hardgroove Sessions #01*, *Golden Horizon*, *The Jacking Warehouse*, *Pure Euphoria* en *Industrial Noise Session 02*.
- **Subgenre Filters**: Selecteer eenvoudig tussen Chicago House, Hardgroove, Melodic Techno, Afro House en Industrial Techno.
- **DJ Opleiding & Milestones**: Interactieve afvinkbare checklist voor Pioneer DDJ-FLX4 hardware, Rekordbox/Serato beatgrids, handmatig beatmatchen, phrasing (32-beat blocks) en 3-band EQ frequentie-overgangen.
- **Optredens & Netwerk Beheer**: Toevoegen en monitoren van gigs, locaties, zalen en resident DJ contacten.

### 3. Module B: AI Prompt Generator Engine
- **4-Laags Architectuur**:
  1. *Meta-Prompt Laag*: Detecteert rol, context, randvoorwaarden en output templates.
  2. *Few-Shot Selectie Engine*: Semantische matching op hoogwaardige prompt-vectoren.
  3. *DSPy Optimalisatie Loop*: `BootstrapFewShot` feedback loop voor continue verfijning.
  4. *Evaluatie & Guardrails*: Veiligheid, syntaxis en dynamische variabeledetectie.
- **Model-Specifieke Tailoring**:
  - **GPT-4o**: Markdown headers, gestructureerde constraints en rol-framing.
  - **Claude 3.5 Sonnet**: Gestructureerde semantische XML tags (`<system>`, `<context>`, `<instructions>`, `<variables>`, `<output_format>`).
  - **Llama 3**: Speciale tokens format (`<|begin_of_text|><|start_header_id|>...`).
- **Live Variabelen Invuller**: Typ direct waarden in voor gedetecteerde variabelen (zoals `{{mix_naam}}`, `{{locatie}}`) en zie de prompt realtime updaten.
- **1-Klik Kopiëren**: Exporteer prompts direct naar je klembord.
- **DSPy Feedback Loop**: Voer feedback in om de prompt automatisch opnieuw te optimaliseren.

---

## 📡 API Eindpunten

### REST Endpoints
- `POST /api/v1/prompts/generate` - Genereert een geoptimaliseerde prompt
- `GET /api/v1/prompts/:id` - Haalt een eerder gegenereerde prompt op
- `POST /api/v1/prompts/optimize` - Verfijnt een prompt via feedback
- `GET /api/v1/tracks` - Geeft SOULCRAFT SoundCloud tracks terug (optioneel filter `?genre=...`)
- `GET /api/v1/events` - Geeft gigs en contacten terug
- `POST /api/v1/events` - Voegt een nieuwe gig toe
- `GET /api/v1/milestones` - Geeft de DJ leermijlpalen terug
- `POST /api/v1/milestones/toggle` - Vinkt een leermijlpaal af/aan
- `GET /api/v1/branding` - Levert branding-assets en kleuren

### GraphQL Endpoint
- `POST /graphql` - Ondersteunt `listTracks`, `getPrompt` en de `generatePrompt` mutation.
