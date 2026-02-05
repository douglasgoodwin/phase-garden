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

### Minimalism

Implementations of classic process music pieces, each faithfully reproducing the compositional rules and constraints of the original works.

#### In C
`/minimalism/in-c/`

Terry Riley's seminal 1964 work that launched the minimalist movement. 53 short melodic phrases are played by six voices (Marimba, Vibraphone, Piano, Violin, Flute, Plucked), each independently deciding when to advance to the next phrase. A steady high-C pulse anchors everything. The "Advance rate" slider controls how quickly voices progress through the phrases, from meditative 30+ minute performances to quick 5-minute sprints.

#### Piano Phase
`/minimalism/piano-phase/`

Steve Reich's 1967 phasing study for two pianos. Both play the same 12-note pattern (E-F#-B-C#-D-F#-E-C#-B-F#-D-C#), but Piano 2 periodically accelerates until it's one note ahead, then locks back in sync. This repeats through all 12 phase positions until the pianos return to unison. Progress bars show each piano's relative position in the cycle.

#### Music in Fifths
`/minimalism/music-in-fifths/`

Philip Glass's 1969 piece demonstrating his additive process technique. Two voices play in parallel fifths (always 7 semitones apart) through a 24-note melodic figure. The piece starts with just 2 notes, gradually adds one note at a time until the full pattern plays, then removes notes back down to 2. The cycle time slider controls how long this expansion/contraction takes.

#### Les Moutons de Panurge
`/minimalism/les-moutons/`

Frederic Rzewski's 1969 work ("The Sheep of Panurge") for any number of melody instruments. A 65-note modal melody is played through an additive then subtractive process: first 1, then 1-2, then 1-2-3... up to all 65 notes, then 2-65, 3-65... down to just note 65. Multiple voices (2-8) perform this independently with staggered starts, creating rich canonic textures. Named after Rabelais' story of sheep blindly following each other.

#### Tapping Music
`/minimalism/tapping-music/`

An interpretation of Steve Reich's Clapping Music (1972) using bell tones. Two voices play Reich's 12-beat pattern (X X X - X X - X - X X -). One voice stays fixed while the other shifts one beat at a time, cycling through all 12 phase positions before returning to unison. Sliders control tempo, bars between shifts, and humanization (timing variation).

### Strudel

Pieces using [Strudel](https://strudel.cc/), an algorithmic pattern library (TidalCycles for JavaScript). Strudel excels at fixed interlocking patterns with transformations, while Tone.js is better for stateful processes with dynamic tempo changes.

#### D Major
`/strudel/d-major/`

The D Major piece reimplemented using Strudel's pattern language. The same 14 phasing loops are expressed in about 30 lines instead of 70, demonstrating Strudel's concise notation. Each voice is a single `note()` pattern with `.slow()` to set the loop length, all stacked together.

#### Clapping Music
`/strudel/clapping/`

Steve Reich's 1972 piece for two clappers. Uses real handclap samples with humanized timing offsets and reverb. One clapper stays fixed while the other shifts one beat every 8 bars, cycling through all 12 phase positions. Reich's original 12-beat pattern (3-rest-2-rest-1-rest-2-rest) creates constantly changing syncopations as the two parts align and misalign.

#### Drumming
`/strudel/drumming/`

Steve Reich's monumental 1970-71 work in four parts. Part 1 uses tabla samples for the four tuned bongos, Parts 2-3 use synthesized marimbas and glockenspiels. Reich's basic 12-beat rhythmic pattern (positions 1-4-7-9-11) is played by multiple voices with different phase offsets, creating dense interlocking textures. The density slider simulates Reich's "substituting beats for rests" technique.

#### Piano Phase
`/strudel/piano-phase/`

Steve Reich's 1967 phasing study, reimplemented using Strudel's natural drift approach. Two pianos play the same 12-note pattern, but Piano 2 runs at `.slow(1 - drift)`, completing each cycle slightly faster. Over time it naturally pulls ahead, creating smooth continuous phasing rather than discrete tempo jumps. The drift slider controls how quickly the phasing occurs.

#### More Complex
`/strudel/morecomplex/`

A 140 BPM drum pattern using TR-909 samples. Features pulsing white noise, randomly degraded kicks and claps, and snare hits on beats 4 and 11. Interactive sliders control the probability of kick and clap notes being dropped, demonstrating Strudel's `degradeBy()` function for generative rhythms.

## Dependencies

- [Tone.js](https://tonejs.github.io/) - Web Audio framework
- [Strudel](https://strudel.cc/) - Algorithmic pattern library (TidalCycles for JS)
- [Vite](https://vitejs.dev/) - Development server and bundler
