# Handleiding: DJ G-SUB & SOULCRAFT Deployen op Render (render.com)

Dit project is volledig **Render-ready** geconfigureerd. Met het meegeleverde [`render.yaml`](file:///C:/Users/ReMarkt/.gemini/antigravity-ide/scratch/dj-gsub-soulcraft/render.yaml) bestand herkent Render alle instellingen automatisch (Blueprint deployment).

---

## 🛠️ Wat is er klaargezet voor Render?

1. **`render.yaml` (Blueprint Specificatie)**:
   - Type: `web`
   - Runtime: `node`
   - Plan: `free`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Health Check Path: `/healthz`
   - Automatische poorttoewijzing (`PORT: 10000`)
2. **`server.js` Binding**:
   - Luistert naar host `0.0.0.0` (verplicht voor Renders reverse proxy).
   - Gebruikt dynamisch `process.env.PORT`.
   - Inclusief `/healthz` endpoint voor zero-downtime health checking.
3. **`package.json`**:
   - Productie scripts (`build`, `start`).
   - Node engine specificatie (`>=20.0.0`).
4. **Git Repository**:
   - Geïnitialiseerd met opgeschoonde `.gitignore` en commit klaar voor GitHub/GitLab.

---

## 🚀 In 3 Stappen Live op Render

### Stap 1: Push de code naar een GitHub Repository
Als je nog geen GitHub repository hebt aangemaakt:
1. Ga naar [github.com/new](https://github.com/new) en maak een nieuwe repository aan (bijv. `dj-gsub-soulcraft`).
2. Open PowerShell of CMD in de projectmap en voer uit:
   ```bash
   cd C:\Users\ReMarkt\.gemini\antigravity-ide\scratch\dj-gsub-soulcraft
   git remote add origin https://github.com/JOUW_GITHUB_USERNAME/dj-gsub-soulcraft.git
   git branch -M main
   git push -u origin main
   ```

*(Vervang `JOUW_GITHUB_USERNAME` door jouw eigen GitHub gebruikersnaam)*

---

### Stap 2: Inloggen op Render & Blueprint Kiezen
1. Ga naar [dashboard.render.com](https://dashboard.render.com) en log in (handigst is via GitHub).
2. Klik rechtsboven op de blauwe knop **New +** en selecteer **Blueprint**.
3. Koppel je GitHub repository `dj-gsub-soulcraft`.

---

### Stap 3: Deploy Bevestigen
1. Render detecteert het [`render.yaml`](file:///C:/Users/ReMarkt/.gemini/antigravity-ide/scratch/dj-gsub-soulcraft/render.yaml) bestand.
2. Je ziet een overzicht van de web service:
   - **Service Name**: `dj-gsub-soulcraft`
   - **Environment**: `Node`
   - **Plan**: `Free`
3. Klik op **Apply**.
4. Render installeert de packages en start de service. Binnen 1-2 minuten staat je app live op een URL zoals:
   **`https://dj-gsub-soulcraft.onrender.com`** (volledig voorzien van gratis SSL / HTTPS).

---

## 💡 Alternatief: Handmatig als Web Service (Zonder Blueprint)
Als je liever geen Blueprint gebruikt, kies je in Render voor **New +** -> **Web Service**:
- **Name**: `dj-gsub-soulcraft`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free`
- **Health Check Path**: `/healthz`
