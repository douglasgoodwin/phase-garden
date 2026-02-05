import * as Tone from 'tone';

// Piano Phase (1967) by Steve Reich
// Two pianos play the same 12-note pattern
// One piano gradually speeds up until it's one note ahead,
// then they lock in, then it speeds up again, repeating
// until they're back in unison (12 phase positions)

let piano1 = null;
let piano2 = null;
let seq1 = null;
let seq2 = null;
let phaseLoop = null;
let updateInterval = null;

// Reich's original 12-note pattern (E minor pentatonic region)
const pattern = ['E4', 'F#4', 'B4', 'C#5', 'D5', 'F#4', 'E4', 'C#5', 'B4', 'F#4', 'D5', 'C#5'];

let currentPhase = 0; // 0-11, which note piano 2 is ahead by
let isPhasing = false; // true when piano 2 is actively speeding up
let phaseProgress = 0; // 0-1, progress through current phase transition

const bpmSlider = document.getElementById('bpm');
const bpmValue = document.getElementById('bpm-value');
const phaseSlider = document.getElementById('phase-time');
const phaseValue = document.getElementById('phase-value');
const status = document.getElementById('status');
const voicesStatus = document.getElementById('voices-status');

bpmSlider.addEventListener('input', () => {
  const bpm = bpmSlider.value;
  bpmValue.textContent = bpm;
  Tone.Transport.bpm.value = bpm;
});

phaseSlider.addEventListener('input', () => {
  phaseValue.textContent = phaseSlider.value;
});

function updateDisplay() {
  const phaseText = currentPhase === 0 ? 'In unison' : `Phase ${currentPhase}/12`;
  const stateText = isPhasing ? ' (phasing...)' : ' (locked)';
  status.textContent = phaseText + stateText;

  // Progress bars for both pianos
  const piano1Pos = 0;
  const piano2Pos = (currentPhase + (isPhasing ? phaseProgress : 0)) / 12 * 100;

  voicesStatus.innerHTML = `
    <div style="margin: 12px 0;">
      <div style="margin: 8px 0;">
        <span style="color: #4080c0; font-weight: bold;">Piano 1</span>: Fixed tempo
        <div style="background: #333; height: 8px; width: 200px; display: inline-block; margin-left: 8px; position: relative;">
          <div style="background: #4080c0; height: 100%; width: 8px; position: absolute; left: ${piano1Pos}%;"></div>
        </div>
      </div>
      <div style="margin: 8px 0;">
        <span style="color: #c04040; font-weight: bold;">Piano 2</span>: ${isPhasing ? 'Accelerating' : 'Locked'}
        <div style="background: #333; height: 8px; width: 200px; display: inline-block; margin-left: 8px; position: relative;">
          <div style="background: #c04040; height: 100%; width: 8px; position: absolute; left: ${piano2Pos}%;"></div>
        </div>
      </div>
    </div>
  `;
}

document.getElementById('start').addEventListener('click', async () => {
  await Tone.start();

  currentPhase = 0;
  isPhasing = false;
  phaseProgress = 0;

  const baseBpm = parseInt(bpmSlider.value);
  Tone.Transport.bpm.value = baseBpm;

  // Reverb for concert hall feel (must await generation)
  const reverb = new Tone.Reverb({ decay: 2.5, wet: 0.25 }).toDestination();
  await reverb.generate();

  // Piano-like FM synth settings
  const pianoSettings = {
    harmonicity: 3,
    modulationIndex: 1.5,
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.001,
      decay: 1.2,
      sustain: 0.1,
      release: 1.5
    },
    modulation: { type: 'sine' },
    modulationEnvelope: {
      attack: 0.001,
      decay: 0.5,
      sustain: 0.2,
      release: 0.8
    }
  };

  // Piano 1 - left channel, fixed tempo
  const panner1 = new Tone.Panner(-0.5).connect(reverb);
  piano1 = new Tone.FMSynth(pianoSettings).connect(panner1);
  piano1.volume.value = -10;

  // Piano 2 - right channel, phases ahead (slightly different timbre)
  const panner2 = new Tone.Panner(0.5).connect(reverb);
  piano2 = new Tone.FMSynth({
    ...pianoSettings,
    harmonicity: 3.01,  // Slight detune for stereo interest
  }).connect(panner2);
  piano2.volume.value = -10;

  // Note indices for each piano
  let index1 = 0;
  let index2 = 0;

  // Piano 1 sequence - always at base tempo
  seq1 = new Tone.Sequence((time, note) => {
    piano1.triggerAttackRelease(note, '16n', time);
  }, pattern, '8n');
  seq1.loop = true;

  // Piano 2 - we'll control its timing manually for smooth phasing
  let lastTime2 = 0;
  let noteInterval2 = 60 / baseBpm / 2; // 8th note interval in seconds

  seq2 = new Tone.Loop((time) => {
    const note = pattern[index2 % pattern.length];
    piano2.triggerAttackRelease(note, '16n', time);
    index2++;
  }, '8n');
  seq2.loop = true;

  // Phase control loop - runs frequently to manage phasing
  let lockTime = 0;
  const lockDuration = 4; // seconds to stay locked before phasing again

  // Use setInterval instead of Tone.Loop to avoid scheduling conflicts
  // when changing playbackRate
  let phaseIntervalId = setInterval(() => {
    if (Tone.Transport.state !== 'started') return;

    const phaseTime = parseInt(phaseSlider.value);

    if (!isPhasing) {
      // We're locked - wait, then start phasing
      lockTime += 0.1;
      if (lockTime >= lockDuration) {
        isPhasing = true;
        lockTime = 0;
        phaseProgress = 0;
      }
    } else {
      // We're phasing - gradually speed up piano 2
      phaseProgress += 0.1 / phaseTime;

      // Speed up piano 2's playback rate
      const speedup = 1 + (phaseProgress * 0.1); // Up to 10% faster
      seq2.playbackRate = speedup;

      if (phaseProgress >= 1) {
        // Completed one phase shift
        currentPhase = (currentPhase + 1) % 12;
        isPhasing = false;
        phaseProgress = 0;
        seq2.playbackRate = 1; // Back to normal speed

        if (currentPhase === 0) {
          status.textContent = 'Back in unison! Cycle complete.';
        }
      }
    }
  }, 100);

  // Store interval ID for cleanup
  phaseLoop = { stop: () => clearInterval(phaseIntervalId), dispose: () => clearInterval(phaseIntervalId) };

  seq1.start(0);
  seq2.start(0);
  // phaseLoop is a setInterval, starts automatically
  Tone.Transport.start();

  updateDisplay();
  updateInterval = setInterval(updateDisplay, 100);
});

document.getElementById('stop').addEventListener('click', () => {
  Tone.Transport.stop();

  if (seq1) { seq1.stop(); seq1.dispose(); seq1 = null; }
  if (seq2) { seq2.stop(); seq2.dispose(); seq2 = null; }
  if (phaseLoop) { phaseLoop.stop(); phaseLoop.dispose(); phaseLoop = null; }
  if (piano1) { piano1.dispose(); piano1 = null; }
  if (piano2) { piano2.dispose(); piano2 = null; }

  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }

  status.textContent = '';
  voicesStatus.innerHTML = '';
});
