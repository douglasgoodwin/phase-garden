import { s, repl, rand } from "@strudel/core";
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

// Reich's tempo - brisk performance
let bpm = 220;
scheduler.setCps(bpm / 60 / 12); // 12 beats per pattern

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
    await samples("/dirt-samples/strudel.json");
    statusEl.textContent = "Samples loaded!";
    startBtn.disabled = false;
  } catch (err) {
    statusEl.textContent = "Error: " + err.message;
    loadBtn.disabled = false;
  }
});

// Reich's 12-beat pattern: X X X - X X - X - X X -
// Using mini-notation: !3 = repeat 3 times, ~ = rest
const PATTERN = "realclaps!3 ~ realclaps!2 ~ realclaps ~ realclaps!2 ~";

function buildPattern() {
  // The magic from the ICLC paper:
  // .jux() splits to stereo, applying transformation to right channel
  // .iter(12) rotates through all 12 phase positions
  // .repeatCycles(8) holds each rotation for 8 bars
  return s(mini(PATTERN))
    .n(0)
    .speed(1.3)
    .gain(rand.range(0.6, 0.9))  // Humanized velocity
    .room(0.3)
    .size(1.5)
    .jux(x => x
      .n(2)           // Different sample for right channel
      .speed(1.25)    // Slightly different pitch
      .iter(12)       // Rotate through all 12 positions
      .repeatCycles(8) // 8 bars per position
    );
}

document.getElementById("start").addEventListener("click", () => {
  scheduler.setPattern(buildPattern());
  scheduler.start();
  statusEl.textContent = "Playing... (auto-shifts through all 12 positions)";
});

document.getElementById("stop").addEventListener("click", () => {
  scheduler.stop();
  statusEl.textContent = "Stopped";
});
