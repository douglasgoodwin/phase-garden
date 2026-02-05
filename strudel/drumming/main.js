// Drumming (1970-71) by Steve Reich
// Four parts: bongos, marimbas, glockenspiels, all combined
// Uses Strudel's pattern language for interlocking rhythms

import { stack, note, s, n, repl } from "@strudel/core";
import { mini } from "@strudel/mini";
import {
  initAudioOnFirstClick,
  getAudioContext,
  webaudioOutput,
  registerSynthSounds,
  samples,
} from "@strudel/webaudio";

initAudioOnFirstClick();
registerSynthSounds();

const ctx = getAudioContext();
const { scheduler } = repl({
  defaultOutput: webaudioOutput,
  getTime: () => ctx.currentTime,
});

// Reich's basic 12-beat rhythmic pattern:
// X . . X . . X . X . X .  (positions 1, 4, 7, 9, 11)
const BASIC_PATTERN = "x ~ ~ x ~ ~ x ~ x ~ x ~";

const bpmSlider = document.getElementById('bpm');
const bpmValue = document.getElementById('bpm-value');
const partSelect = document.getElementById('part');
const densitySlider = document.getElementById('density');
const densityValue = document.getElementById('density-value');
const status = document.getElementById('status');
const loadBtn = document.getElementById('load');
const startBtn = document.getElementById('start');

let samplesLoaded = false;

// Load samples from local dirt-samples folder
loadBtn.addEventListener('click', async () => {
  loadBtn.disabled = true;
  status.textContent = 'Loading samples...';

  try {
    // Load from local dirt-samples folder
    await samples('/dirt-samples/strudel.json');

    samplesLoaded = true;
    status.textContent = 'Samples loaded! Click Start.';
    startBtn.disabled = false;
  } catch (err) {
    status.textContent = 'Error loading samples: ' + err.message;
    console.error(err);
    loadBtn.disabled = false;
  }
});

function updateBpm() {
  const bpm = parseInt(bpmSlider.value);
  bpmValue.textContent = bpm;
  // 12 eighth notes per pattern
  scheduler.setCps(bpm / 60 / 12);
}

bpmSlider.addEventListener('input', updateBpm);

densitySlider.addEventListener('input', () => {
  densityValue.textContent = densitySlider.value;
  if (scheduler.pattern) {
    scheduler.setPattern(buildPattern());
  }
});

partSelect.addEventListener('change', () => {
  if (scheduler.pattern) {
    scheduler.setPattern(buildPattern());
  }
});

// Part 1: Tuned drums using perc samples
// Reich used 4 tuned bongos - we use perc samples pitched to different levels
function buildBongos() {
  const density = 1 - parseInt(densitySlider.value) / 100;

  // Use perc samples with speed to create 4 tuned pitches
  return stack(
    // Low drum
    s('perc').n(0).struct(mini(BASIC_PATTERN)).late(0/12).speed(0.8).gain(0.7).degradeBy(density).room(0.25).size(1.5),
    // Mid-low drum
    s('perc').n(1).struct(mini(BASIC_PATTERN)).late(1/12).speed(1.0).gain(0.65).degradeBy(density).room(0.25).size(1.5),
    // Mid-high drum
    s('perc').n(2).struct(mini(BASIC_PATTERN)).late(3/12).speed(1.2).gain(0.6).degradeBy(density).room(0.25).size(1.5),
    // High drum
    s('perc').n(4).struct(mini(BASIC_PATTERN)).late(6/12).speed(1.4).gain(0.55).degradeBy(density).room(0.25).size(1.5),
  );
}

// Part 2: Marimbas - wooden, resonant
function buildMarimbas() {
  const density = 1 - parseInt(densitySlider.value) / 100;

  return stack(
    note(mini('f3')).struct(mini(BASIC_PATTERN)).late(0/12).s('sawtooth').degradeBy(density).attack(0.001).decay(0.5).sustain(0.1).release(0.3).gain(0.15).lpf(2000).room(0.3).size(2),
    note(mini('ab3')).struct(mini(BASIC_PATTERN)).late(2/12).s('sawtooth').degradeBy(density).attack(0.001).decay(0.5).sustain(0.1).release(0.3).gain(0.15).lpf(2000).room(0.3).size(2),
    note(mini('c4')).struct(mini(BASIC_PATTERN)).late(4/12).s('sawtooth').degradeBy(density).attack(0.001).decay(0.5).sustain(0.1).release(0.3).gain(0.15).lpf(2000).room(0.3).size(2),
    note(mini('eb4')).struct(mini(BASIC_PATTERN)).late(5/12).s('sawtooth').degradeBy(density).attack(0.001).decay(0.5).sustain(0.1).release(0.3).gain(0.15).lpf(2000).room(0.3).size(2),
    note(mini('f4')).struct(mini(BASIC_PATTERN)).late(7/12).s('sawtooth').degradeBy(density).attack(0.001).decay(0.5).sustain(0.1).release(0.3).gain(0.15).lpf(2000).room(0.3).size(2),
    note(mini('ab4')).struct(mini(BASIC_PATTERN)).late(9/12).s('sawtooth').degradeBy(density).attack(0.001).decay(0.5).sustain(0.1).release(0.3).gain(0.15).lpf(2000).room(0.3).size(2),
  );
}

// Part 3: Glockenspiels - bright, ringing sine tones
function buildGlockenspiels() {
  const density = 1 - parseInt(densitySlider.value) / 100;

  return stack(
    note(mini('f5')).struct(mini(BASIC_PATTERN)).late(0/12).s('sine').degradeBy(density).attack(0.001).decay(0.8).sustain(0.2).release(0.5).gain(0.12).room(0.4).size(3),
    note(mini('ab5')).struct(mini(BASIC_PATTERN)).late(2/12).s('sine').degradeBy(density).attack(0.001).decay(0.8).sustain(0.2).release(0.5).gain(0.12).room(0.4).size(3),
    note(mini('bb5')).struct(mini(BASIC_PATTERN)).late(4/12).s('sine').degradeBy(density).attack(0.001).decay(0.8).sustain(0.2).release(0.5).gain(0.12).room(0.4).size(3),
    note(mini('c6')).struct(mini(BASIC_PATTERN)).late(6/12).s('sine').degradeBy(density).attack(0.001).decay(0.8).sustain(0.2).release(0.5).gain(0.12).room(0.4).size(3),
    note(mini('db6')).struct(mini(BASIC_PATTERN)).late(8/12).s('sine').degradeBy(density).attack(0.001).decay(0.8).sustain(0.2).release(0.5).gain(0.12).room(0.4).size(3),
  );
}

// Part 4: All combined
function buildAll() {
  return stack(
    buildBongos(),
    buildMarimbas(),
    buildGlockenspiels()
  );
}

function buildPattern() {
  const part = partSelect.value;

  switch (part) {
    case '1': return buildBongos();
    case '2': return buildMarimbas();
    case '3': return buildGlockenspiels();
    case '4': return buildAll();
    default: return buildAll();
  }
}

document.getElementById('start').addEventListener('click', () => {
  updateBpm();
  scheduler.setPattern(buildPattern());
  scheduler.start();
  status.textContent = 'Playing...';
});

document.getElementById('stop').addEventListener('click', () => {
  scheduler.stop();
  status.textContent = samplesLoaded ? 'Stopped' : 'Click "Load Samples" to begin';
});
