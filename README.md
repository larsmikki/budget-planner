# Budgety

A self-hosted annual budget planner. Track income and expenses across custom sections with monthly breakdowns, running balances, and cumulative totals.

![Budgety screenshot](screenshot.png)

## Getting started

Pick whichever install path matches your setup. All paths land on [http://localhost:3000](http://localhost:3000). Data is persisted to `budget.json` (in the Docker volume or `./data/` for local installs).

### 1. Docker (Docker Desktop, NAS, or any Docker server)

Works on Synology, Unraid, TrueNAS, QNAP, Proxmox, or a plain Docker host.

```bash
docker run -d \
  --name budgety \
  -p 3000:3000 \
  -v budgety-data:/app/data \
  --restart unless-stopped \
  larsmikki/budgety:latest
```

Or with Compose:

```yaml
services:
  budgety:
    image: larsmikki/budgety:latest
    container_name: budgety
    ports:
      - "3000:3000"
    volumes:
      - budgety-data:/app/data
    restart: unless-stopped

volumes:
  budgety-data:
```

To build the image locally instead: `docker build -t budgety . && docker run -p 3000:3000 -v budgety-data:/app/data budgety`.

### 2. Local install on Windows

Requires [Git for Windows](https://git-scm.com/download/win) and [Node.js 20+](https://nodejs.org/).

```powershell
git clone https://github.com/larsmikki/budgety.git
cd budgety
npm install
npm run dev
```

For a production build: `npm run build && npm start`.

### 3. Local install on macOS

```bash
brew install node git
git clone https://github.com/larsmikki/budgety.git
cd budgety
npm install
npm run dev
```

For a production build: `npm run build && npm start`.

### 4. Local install on Linux

Debian/Ubuntu:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git

git clone https://github.com/larsmikki/budgety.git
cd budgety
npm install
npm run dev
```

On Fedora/RHEL use `dnf install nodejs git`; on Arch use `pacman -S nodejs npm git`.

For a production build: `npm run build && npm start`.

## Features

- **Annual budget grid** — 12-month view with per-post and per-section subtotals
- **Custom sections** — organize posts into income/expense groups with optional color coding
- **Flexible frequencies** — monthly, quarterly, biannual, yearly, or custom month selection
- **Inline editing** — double-click any cell to override amounts directly
- **Drag and drop** — reorder posts within sections
- **Quick Setup** — pre-built templates for common budget posts
- **Themes** — light/dark and color themes
- **Multi-currency** — USD, EUR, GBP, NOK, SEK, DKK, JPY, CHF, PLN with locale-aware formatting
- **Import/Export** — JSON backup and restore
- **Demo mode** — fictive amounts for screenshots without exposing real data

## Tech stack

- Single-file frontend (`index.html`) — vanilla HTML/CSS/JS, no build step
- Node.js HTTP server (`serve.js`) — static files + JSON REST API
- Zero dependencies
