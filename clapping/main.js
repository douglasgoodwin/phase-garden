import * as Tone from 'tone';

// Reich's 12-beat pattern: X X X - X X - X - X X -
// 1 = clap, 0 = rest
const basePattern = [1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0];

// State
let shiftPosition = 0;
let barCount = 0;
let barsPerShift = 8;
let humanizeAmount = 0.02; // 20ms default

// UI elements
const statusEl = document.getElementById('status');
const bpmSlider = document.getElementById('bpm');
const bpmValue = document.getElementById('bpm-value');
const barsSlider = document.getElementById('bars-per-shift');
const barsValue = document.getElementById('bars-value');
const humanizeSlider = document.getElementById('humanize');
const humanizeValue = document.getElementById('humanize-value');

// Rotate pattern by n positions (shift left)
function rotatePattern(arr, n) {
  const shift = n % arr.length;
  return [...arr.slice(shift), ...arr.slice(0, shift)];
}

// Bell 1 - small bell (left)
const panner1 = new Tone.Panner(-0.9).toDestination();
const clapper1 = new Tone.FMSynth({
  harmonicity: 10,
  modulationIndex: 3,
  oscillator: { type: 'sine' },
  envelope: {
    attack: 0.001,
    decay: 1.2,
    sustain: 0,
    release: 0.4
  },
  modulation: { type: 'square' },
  modulationEnvelope: {
    attack: 0.001,
    decay: 0.4,
    sustain: 0,
    release: 0.4
  }
}).connect(panner1);
clapper1.volume.value = -12;

// Bell 2 - higher bell (brighter, smaller)
const panner2 = new Tone.Panner(0.9).toDestination();
const clapper2 = new Tone.FMSynth({
  harmonicity: 10,
  modulationIndex: 3,
  oscillator: { type: 'sine' },
  envelope: {
    attack: 0.001,
    decay: 1.2,
    sustain: 0,
    release: 0.4
  },
  modulation: { type: 'square' },
  modulationEnvelope: {
    attack: 0.001,
    decay: 0.4,
    sustain: 0,
    release: 0.4
  }
}).connect(panner2);
clapper2.volume.value = -12;

// Sequences for the two clappers
let seq1 = null;
let seq2 = null;

function createSequences() {
  // Dispose old sequences
  if (seq1) seq1.dispose();
  if (seq2) seq2.dispose();

  const pattern1 = basePattern;
  const pattern2 = rotatePattern(basePattern, shiftPosition);

  // Bell 1 - fixed pattern (same pitch as bell 2 - E6)
  seq1 = new Tone.Sequence((time, note) => {
    if (note === 1) {
      // Add humanize
      const humanize = (Math.random() - 0.5) * 2 * humanizeAmount;
      clapper1.triggerAttackRelease('E6', '8n', time + humanize);
    }
  }, pattern1, '8n');

  // Bell 2 - shifting pattern (higher bell - E6)
  seq2 = new Tone.Sequence((time, note) => {
    if (note === 1) {
      // Add humanize (slightly different feel)
      const humanize = (Math.random() - 0.5) * 2 * humanizeAmount;
      clapper2.triggerAttackRelease('E6', '8n', time + humanize);
    }
  }, pattern2, '8n');

  seq1.loop = true;
  seq2.loop = true;

  if (Tone.Transport.state === 'started') {
    seq1.start(0);
    seq2.start(0);
  }
}

// Schedule bar counting and shifts
let barEvent = null;

function setupBarCounter() {
  if (barEvent !== null) {
    Tone.Transport.clear(barEvent);
  }

  // Schedule a callback every 12 eighth notes (one full pattern = one bar)
  barEvent = Tone.Transport.scheduleRepeat((time) => {
    barCount++;

    if (barCount >= barsPerShift) {
      barCount = 0;
      shiftPosition = (shiftPosition + 1) % 12;

      // Update sequences with new shift
      Tone.Draw.schedule(() => {
        createSequences();
        if (shiftPosition === 0) {
          statusEl.textContent = 'Back in unison!';
        } else {
          statusEl.textContent = `Shift: ${shiftPosition}/12`;
        }
      }, time);
    }
  }, '1:0:0'); // Every 12 eighth notes = 1 bar in 12/8
}

// BPM slider
bpmSlider.addEventListener('input', () => {
  const bpm = parseInt(bpmSlider.value);
  bpmValue.textContent = bpm;
  Tone.Transport.bpm.value = bpm;
});

// Bars per shift slider
barsSlider.addEventListener('input', () => {
  barsPerShift = parseInt(barsSlider.value);
  barsValue.textContent = barsPerShift;
});

// Humanize slider
humanizeSlider.addEventListener('input', () => {
  humanizeAmount = parseInt(humanizeSlider.value) / 1000;
  humanizeValue.textContent = humanizeSlider.value;
});

// Start button
document.getElementById('start').addEventListener('click', async () => {
  await Tone.start();

  // Reset state
  shiftPosition = 0;
  barCount = 0;

  Tone.Transport.bpm.value = parseInt(bpmSlider.value);
  Tone.Transport.timeSignature = [12, 8];

  createSequences();
  setupBarCounter();

  seq1.start(0);
  seq2.start(0);
  Tone.Transport.start();

  statusEl.textContent = 'In unison (shift 0/12)';
});

// Stop button
document.getElementById('stop').addEventListener('click', () => {
  Tone.Transport.stop();
  if (seq1) seq1.stop();
  if (seq2) seq2.stop();
  statusEl.textContent = 'Stopped';
});
