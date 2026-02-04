# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Phase Garden is a browser-based generative music application that creates ambient, algorithmic compositions. It uses the Web Audio API via Tone.js to create various audio sketches organized into sections.

## Development Commands

```bash
# Start development server
npx vite

# Build for production
npx vite build

# Preview production build
npx vite preview
```

Note: Standard npm scripts (dev, build) are not configured in package.json. Use npx directly with Vite.

## Project Structure

```
/
├── index.html              # Main landing page with links to sections
├── pentatonic/
│   ├── index.html          # Section page listing pentatonic demos
│   ├── kalimba/
│   │   ├── index.html      # Demo page with Start/Stop buttons
│   │   └── main.js         # Kalimba synth demo
│   └── kalimba-21/
│       ├── index.html      # Demo page with Start/Stop buttons
│       └── main.js         # 21-key kalimba demo
├── voices/
│   ├── index.html          # Section page listing voice demos
│   ├── gamelan/
│   │   ├── index.html      # Demo page with Start/Stop buttons
│   │   └── main.js         # Gamelan voice samples demo
│   └── d-major/
│       ├── index.html      # Demo page with Start/Stop buttons
│       └── main.js         # D major phasing loops demo
├── strudel/
│   ├── index.html          # Section page listing Strudel demos
│   ├── d-major/
│   │   ├── index.html      # Demo page with Start/Stop buttons
│   │   └── main.js         # D major in Strudel
│   └── morecomplex/
│       ├── index.html      # Demo page with sliders
│       └── main.js         # TR-909 drum pattern
├── notes/                  # Shared audio samples
└── CLAUDE.md
```

## Sections

### Pentatonic
Demos using synthesized pentatonic scales.

- **Kalimba** - Thumb piano style synth with random pentatonic notes
- **Kalimba 21** - 21-key kalimba with 7 voices playing across 4 octaves of C pentatonic

### Voices
Demos using recorded voice samples.

- **Gamelan** - Seven voice samples playing at prime-number intervals (17m, 19m, 23m, 29m, 31m, 37m, 41m) at 30 BPM, creating Steve Reich-style phasing patterns
- **D Major** - 14 synth loops with lengths between 23.5-29.9375 seconds, playing 1-4 note figures in D major

### Strudel
Demos using the Strudel pattern library (TidalCycles for JavaScript).

- **D Major** - The D Major piece reimplemented using Strudel's pattern notation
- **More Complex** - TR-909 drum pattern with degraded kicks/claps, white noise, and interactive sliders

## Dependencies

- **Tone.js** - Audio scheduling and synthesis
- **Strudel** (@strudel/core, @strudel/webaudio) - Algorithmic pattern library (available but not currently used)
- **Vite** - Dev server and bundler
