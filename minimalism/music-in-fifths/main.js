import * as Tone from 'tone';

// Music in Fifths (1969) by Philip Glass
// Two voices play in parallel fifths (7 semitones apart)
// Uses an additive/subtractive process: the melodic figure gradually
// expands by adding notes, then contracts back

let loop = null;
let synths = [];

// The melodic figure - based on Glass's original pattern
// This expands and contracts through the additive process
const fullPattern = [
  'E4', 'F4', 'E4', 'D4', 'C4', 'D4', 'E4', 'F4',
  'E4', 'D4', 'C4', 'B3', 'C4', 'D4', 'E4', 'F4',
  'G4', 'F4', 'E4', 'D4', 'C4', 'D4', 'E4', 'D4'
];

let currentLength = 2; // Start with just 2 notes
let expanding = true;
let noteIndex = 0;
let lastExpansionTime = 0;

const bpmSlider = document.getElementById('bpm');
const bpmValue = document.getElementById('bpm-value');
const cycleSlider = document.getElementById('cycle-time');
const cycleValue = document.getElementById('cycle-value');
const status = document.getElementById('status');

bpmSlider.addEventListener('input', () => {
  const bpm = bpmSlider.value;
  bpmValue.textContent = bpm;
  Tone.Transport.bpm.value = bpm;
});

cycleSlider.addEventListener('input', () => {
  cycleValue.textContent = cycleSlider.value;
});

function transposeNote(note, semitones) {
  // Transpose a note by semitones
  const freq = Tone.Frequency(note).toFrequency();
  const newFreq = freq * Math.pow(2, semitones / 12);
  return Tone.Frequency(newFreq).toNote();
}

function updateStatus() {
  const direction = expanding ? 'expanding' : 'contracting';
  status.textContent = `Pattern length: ${currentLength}/${fullPattern.length} (${direction})`;
}

document.getElementById('start').addEventListener('click', async () => {
  await Tone.start();

  // Reset state
  currentLength = 2;
  expanding = true;
  noteIndex = 0;
  lastExpansionTime = Tone.now();

  Tone.Transport.bpm.value = bpmSlider.value;

  // Subtle reverb - Glass's original is quite dry
  const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.2 }).toDestination();

  // Two synths for the two voices - organ-like tone
  const synthSettings = {
    oscillator: { type: 'triangle' },
    envelope: {
      attack: 0.02,
      decay: 0.1,
      sustain: 0.3,
      release: 0.1
    }
  };

  // Lower voice
  const lowerSynth = new Tone.Synth(synthSettings).connect(reverb);
  lowerSynth.volume.value = -6;

  // Upper voice (perfect fifth = 7 semitones higher)
  const upperSynth = new Tone.Synth(synthSettings).connect(reverb);
  upperSynth.volume.value = -6;

  synths = [lowerSynth, upperSynth];

  // Calculate how often to expand/contract based on cycle time
  const getCycleInterval = () => {
    const cycleSeconds = parseInt(cycleSlider.value);
    // Full cycle = expand from 2 to full length, then back to 2
    // That's (fullPattern.length - 2) * 2 steps
    const totalSteps = (fullPattern.length - 2) * 2;
    return cycleSeconds / totalSteps;
  };

  loop = new Tone.Loop((time) => {
    // Get current pattern (subset of full pattern)
    const currentPattern = fullPattern.slice(0, currentLength);

    // Get current note
    const lowerNote = currentPattern[noteIndex % currentPattern.length];
    const upperNote = transposeNote(lowerNote, 7); // Perfect fifth up

    // Play both voices
    lowerSynth.triggerAttackRelease(lowerNote, '16n', time);
    upperSynth.triggerAttackRelease(upperNote, '16n', time);

    noteIndex++;

    // Check if we should expand or contract the pattern
    const now = Tone.now();
    const cycleInterval = getCycleInterval();

    if (now - lastExpansionTime >= cycleInterval) {
      lastExpansionTime = now;

      if (expanding) {
        if (currentLength < fullPattern.length) {
          currentLength++;
        } else {
          expanding = false;
          currentLength--;
        }
      } else {
        if (currentLength > 2) {
          currentLength--;
        } else {
          expanding = true;
          currentLength++;
        }
      }

      // Reset note index when pattern changes to stay musical
      noteIndex = 0;
      updateStatus();
    }
  }, '8n');

  loop.start(0);
  Tone.Transport.start();
  updateStatus();
});

document.getElementById('stop').addEventListener('click', () => {
  Tone.Transport.stop();
  if (loop) {
    loop.stop();
    loop.dispose();
    loop = null;
  }
  synths.forEach(synth => synth.dispose());
  synths = [];
  status.textContent = '';
});
