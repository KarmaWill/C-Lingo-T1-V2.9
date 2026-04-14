# NSK 2.0 - Chinese Learning Platform

A modern, interactive Chinese learning platform designed for teenagers (12+) with gamified learning experiences.

## Features

### Core Learning System
- **Fun Chinese Hub** - Spiral learning system based on scaffolding theory
- **Vocabulary Cards** - Interactive flashcards with HSK levels, tones, and multi-language support
- **Knowledge Cards** - Dialogue, grammar, and pattern cards
- **Practice Exercises** - Tone recognition and word matching games
- **Character Writing** - Step-by-step Chinese character writing practice with Tian Zi Ge (田字格)

### Library System
- **Bookshelf** - Manage and read Chinese textbooks
- **Book Selection** - Browse and download learning materials
- **Reading Progress** - Track your learning journey

### Culture Exploration
- **Interactive Map** - Explore Chinese culture and landmarks
- **Cultural Content** - Learn about Chinese traditions and history

### Specialized Tools
- **HSK Preparation** - Mock exams and practice tests
- **Mini Games** - LingoFlash, Grammar Puzzle, Syntax Snap
- **AI Chat** - Practice conversations with AI tutor
- **Camera Tools** - OCR and translation features

## Tech Stack

- **Frontend Framework:** React 18 + TypeScript
- **UI Library:** Material-UI (MUI)
- **State Management:** Redux Toolkit + Zustand
- **Routing:** React Router v6
- **Animation:** Framer Motion
- **Build Tool:** Vite
- **Styling:** Emotion (CSS-in-JS)

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Multi-Resolution Development

For testing different screen sizes:

```bash
# 960x540 resolution
npm run dev:960

# 1920x1125 resolution  
npm run dev:1920

# Run all resolutions concurrently
npm run dev:all
```

### Build for Production

```bash
npm run build
npm run preview
```

## Environment Configuration

Create a `.env` file (see `.env.example`):

```env
VITE_SCREEN_SIZE=1024x768
```

## Project Structure

```
src/
├── components/          # Reusable components
│   └── MainUI/         # Main layout components
├── pages/              # Page components
│   ├── HomePage.tsx
│   ├── FunChineseHubPage.tsx
│   ├── FunChineseLessonPage.tsx
│   ├── CharacterWritingPage.tsx
│   ├── LibraryPage.tsx
│   └── CultureMapPage.tsx
├── store/              # State management
├── App.tsx             # Main application
└── main.tsx            # Entry point
```

## Key Features Implementation

### Responsive Design
- Supports multiple iPad resolutions: 960x540, 1024x768, 1920x1125, 2000x1200
- Optimized for touch interactions
- Smooth animations and transitions

### Learning Flow
1. **Warmup** - Scene introduction and learning objectives
2. **Learn** - Vocabulary cards with pronunciation
3. **Knowledge Cards** - Dialogue, grammar, and pattern explanation
4. **Practice** - Interactive exercises
5. **Complete** - Summary and next steps

### Character Writing System
- Three-step writing practice: Trace → Trace without guide → Write from memory
- Tian Zi Ge (田字格) grid system
- Stroke order guidance
- Character information panel

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_GITHUB_URL)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel Dashboard
3. Deploy automatically on push to main branch

## Development Roadmap

- [x] Project initialization
- [x] Main UI implementation
- [x] Fun Chinese learning system
- [x] Character writing practice
- [x] Library and book system
- [x] Culture exploration map
- [ ] AI chat integration
- [ ] HSK preparation system
- [ ] User authentication
- [ ] Progress persistence
- [ ] Performance optimization

## Contributing

This is a private educational project. For questions or suggestions, please contact the project team.

## License

Copyright (c) 2026 NSK Education. All rights reserved.

---

**Target Users:** Teenagers (12+) in Southeast Asia and Western countries learning Chinese  
**Languages:** English, Vietnamese, Thai, Indonesian (more coming soon)  
**Design Philosophy:** Gamified but not childish, clean and modern interface
