# C-Lingo AIOS Tablet 1 Version 2.9

Interactive prototype for **C-Lingo AIOS Tablet 1** — a tablet-first Chinese learning experience for teenagers (12+), wrapped in a device shell with hardware-style controls and product chrome.

**Product name (consistent wording):** C-Lingo AIOS Tablet 1 Version 2.9  
**Browser title:** C-Lingo AIOS T1  
**Default viewport:** 1024×768 (iPad landscape)

## Overview

C-Lingo AIOS Tablet 1 Version 2.9 is the front-end shell and learning hub for the C-Lingo AIOS ecosystem. The app renders inside an iPad-style device frame with:

- **Boot splash** — black screen with C-Lingo cover logo; tap or auto-enter
- **Screen off / wake** — hardware-style sleep button; wake layer reuses the cover logo
- **Volume controls** — top-edge hardware keys with on-screen HUD
- **Shell chrome** — top slogan bar, bottom brand bar, and quick links to related products

### Shell quick links

| Control | Label | Destination |
|---------|-------|---------------|
| Top slogan | Beyond Language. To Bigger Worlds. | Display only (no link) |
| Top right | C-Lingo ScanPen | [ScanPen demo](https://c-lingo-scan-pen.vercel.app/) |
| Bottom center | C-Lingo AIOS | [clingoaios.com](https://www.clingoaios.com/) |

## Features

### Core learning
- **Fun Chinese Hub** — spiral learning based on scaffolding theory
- **Vocabulary cards** — HSK levels, tones, multi-language support
- **Knowledge cards** — dialogue, grammar, and pattern cards
- **Practice exercises** — tone recognition and word matching
- **Character writing** — trace → guided trace → write from memory (田字格)

### Library & culture
- **Bookshelf** — Chinese textbooks with reading progress
- **Book selection** — browse and download learning materials
- **Culture map** — interactive exploration of Chinese culture

### Specialized tools
- **HSK preparation** — mock exams and practice tests (Official & C-Lingo)
- **Mini games** — LingoFlash, Grammar Puzzle, Syntax Snap
- **AI Class Studio** — AI tutor, flashcards, sentence practice
- **Camera tools** — OCR and translation (where enabled)

## Tech stack

- **Framework:** React 18 + TypeScript
- **UI:** Material-UI (MUI) + Tailwind CSS (selected modules)
- **State:** Redux Toolkit + Zustand
- **Routing:** React Router v6
- **Animation:** Framer Motion
- **Build:** Vite

## Getting started

### Prerequisites

- Node.js **22.x** and npm

### Install

```bash
npm install
```

### Development

Default — **C-Lingo AIOS Tablet 1** at 1024×768:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Multi-resolution dev

Test other tablet sizes supported by C-Lingo AIOS Tablet 1 Version 2.9:

```bash
# 960×540
npm run dev:960

# 1920×1125
npm run dev:1920

# 2000×1200
npm run dev:2000

# Run 1024, 960, and 1920 concurrently
npm run dev:all
```

| Resolution | Port |
|------------|------|
| 1024×768 (default) | 3001 |
| 960×540 | 3002 |
| 1920×1125 | 3003 |
| 2000×1200 | 3001 |

LAN access: `npm run dev:lan` — use your machine’s local IP on the same Wi‑Fi (see terminal hints for iPad testing).

### Production build

```bash
npm run build
npm run preview
```

## Environment

Copy `.env.example` to `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_SCREEN_SIZE=1024x768
```

`VITE_SCREEN_SIZE` drives the simulated tablet resolution inside the C-Lingo AIOS Tablet 1 shell.

## Project structure

```
src/
├── assets/              # Brand assets (cover logo, glass logo, ScanPen tile, etc.)
├── components/
│   └── MainUI/          # Device shell, splash, layout, navigation
├── pages/               # Hub, lessons, library, HSK, games, etc.
├── store/               # Redux / Zustand state
├── App.tsx
└── main.tsx
public/
└── branding/            # Shell footer and shared brand images
```

## Learning flow (Fun Chinese)

1. **Warmup** — scene intro and objectives  
2. **Learn** — vocabulary with pronunciation  
3. **Knowledge cards** — dialogue, grammar, patterns  
4. **Practice** — interactive exercises  
5. **Complete** — summary and next steps  

## Design notes

- **Target users:** Teenagers (12+) in Southeast Asia and Western markets  
- **UI language:** English first; additional locales planned  
- **Interaction:** iPad touch targets, single-screen hub where possible  
- **Tone:** Gamified, not childish — clean, international app aesthetic  

## Deployment

Deploy the built `dist/` folder to any static host (e.g. Vercel). Set `VITE_SCREEN_SIZE` and `VITE_API_BASE_URL` in the project environment.

## Version

| Field | Value |
|-------|--------|
| Product | C-Lingo AIOS Tablet 1 |
| Version | 2.9 |
| Package | `nsk-horizon-local-agent` |

## License

Copyright © 2026 C-Lingo / NSK Education. All rights reserved.
