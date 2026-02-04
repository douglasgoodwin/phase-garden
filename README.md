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

#### Kalimba 21
`/pentatonic/kalimba-21/`

A fuller 21-key kalimba spanning four octaves of C pentatonic (C3 to C7). Seven independent voices play at different rhythmic intervals—quarter notes, dotted quarters, half notes, triplets, and whole measures—each assigned to a different range of the instrument. Lower voices play the bass keys while higher voices float through the upper register, creating a shimmering, interlocking texture.

### Voices

#### Gamelan
`/voices/gamelan/`

Inspired by Balinese gamelan music, this piece layers seven vocal samples that repeat at different prime-number intervals (17, 19, 23, 29, 31, 37, and 41 measures at 30 BPM). The use of prime numbers ensures the voices rarely align, creating constantly shifting relationships between the parts—similar to Steve Reich's phasing compositions. The extremely slow tempo stretches each cycle to several minutes, producing a meditative, slowly-evolving texture.

#### D Major
`/voices/d-major/`

Fourteen soft synthesizer loops play figures in D major, with loop lengths ranging from 23.5 to 29.9375 seconds. Each loop contains one to four notes that play in sequence before the loop repeats. The slightly different loop lengths cause the voices to drift in and out of phase with each other, creating an ever-changing harmonic landscape. The sine wave oscillators and long attack times give each voice a breath-like, vocal quality.

### Strudel

#### D Major
`/strudel/d-major/`

The D Major piece reimplemented using Strudel's pattern language. The same 14 phasing loops are expressed in about 30 lines instead of 70, demonstrating Strudel's concise notation. Each voice is a single `note()` pattern with `.slow()` to set the loop length, all stacked together.

#### More Complex
`/strudel/morecomplex/`

A 140 BPM drum pattern using TR-909 samples. Features pulsing white noise, randomly degraded kicks and claps, and snare hits on beats 4 and 11. Interactive sliders control the probability of kick and clap notes being dropped, demonstrating Strudel's `degradeBy()` function for generative rhythms.

## Dependencies

- [Tone.js](https://tonejs.github.io/) - Web Audio framework
- [Strudel](https://strudel.cc/) - Algorithmic pattern library (TidalCycles for JS)
- [Vite](https://vitejs.dev/) - Development server and bundler
