import * as Tone from 'tone';

let loops = [];
let synths = [];

// D major scale across octaves
const dMajor = ['D3', 'E3', 'F#3', 'G3', 'A3', 'B3', 'C#4', 'D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5', 'D5'];

// 14 loop configurations: [loopLength in seconds, noteCount, notes]
const loopConfigs = [
  { length: 23.5,   notes: ['D3'] },
  { length: 24.25,  notes: ['A3', 'F#4'] },
  { length: 25.0,   notes: ['E3', 'G3', 'B3'] },
  { length: 25.5,   notes: ['D4'] },
  { length: 26.0,   notes: ['G3', 'B3', 'D4', 'F#4'] },
  { length: 26.5,   notes: ['A3', 'C#4'] },
  { length: 27.0,   notes: ['F#3', 'A3', 'D4'] },
  { length: 27.375, notes: ['B3'] },
  { length: 27.75,  notes: ['E4', 'G4', 'B4', 'D5'] },
  { length: 28.25,  notes: ['C#4', 'E4'] },
  { length: 28.625, notes: ['G3', 'D4', 'A4'] },
  { length: 29.0,   notes: ['F#4'] },
  { length: 29.5,   notes: ['D3', 'A3', 'F#4', 'D5'] },
  { length: 29.9375, notes: ['B3', 'E4', 'G4'] }
];

document.getElementById('start').addEventListener('click', async () => {
  await Tone.start();

  // Soft pad-like voice synth
  const reverb = new Tone.Reverb({ decay: 4, wet: 0.4 }).toDestination();

  loopConfigs.forEach((config) => {
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.8,
        decay: 0.5,
        sustain: 0.6,
        release: 2.0
      },
      volume: -12
    }).connect(reverb);

    synths.push(synth);

    const noteCount = config.notes.length;
    const noteDuration = Math.min(4, (config.length * 0.8) / noteCount);
    const spacing = (config.length - 2) / noteCount; // Leave 2s buffer at end

    let noteIndex = 0;

    const loop = new Tone.Loop((time) => {
      // Play all notes in the figure with spacing
      config.notes.forEach((note, i) => {
        synth.triggerAttackRelease(note, noteDuration, time + (i * spacing));
      });
    }, config.length);

    loops.push(loop);
  });

  loops.forEach(loop => loop.start(0));
  Tone.Transport.start();
});

document.getElementById('stop').addEventListener('click', () => {
  Tone.Transport.stop();
  loops.forEach(loop => loop.stop());
  synths.forEach(synth => synth.releaseAll());
});
