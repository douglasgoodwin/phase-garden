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

// Reich's tempo was around 160-180 BPM
// 12 beats per pattern, so cps = bpm/60/12
let bpm = 168;
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
    await samples("github:tidalcycles/dirt-samples");
    await new Promise(resolve => setTimeout(resolve, 1000));

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
  // Fixed clapper - lower pitch, panned left
  // Uses cp:0 (or we simulate with different n)
  const fixed = s(mini(patternToMini(basePattern, "cp")))
    .n(0)
    .gain(0.65)
    .pan(0.25)
    // Slight random timing variation for human feel
    .late(Math.random() * 0.008);

  // Shifting clapper - higher pitch variant, panned right
  const shiftedArr = rotatePattern(basePattern, shiftPosition);
  const shifting = s(mini(patternToMini(shiftedArr, "cp")))
    .n(1)  // Different clap sample
    .gain(0.65)
    .pan(0.75)
    // Slightly different timing imperfection
    .late(Math.random() * 0.01);

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
