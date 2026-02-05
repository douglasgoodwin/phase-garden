// Piano Phase (1967) by Steve Reich - Strudel version
// Two pianos play the same 12-note pattern
// Piano 2 runs slightly faster, naturally drifting ahead over time

import { stack, note, repl } from "@strudel/core";
import { mini } from "@strudel/mini";
import {
  initAudioOnFirstClick,
  getAudioContext,
  webaudioOutput,
  registerSynthSounds,
} from "@strudel/webaudio";

initAudioOnFirstClick();
registerSynthSounds();

const ctx = getAudioContext();
const { scheduler } = repl({
  defaultOutput: webaudioOutput,
  getTime: () => ctx.currentTime,
});

// Reich's original 12-note pattern
const PATTERN = "e4 f#4 b4 c#5 d5 f#4 e4 c#5 b4 f#4 d5 c#5";

const bpmSlider = document.getElementById('bpm');
const bpmValue = document.getElementById('bpm-value');
const driftSlider = document.getElementById('drift');
const driftValue = document.getElementById('drift-value');
const status = document.getElementById('status');

function updateCps() {
  const bpm = parseInt(bpmSlider.value);
  // 12 notes per pattern, each note is an 8th note
  scheduler.setCps(bpm / 60 / 12);
}

bpmSlider.addEventListener('input', () => {
  bpmValue.textContent = bpmSlider.value;
  updateCps();
});

driftSlider.addEventListener('input', () => {
  const drift = parseInt(driftSlider.value) / 10;
  driftValue.textContent = drift.toFixed(1);
  if (scheduler.pattern) {
    scheduler.setPattern(buildPattern());
  }
});

function buildPattern() {
  const drift = parseInt(driftSlider.value) / 10 / 100; // Convert to decimal (0.5% = 0.005)

  // Piano 1 - fixed tempo, panned left
  // Using FM-like sound with sine + longer decay
  const piano1 = note(mini(PATTERN))
    .s('sine')
    .attack(0.001)
    .decay(1.0)
    .sustain(0.1)
    .release(1.2)
    .gain(0.4)
    .pan(0.3)
    .room(0.3)
    .size(2);

  // Piano 2 - slightly faster (drifts ahead), panned right
  // The (1 - drift) makes it complete the cycle faster, so it pulls ahead
  const piano2 = note(mini(PATTERN))
    .slow(1 - drift)
    .s('sine')
    .attack(0.001)
    .decay(1.0)
    .sustain(0.1)
    .release(1.2)
    .gain(0.4)
    .pan(0.7)
    .room(0.3)
    .size(2);

  return stack(piano1, piano2);
}

document.getElementById('start').addEventListener('click', () => {
  updateCps();
  scheduler.setPattern(buildPattern());
  scheduler.start();
  status.textContent = 'Playing... Piano 2 gradually drifts ahead';
});

document.getElementById('stop').addEventListener('click', () => {
  scheduler.stop();
  status.textContent = '';
});
