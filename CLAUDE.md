# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Phase Garden is a browser-based generative music application that creates ambient, algorithmic compositions. It uses the Web Audio API via Tone.js and the Strudel pattern library to create various audio sketches organized into sections.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

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
│   │   ├── index.html
│   │   └── main.js         # D major in Strudel
│   ├── morecomplex/
│   │   ├── index.html      # Demo page with sliders
│   │   └── main.js         # TR-909 drum pattern (synthesized)
│   ├── drums/
│   │   ├── index.html      # Demo page with Load/Start/Stop + sliders
│   │   └── main.js         # TR-909 drum pattern (dirt-samples)
│   ├── voices/
│   │   ├── index.html      # Demo page with Load/Start/Stop
│   │   └── main.js         # Ambient voice sample textures
│   ├── clapping/
│   │   ├── index.html      # Demo page with Load/Start/Stop + BPM
│   │   └── main.js         # Clapping Music (Reich 1972)
│   ├── drumming/
│   │   ├── index.html      # Demo page with Load/Start/Stop + part/density
│   │   └── main.js         # Drumming (Reich 1970-71)
│   └── piano-phase/
│       ├── index.html      # Demo page with BPM/drift sliders
│       └── main.js         # Piano Phase (Reich 1967)
├── minimalism/
│   ├── index.html          # Section page listing minimalism demos
│   ├── in-c/
│   │   ├── index.html      # Demo page with BPM/advance rate controls
│   │   └── main.js         # In C (Terry Riley 1964) - 53 phrases, 6 voices
│   ├── piano-phase/
│   │   ├── index.html      # Demo page with phase duration slider
│   │   └── main.js         # Piano Phase (Reich 1967) - full 12-phase cycle
│   ├── music-in-fifths/
│   │   ├── index.html      # Demo page with BPM/cycle time controls
│   │   └── main.js         # Music in Fifths (Glass 1969) - additive process
│   ├── les-moutons/
│   │   ├── index.html      # Demo page with voices/stagger controls
│   │   └── main.js         # Les Moutons de Panurge (Rzewski 1969)
│   └── tapping-music/
│       ├── index.html      # Demo page with BPM/bars-per-shift/humanize
│       └── main.js         # Tapping Music (Reich 1972 variation)
├── notes/                  # Shared voice audio samples (.m4a)
├── dirt-samples/           # Strudel sample library (gitignored)
└── CLAUDE.md
```

## Sections

### Pentatonic
Demos using synthesized pentatonic scales (Tone.js).

- **Kalimba** - Thumb piano style synth with random pentatonic notes
- **Kalimba 21** - 21-key kalimba with 7 voices playing across 4 octaves of C pentatonic

### Voices
Demos using recorded voice samples and synth loops (Tone.js).

- **Gamelan** - Seven voice samples playing at prime-number intervals (17m, 19m, 23m, 29m, 31m, 37m, 41m) at 30 BPM, creating Steve Reich-style phasing patterns
- **D Major** - 14 synth loops with lengths between 23.5-29.9375 seconds, playing 1-4 note figures in D major

### Strudel
Demos using the Strudel pattern library (TidalCycles for JavaScript).

- **D Major** - The D Major piece reimplemented using Strudel's pattern notation
- **More Complex** - TR-909 drum pattern with degraded kicks/claps and interactive sliders (synthesized)
- **Drums** - TR-909 drum pattern using dirt-samples with degradation sliders
- **Voices** - Ambient texture using samples at slow tempo with heavy reverb
- **Clapping Music** - Steve Reich (1972) with automatic phase shifting via `.iter(12)`
- **Drumming** - Steve Reich (1970-71) with 4 instrumental parts and density control
- **Piano Phase** - Steve Reich (1967) with variable drift rate slider

### Minimalism
Tone.js implementations of classic minimalist compositions.

- **In C** - Terry Riley (1964) - 53 phrases with 6 independent voices and configurable advance rate
- **Piano Phase** - Steve Reich (1967) - Full 12-phase cycle with gradual speed acceleration
- **Music in Fifths** - Philip Glass (1969) - Additive/subtractive process with parallel fifths
- **Les Moutons de Panurge** - Frederic Rzewski (1969) - Additive/subtractive canons with up to 8 voices
- **Tapping Music** - Steve Reich (1972) variation using FM synth bells with humanization

## Dependencies

- **Tone.js** - Audio scheduling and synthesis
- **Strudel** (@strudel/core, @strudel/mini, @strudel/webaudio, @strudel/draw) - Algorithmic pattern library
- **Vite** - Dev server and bundler
