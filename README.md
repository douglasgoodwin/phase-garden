# Phase Garden

A collection of browser-based generative music sketches using Tone.js. Each piece creates ambient, algorithmic compositions that evolve over time through polyrhythmic phasing patterns.

## Running

```bash
npx vite
```

Then open http://localhost:5173/

## Pieces

### Pentatonic

#### Kalimba
`/pentatonic/kalimba/`

A thumb piano simulation using two voices playing random notes from a C pentatonic scale. The high voice plays quick melodic fragments while the low voice provides a slower rhythmic foundation. Triangle wave oscillators with fast attack and short decay create the characteristic "plinky" kalimba tone. Adjustable tempo via BPM slider.

### Voices

#### Gamelan
`/voices/gamelan/`

Inspired by Balinese gamelan music, this piece layers seven vocal samples that repeat at different prime-number intervals (17, 19, 23, 29, 31, 37, and 41 measures at 30 BPM). The use of prime numbers ensures the voices rarely align, creating constantly shifting relationships between the parts—similar to Steve Reich's phasing compositions. The extremely slow tempo stretches each cycle to several minutes, producing a meditative, slowly-evolving texture.

#### D Major
`/voices/d-major/`

Fourteen soft synthesizer loops play figures in D major, with loop lengths ranging from 23.5 to 29.9375 seconds. Each loop contains one to four notes that play in sequence before the loop repeats. The slightly different loop lengths cause the voices to drift in and out of phase with each other, creating an ever-changing harmonic landscape. The sine wave oscillators and long attack times give each voice a breath-like, vocal quality.

## Dependencies

- [Tone.js](https://tonejs.github.io/) - Web Audio framework
- [Vite](https://vitejs.dev/) - Development server and bundler
