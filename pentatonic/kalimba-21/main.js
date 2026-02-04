import * as Tone from 'tone';

let loops = [];
let synths = [];

// 21-key kalimba: C pentatonic across 4+ octaves
const keys = [
  'C3', 'D3', 'E3', 'G3', 'A3',
  'C4', 'D4', 'E4', 'G4', 'A4',
  'C5', 'D5', 'E5', 'G5', 'A5',
  'C6', 'D6', 'E6', 'G6', 'A6',
  'C7'
];

const bpmSlider = document.getElementById('bpm');
const bpmValue = document.getElementById('bpm-value');

bpmSlider.addEventListener('input', () => {
  const bpm = bpmSlider.value;
  bpmValue.textContent = bpm;
  Tone.Transport.bpm.value = bpm;
});

document.getElementById('start').addEventListener('click', async () => {
  await Tone.start();

  Tone.Transport.bpm.value = bpmSlider.value;

  const reverb = new Tone.Reverb({ decay: 3, wet: 0.35 }).toDestination();

  // Kalimba synth settings
  const plinkSettings = {
    oscillator: { type: 'triangle' },
    envelope: {
      attack: 0.001,
      decay: 0.5,
      sustain: 0,
      release: 0.4
    }
  };

  // Create 7 voices with different loop intervals (prime-ish numbers in 8th notes)
  const voiceConfigs = [
    { interval: '4n',  range: [0, 6],   velocity: 0.7 },   // low keys, quarter notes
    { interval: '4n.', range: [3, 9],   velocity: 0.6 },   // dotted quarter
    { interval: '2n',  range: [5, 12],  velocity: 0.5 },   // half notes, mid range
    { interval: '4t',  range: [8, 15],  velocity: 0.6 },   // triplet quarter
    { interval: '2n.', range: [10, 17], velocity: 0.5 },   // dotted half, upper mid
    { interval: '1m',  range: [14, 20], velocity: 0.4 },   // whole measure, high keys
    { interval: '4n',  range: [16, 20], velocity: 0.35 }   // highest keys, sparse
  ];

  voiceConfigs.forEach((config) => {
    const synth = new Tone.Synth(plinkSettings).connect(reverb);
    synth.volume.value = -8;
    synths.push(synth);

    const loop = new Tone.Loop((time) => {
      const keyIndex = Math.floor(Math.random() * (config.range[1] - config.range[0])) + config.range[0];
      const note = keys[keyIndex];
      synth.triggerAttackRelease(note, '8n', time, config.velocity);
    }, config.interval);

    loops.push(loop);
  });

  loops.forEach(loop => loop.start(0));
  Tone.Transport.start();
});

document.getElementById('stop').addEventListener('click', () => {
  Tone.Transport.stop();
  loops.forEach(loop => loop.stop());
  loops = [];
  synths.forEach(synth => synth.dispose());
  synths = [];
});
