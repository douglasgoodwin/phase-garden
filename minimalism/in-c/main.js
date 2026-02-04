import * as Tone from 'tone';

// In C (1964) by Terry Riley
// 53 short phrases, all performers work through them at their own pace
// A steady high C pulse anchors everything

let pulse = null;
let voices = [];
let updateInterval = null;

// The 53 phrases of In C (simplified representation)
// Each phrase is an array of { note, duration } objects
// Durations: 'e' = eighth, 'q' = quarter, 'h' = half, 'w' = whole, 'r' = rest
const phrases = [
  // 1-5: Opening figures, simple C-E patterns
  [{ note: 'C5', dur: 'e' }, { note: 'E5', dur: 'e' }],
  [{ note: 'C5', dur: 'e' }, { note: 'E5', dur: 'e' }, { note: 'F5', dur: 'e' }, { note: 'E5', dur: 'e' }],
  [{ note: null, dur: 'e' }, { note: 'E5', dur: 'e' }, { note: 'F5', dur: 'e' }, { note: 'E5', dur: 'e' }],
  [{ note: null, dur: 'e' }, { note: 'E5', dur: 'e' }, { note: 'F5', dur: 'e' }, { note: 'G5', dur: 'e' }],
  [{ note: 'E5', dur: 'e' }, { note: 'F5', dur: 'e' }, { note: 'G5', dur: 'e' }],

  // 6-10: Introducing longer notes and G
  [{ note: 'C5', dur: 'w' }],
  [{ note: null, dur: 'q' }, { note: null, dur: 'e' }, { note: 'C5', dur: 'e' }, { note: 'C5', dur: 'e' }],
  [{ note: 'G4', dur: 'h' }, { note: 'G4', dur: 'h' }],
  [{ note: 'B4', dur: 'e' }, { note: 'G4', dur: 'e' }],
  [{ note: 'B4', dur: 'e' }, { note: 'G4', dur: 'q' }],

  // 11-15: More motion
  [{ note: 'F5', dur: 'e' }, { note: 'E5', dur: 'e' }, { note: 'F5', dur: 'e' }],
  [{ note: 'F5', dur: 'e' }, { note: 'E5', dur: 'q' }],
  [{ note: 'B4', dur: 'e' }, { note: 'G4', dur: 'e' }, { note: 'F4', dur: 'e' }, { note: 'G4', dur: 'e' }],
  [{ note: 'C5', dur: 'w' }],
  [{ note: 'G4', dur: 'e' }, { note: 'G4', dur: 'e' }, { note: 'G4', dur: 'e' }],

  // 16-20: Building complexity
  [{ note: 'G4', dur: 'e' }, { note: 'B4', dur: 'e' }, { note: 'C5', dur: 'e' }],
  [{ note: 'B4', dur: 'e' }, { note: 'C5', dur: 'e' }, { note: 'B4', dur: 'e' }, { note: 'C5', dur: 'e' }],
  [{ note: 'E5', dur: 'e' }, { note: 'F5', dur: 'e' }, { note: 'E5', dur: 'q' }],
  [{ note: null, dur: 'h' }, { note: 'G5', dur: 'h' }],
  [{ note: 'E5', dur: 'e' }, { note: 'F5', dur: 'e' }, { note: 'E5', dur: 'e' }, { note: 'F5', dur: 'e' }, { note: 'E5', dur: 'q' }],

  // 21-25: More rhythmic variety
  [{ note: 'F5', dur: 'h' }, { note: 'E5', dur: 'h' }],
  [{ note: 'E5', dur: 'e' }, { note: 'F5', dur: 'e' }, { note: 'E5', dur: 'e' }, { note: 'F5', dur: 'e' }, { note: 'G5', dur: 'e' }, { note: 'E5', dur: 'e' }],
  [{ note: 'E5', dur: 'e' }, { note: 'F5', dur: 'e' }, { note: 'G5', dur: 'e' }, { note: 'A5', dur: 'e' }],
  [{ note: 'E5', dur: 'e' }, { note: 'F5', dur: 'e' }, { note: 'G5', dur: 'e' }, { note: 'A5', dur: 'e' }, { note: 'G5', dur: 'e' }],
  [{ note: 'E5', dur: 'e' }, { note: 'F5', dur: 'e' }, { note: 'G5', dur: 'e' }, { note: 'A5', dur: 'e' }, { note: 'B5', dur: 'e' }],

  // 26-30: Expanding range
  [{ note: 'E5', dur: 'e' }, { note: 'F5', dur: 'e' }, { note: 'G5', dur: 'e' }, { note: 'A5', dur: 'e' }, { note: 'B5', dur: 'e' }, { note: 'C6', dur: 'e' }],
  [{ note: 'C6', dur: 'e' }, { note: 'B5', dur: 'e' }, { note: 'C6', dur: 'q' }],
  [{ note: 'C6', dur: 'e' }, { note: 'B5', dur: 'e' }, { note: 'A5', dur: 'e' }, { note: 'C6', dur: 'e' }],
  [{ note: 'A5', dur: 'e' }, { note: 'G5', dur: 'e' }, { note: 'F5', dur: 'e' }],
  [{ note: 'A5', dur: 'h' }],

  // 31-35: Middle section
  [{ note: 'G5', dur: 'e' }, { note: 'F5', dur: 'e' }, { note: 'G5', dur: 'e' }, { note: 'B5', dur: 'e' }],
  [{ note: 'F5', dur: 'e' }, { note: 'G5', dur: 'e' }, { note: 'B5', dur: 'e' }, { note: 'C6', dur: 'e' }],
  [{ note: 'G5', dur: 'e' }, { note: 'G5', dur: 'e' }, { note: 'B5', dur: 'e' }],
  [{ note: 'F5', dur: 'e' }, { note: 'G5', dur: 'q' }],
  [{ note: 'G5', dur: 'e' }, { note: 'G5', dur: 'e' }],

  // 36-40: Shift to lower patterns
  [{ note: 'F5', dur: 'e' }, { note: 'G5', dur: 'e' }, { note: 'Bb5', dur: 'e' }],
  [{ note: 'F5', dur: 'e' }, { note: 'G5', dur: 'e' }, { note: 'Bb5', dur: 'e' }, { note: 'C6', dur: 'e' }],
  [{ note: 'G5', dur: 'e' }, { note: 'Bb5', dur: 'e' }, { note: 'C6', dur: 'e' }],
  [{ note: 'Bb5', dur: 'e' }, { note: 'G5', dur: 'e' }, { note: 'F5', dur: 'e' }, { note: 'G5', dur: 'e' }],
  [{ note: 'Bb5', dur: 'e' }, { note: 'G5', dur: 'q' }],

  // 41-45: Darker harmonies
  [{ note: 'Bb5', dur: 'e' }, { note: 'F5', dur: 'q' }],
  [{ note: 'C5', dur: 'e' }, { note: 'F5', dur: 'e' }, { note: 'G5', dur: 'e' }, { note: 'Bb5', dur: 'e' }, { note: 'C6', dur: 'e' }, { note: 'Bb5', dur: 'e' }],
  [{ note: 'C6', dur: 'e' }, { note: 'C6', dur: 'e' }, { note: 'C6', dur: 'e' }, { note: 'C6', dur: 'q' }],
  [{ note: 'F5', dur: 'e' }, { note: 'Bb5', dur: 'e' }, { note: 'Bb5', dur: 'e' }, { note: 'G5', dur: 'e' }],
  [{ note: 'F5', dur: 'e' }, { note: 'F5', dur: 'e' }, { note: 'G5', dur: 'e' }, { note: 'Bb5', dur: 'q' }],

  // 46-50: Building to climax
  [{ note: 'G5', dur: 'e' }, { note: 'G5', dur: 'e' }, { note: 'G5', dur: 'e' }, { note: 'G5', dur: 'e' }, { note: 'G5', dur: 'e' }, { note: 'G5', dur: 'e' }],
  [{ note: 'C6', dur: 'e' }, { note: 'Bb5', dur: 'e' }, { note: 'A5', dur: 'e' }, { note: 'G5', dur: 'e' }],
  [{ note: 'A5', dur: 'e' }, { note: 'G5', dur: 'e' }, { note: 'F5', dur: 'e' }, { note: 'E5', dur: 'e' }],
  [{ note: 'F5', dur: 'e' }, { note: 'E5', dur: 'e' }, { note: 'D5', dur: 'e' }, { note: 'C5', dur: 'e' }],
  [{ note: 'G5', dur: 'e' }, { note: 'G5', dur: 'e' }, { note: 'F5', dur: 'e' }, { note: 'G5', dur: 'e' }, { note: 'E5', dur: 'e' }],

  // 51-53: Final phrases, return to C
  [{ note: 'C5', dur: 'e' }, { note: 'C5', dur: 'e' }, { note: 'C5', dur: 'e' }, { note: 'G5', dur: 'e' }, { note: 'G5', dur: 'e' }],
  [{ note: 'C5', dur: 'e' }, { note: 'C5', dur: 'e' }, { note: 'C5', dur: 'e' }, { note: 'C5', dur: 'q' }],
  [{ note: 'G5', dur: 'h' }, { note: null, dur: 'q' }, { note: 'G5', dur: 'e' }, { note: 'F5', dur: 'e' }, { note: 'G5', dur: 'w' }],
];

const durationMap = {
  'e': '8n',
  'q': '4n',
  'h': '2n',
  'w': '1n'
};

// Voice configurations
const voiceConfigs = [
  {
    name: 'Marimba',
    color: '#e07020',
    settings: {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.2 }
    },
    octaveShift: 0
  },
  {
    name: 'Vibraphone',
    color: '#40a0d0',
    settings: {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.8, sustain: 0.2, release: 0.5 }
    },
    octaveShift: 0,
    vibrato: true
  },
  {
    name: 'Piano',
    color: '#606060',
    settings: {
      oscillator: { type: 'triangle8' },
      envelope: { attack: 0.005, decay: 0.5, sustain: 0.1, release: 0.3 }
    },
    octaveShift: -1
  },
  {
    name: 'Violin',
    color: '#a04040',
    settings: {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.1, decay: 0.2, sustain: 0.6, release: 0.3 }
    },
    octaveShift: 0,
    filter: true
  },
  {
    name: 'Flute',
    color: '#80a060',
    settings: {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.08, decay: 0.1, sustain: 0.4, release: 0.2 }
    },
    octaveShift: 1
  },
  {
    name: 'Plucked',
    color: '#a08040',
    settings: {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 }
    },
    octaveShift: -1
  }
];

const bpmSlider = document.getElementById('bpm');
const bpmValue = document.getElementById('bpm-value');
const advanceSlider = document.getElementById('advance-rate');
const advanceValue = document.getElementById('advance-value');
const voicesStatus = document.getElementById('voices-status');

const advanceLabels = ['Very Slow', 'Slow', 'Medium', 'Fast', 'Very Fast'];

bpmSlider.addEventListener('input', () => {
  const bpm = bpmSlider.value;
  bpmValue.textContent = bpm;
  Tone.Transport.bpm.value = bpm;
});

advanceSlider.addEventListener('input', () => {
  advanceValue.textContent = advanceLabels[advanceSlider.value - 1];
});

function transposeOctave(note, octaves) {
  if (!note) return null;
  const match = note.match(/([A-G]#?b?)(\d)/);
  if (!match) return note;
  const pitch = match[1];
  const octave = parseInt(match[2]) + octaves;
  return pitch + octave;
}

function updateVoicesDisplay() {
  const html = voices.map(v => {
    const phraseNum = v.currentPhrase + 1;
    const barWidth = (phraseNum / 53) * 100;
    return `<div style="margin: 8px 0;">
      <span style="color: ${v.config.color}; font-weight: bold;">${v.config.name}</span>:
      Phrase ${phraseNum}/53
      <div style="background: #333; height: 8px; width: 200px; display: inline-block; margin-left: 8px;">
        <div style="background: ${v.config.color}; height: 100%; width: ${barWidth}%;"></div>
      </div>
    </div>`;
  }).join('');
  voicesStatus.innerHTML = html;
}

class Voice {
  constructor(config, reverb, advanceRateGetter) {
    this.config = config;
    this.currentPhrase = 0;
    this.noteIndex = 0;
    this.repeatCount = 0;
    this.advanceRateGetter = advanceRateGetter;

    // Create synth
    this.synth = new Tone.Synth(config.settings);

    // Add filter for violin
    if (config.filter) {
      const filter = new Tone.Filter(2000, 'lowpass').connect(reverb);
      this.synth.connect(filter);
    } else {
      this.synth.connect(reverb);
    }

    // Add vibrato for vibraphone
    if (config.vibrato) {
      this.vibrato = new Tone.Vibrato(4, 0.1).connect(reverb);
      this.synth.disconnect();
      this.synth.connect(this.vibrato);
    }

    this.synth.volume.value = -12;
  }

  getAdvanceChance() {
    // Higher advance rate = more likely to advance to next phrase
    const rate = this.advanceRateGetter();
    const baseChance = [0.02, 0.04, 0.08, 0.15, 0.25][rate - 1];
    return baseChance;
  }

  playNext(time) {
    const phrase = phrases[this.currentPhrase];
    const noteData = phrase[this.noteIndex];

    if (noteData.note) {
      const transposedNote = transposeOctave(noteData.note, this.config.octaveShift);
      this.synth.triggerAttackRelease(transposedNote, durationMap[noteData.dur], time);
    }

    this.noteIndex++;

    // End of phrase
    if (this.noteIndex >= phrase.length) {
      this.noteIndex = 0;
      this.repeatCount++;

      // Chance to advance to next phrase
      if (this.repeatCount >= 2 && Math.random() < this.getAdvanceChance()) {
        if (this.currentPhrase < phrases.length - 1) {
          this.currentPhrase++;
          this.repeatCount = 0;
        }
      }
    }
  }

  dispose() {
    this.synth.dispose();
    if (this.vibrato) this.vibrato.dispose();
  }
}

document.getElementById('start').addEventListener('click', async () => {
  await Tone.start();

  Tone.Transport.bpm.value = bpmSlider.value;

  // Reverb for space
  const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.25 }).toDestination();

  // The Pulse - steady high C
  const pulseSynth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.05 }
  }).connect(reverb);
  pulseSynth.volume.value = -18;

  pulse = new Tone.Loop((time) => {
    pulseSynth.triggerAttackRelease('C6', '16n', time);
  }, '8n');

  // Create voices
  const getAdvanceRate = () => parseInt(advanceSlider.value);

  voices = voiceConfigs.map(config => new Voice(config, reverb, getAdvanceRate));

  // Stagger the starting phrases slightly so voices don't all start together
  voices.forEach((voice, i) => {
    voice.currentPhrase = Math.floor(i / 2); // Start first few at phrase 0, then 1, etc.
  });

  // Main loop - plays all voices
  const mainLoop = new Tone.Loop((time) => {
    voices.forEach(voice => voice.playNext(time));
  }, '8n');

  pulse.start(0);
  mainLoop.start(0);
  Tone.Transport.start();

  // Update display periodically
  updateVoicesDisplay();
  updateInterval = setInterval(updateVoicesDisplay, 500);
});

document.getElementById('stop').addEventListener('click', () => {
  Tone.Transport.stop();

  if (pulse) {
    pulse.stop();
    pulse.dispose();
    pulse = null;
  }

  voices.forEach(v => v.dispose());
  voices = [];

  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }

  voicesStatus.innerHTML = '';
});
