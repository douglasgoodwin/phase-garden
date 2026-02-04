import * as Tone from 'tone';

// Les Moutons de Panurge (1969) by Frederic Rzewski
// "The Sheep of Panurge" - named after Rabelais' story where sheep
// blindly follow each other off a cliff
//
// Process:
// 1. A 65-note melody
// 2. Additive: play 1, then 1-2, then 1-2-3, ... up to 1-65
// 3. Subtractive: play 2-65, then 3-65, ... down to just 65
// 4. Multiple performers do this independently, creating canons

let voices = [];
let masterLoop = null;
let updateInterval = null;

// Rzewski's 65-note melody (G dorian/mixolydian modal melody)
// This is an approximation capturing the folk-like, modal character
const melody = [
  'G4', 'A4', 'Bb4', 'C5', 'D5', 'C5', 'Bb4', 'A4',  // 1-8
  'G4', 'F4', 'G4', 'A4', 'Bb4', 'A4', 'G4', 'F4',   // 9-16
  'Eb4', 'F4', 'G4', 'A4', 'Bb4', 'C5', 'D5', 'Eb5', // 17-24
  'D5', 'C5', 'Bb4', 'A4', 'G4', 'A4', 'Bb4', 'C5',  // 25-32
  'D5', 'Eb5', 'F5', 'Eb5', 'D5', 'C5', 'Bb4', 'C5', // 33-40
  'D5', 'C5', 'Bb4', 'A4', 'G4', 'F4', 'Eb4', 'D4',  // 41-48
  'Eb4', 'F4', 'G4', 'F4', 'Eb4', 'D4', 'C4', 'D4',  // 49-56
  'Eb4', 'F4', 'G4', 'A4', 'Bb4', 'C5', 'D5', 'Eb5', // 57-64
  'D5'                                                // 65
];

// Voice configurations - varied timbres like a mixed ensemble
const voiceConfigs = [
  {
    name: 'Clarinet',
    color: '#4a7c59',
    settings: {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.05, decay: 0.2, sustain: 0.6, release: 0.2 }
    },
    octaveShift: 0
  },
  {
    name: 'Flute',
    color: '#7c9885',
    settings: {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.08, decay: 0.1, sustain: 0.5, release: 0.15 }
    },
    octaveShift: 1
  },
  {
    name: 'Oboe',
    color: '#8b5a2b',
    settings: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.03, decay: 0.2, sustain: 0.4, release: 0.2 }
    },
    octaveShift: 0,
    filter: 2500
  },
  {
    name: 'Violin',
    color: '#a04040',
    settings: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.08, decay: 0.15, sustain: 0.5, release: 0.25 }
    },
    octaveShift: 0,
    filter: 3000
  },
  {
    name: 'Viola',
    color: '#704050',
    settings: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.1, decay: 0.15, sustain: 0.5, release: 0.25 }
    },
    octaveShift: -1,
    filter: 2000
  },
  {
    name: 'Marimba',
    color: '#c07830',
    settings: {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.2 }
    },
    octaveShift: 0
  },
  {
    name: 'Vibraphone',
    color: '#4080a0',
    settings: {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.6, sustain: 0.2, release: 0.4 }
    },
    octaveShift: 1
  },
  {
    name: 'Bass',
    color: '#505070',
    settings: {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 0.3 }
    },
    octaveShift: -2
  }
];

const bpmSlider = document.getElementById('bpm');
const bpmValue = document.getElementById('bpm-value');
const voicesSlider = document.getElementById('voices');
const voicesValue = document.getElementById('voices-value');
const staggerSlider = document.getElementById('stagger');
const staggerValue = document.getElementById('stagger-value');
const status = document.getElementById('status');
const voicesStatus = document.getElementById('voices-status');

bpmSlider.addEventListener('input', () => {
  const bpm = bpmSlider.value;
  bpmValue.textContent = bpm;
  Tone.Transport.bpm.value = bpm;
});

voicesSlider.addEventListener('input', () => {
  voicesValue.textContent = voicesSlider.value;
});

staggerSlider.addEventListener('input', () => {
  staggerValue.textContent = staggerSlider.value;
});

function transposeOctave(note, octaves) {
  if (!note) return null;
  const match = note.match(/([A-Gb#]+)(\d)/);
  if (!match) return note;
  const pitch = match[1];
  const octave = parseInt(match[2]) + octaves;
  return pitch + octave;
}

function updateDisplay() {
  const html = voices.map(v => {
    const phase = v.expanding ? 'adding' : 'removing';
    const progress = v.expanding
      ? (v.endIndex / melody.length) * 100
      : ((melody.length - v.startIndex) / melody.length) * 100;

    let rangeText;
    if (v.startIndex === 0 && v.endIndex === melody.length) {
      rangeText = 'Full melody';
    } else if (v.expanding) {
      rangeText = `Notes 1-${v.endIndex}`;
    } else {
      rangeText = `Notes ${v.startIndex + 1}-65`;
    }

    return `<div style="margin: 8px 0;">
      <span style="color: ${v.config.color}; font-weight: bold; display: inline-block; width: 80px;">${v.config.name}</span>
      ${rangeText} (${phase})
      <div style="background: #333; height: 8px; width: 150px; display: inline-block; margin-left: 8px;">
        <div style="background: ${v.config.color}; height: 100%; width: ${progress}%;"></div>
      </div>
    </div>`;
  }).join('');

  voicesStatus.innerHTML = html;

  // Check if all voices are done
  const allDone = voices.every(v => v.done);
  if (allDone) {
    status.textContent = 'All voices have completed the journey!';
  }
}

class Voice {
  constructor(config, reverb, startDelay) {
    this.config = config;
    this.startIndex = 0;    // First note of current segment
    this.endIndex = 1;      // Last note of current segment (exclusive)
    this.noteIndex = 0;     // Current position within segment
    this.expanding = true;  // true = additive phase, false = subtractive
    this.done = false;
    this.startDelay = startDelay;
    this.notesPlayed = 0;

    // Create synth
    this.synth = new Tone.Synth(config.settings);

    if (config.filter) {
      const filter = new Tone.Filter(config.filter, 'lowpass').connect(reverb);
      this.synth.connect(filter);
    } else {
      this.synth.connect(reverb);
    }

    this.synth.volume.value = -10;
  }

  playNext(time) {
    // Wait for stagger delay
    if (this.notesPlayed < this.startDelay) {
      this.notesPlayed++;
      return;
    }

    if (this.done) return;

    // Get current segment
    const segment = melody.slice(this.startIndex, this.endIndex);
    if (segment.length === 0) {
      this.done = true;
      return;
    }

    // Play current note
    const note = segment[this.noteIndex];
    const transposed = transposeOctave(note, this.config.octaveShift);
    this.synth.triggerAttackRelease(transposed, '16n', time);

    this.noteIndex++;

    // End of segment - advance the process
    if (this.noteIndex >= segment.length) {
      this.noteIndex = 0;

      if (this.expanding) {
        // Additive phase: add one note
        if (this.endIndex < melody.length) {
          this.endIndex++;
        } else {
          // Start subtractive phase
          this.expanding = false;
          this.startIndex = 1;
        }
      } else {
        // Subtractive phase: remove one note from beginning
        if (this.startIndex < melody.length - 1) {
          this.startIndex++;
        } else {
          // Done!
          this.done = true;
        }
      }
    }
  }

  dispose() {
    this.synth.dispose();
  }
}

document.getElementById('start').addEventListener('click', async () => {
  await Tone.start();

  Tone.Transport.bpm.value = parseInt(bpmSlider.value);

  const numVoices = parseInt(voicesSlider.value);
  const stagger = parseInt(staggerSlider.value);

  // Reverb for blend
  const reverb = new Tone.Reverb({ decay: 2, wet: 0.2 }).toDestination();

  // Create voices with staggered starts
  voices = [];
  for (let i = 0; i < numVoices; i++) {
    const config = voiceConfigs[i % voiceConfigs.length];
    const startDelay = i * stagger; // Each voice starts N notes later
    voices.push(new Voice(config, reverb, startDelay));
  }

  // Main loop - all voices play together
  masterLoop = new Tone.Loop((time) => {
    voices.forEach(v => v.playNext(time));
  }, '8n');

  masterLoop.start(0);
  Tone.Transport.start();

  status.textContent = 'Playing...';
  updateDisplay();
  updateInterval = setInterval(updateDisplay, 200);
});

document.getElementById('stop').addEventListener('click', () => {
  Tone.Transport.stop();

  if (masterLoop) {
    masterLoop.stop();
    masterLoop.dispose();
    masterLoop = null;
  }

  voices.forEach(v => v.dispose());
  voices = [];

  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }

  status.textContent = '';
  voicesStatus.innerHTML = '';
});
