import { stack, s, repl } from "@strudel/core";
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

// Reich's tempo was around 160-220 BPM, often performed briskly
// 12 beats per pattern, so cps = bpm/60/12
let bpm = 220;
scheduler.setCps(bpm / 60 / 12);

const statusEl = document.getElementById("status");
const loadBtn = document.getElementById("load");
const startBtn = document.getElementById("start");
const bpmSlider = document.getElementById("bpm");
const bpmValue = document.getElementById("bpm-value");

bpmSlider.addEventListener("input", () => {
  bpm = parseInt(bpmSlider.value);
  bpmValue.textContent = bpm;
  scheduler.setCps(bpm / 60 / 12);
});

loadBtn.addEventListener("click", async () => {
  loadBtn.disabled = true;
  statusEl.textContent = "Loading samples...";

  try {
    // Load from local dirt-samples folder
    await samples("/dirt-samples/strudel.json");

    statusEl.textContent = "Samples loaded!";
    startBtn.disabled = false;
  } catch (err) {
    statusEl.textContent = "Error: " + err.message;
    loadBtn.disabled = false;
  }
});

// Reich's 12-beat pattern: X X X - X X - X - X X -
// As array for rotation: 1=clap, 0=rest
const basePattern = [1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0];

// Convert pattern array to mini notation
function patternToMini(arr, sound) {
  return arr.map(x => x ? sound : "~").join(" ");
}

// Rotate pattern by n positions (shift left)
function rotatePattern(arr, n) {
  const shift = n % arr.length;
  return [...arr.slice(shift), ...arr.slice(0, shift)];
}

// Current shift position (0-11, wraps around)
let shiftPosition = 0;
let barCount = 0;
const barsPerShift = 8; // Shift every 8 bars

function buildPattern() {
  // Fixed clapper - panned left, using realclaps samples
  const fixed = s(mini(patternToMini(basePattern, "realclaps")))
    .n(0)
    .speed(1.3)  // Pitch up
    .gain(0.75)
    .pan(0.3)
    // Per-note humanization: timing variation and velocity variation
    .late(mini("0 0.004 0.002 0 0.006 0.001 0 0.003 0 0.005 0.002 0"))
    .room(0.3)
    .size(1.5);

  // Shifting clapper - panned right, different realclaps sample
  const shiftedArr = rotatePattern(basePattern, shiftPosition);
  const shifting = s(mini(patternToMini(shiftedArr, "realclaps")))
    .n(2)  // Different clap sample for distinction
    .speed(1.25)  // Pitch up (slightly different for variety)
    .gain(0.75)
    .pan(0.7)
    // Different humanization pattern so they don't lock together
    .late(mini("0.003 0 0.005 0.001 0 0.004 0.002 0 0.006 0 0.003 0.001"))
    .room(0.3)
    .size(1.5);

  return stack(fixed, shifting);
}

// Update pattern periodically to handle shifting
function scheduleShift() {
  if (!isPlaying) return;

  barCount++;
  if (barCount >= barsPerShift) {
    barCount = 0;
    shiftPosition = (shiftPosition + 1) % 12;
    scheduler.setPattern(buildPattern());

    // Update status to show current shift
    if (shiftPosition === 0) {
      statusEl.textContent = "Back in unison!";
    } else {
      statusEl.textContent = `Shift: ${shiftPosition}/12`;
    }
  }
}

// Calculate bar duration and set up interval
function getBarDuration() {
  // 12 beats per pattern, at current BPM
  return (60 / bpm) * 12 * 1000; // in milliseconds
}

let shiftInterval = null;

let isPlaying = false;

document.getElementById("start").addEventListener("click", () => {
  // Reset to beginning
  shiftPosition = 0;
  barCount = 0;

  scheduler.setPattern(buildPattern());
  isPlaying = true;
  scheduler.start();

  statusEl.textContent = "In unison (shift 0/12)";

  // Set up interval to check for shifts
  if (shiftInterval) clearInterval(shiftInterval);
  shiftInterval = setInterval(scheduleShift, getBarDuration());
});

document.getElementById("stop").addEventListener("click", () => {
  isPlaying = false;
  scheduler.stop();
  if (shiftInterval) {
    clearInterval(shiftInterval);
    shiftInterval = null;
  }
  statusEl.textContent = "Stopped";
});

// Update interval when BPM changes
bpmSlider.addEventListener("input", () => {
  if (shiftInterval && isPlaying) {
    clearInterval(shiftInterval);
    shiftInterval = setInterval(scheduleShift, getBarDuration());
  }
});
