import { stack, s, n, repl } from "@strudel/core";
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

// 140 BPM
scheduler.setCps(140 / 60 / 4);

const statusEl = document.getElementById("status");
const loadBtn = document.getElementById("load");
const startBtn = document.getElementById("start");

// Load samples - full repo (slow but works)
loadBtn.addEventListener("click", async () => {
  loadBtn.disabled = true;
  statusEl.textContent = "Loading samples (this takes a moment)...";

  try {
    await samples("github:tidalcycles/dirt-samples");

    // Give a bit more time for samples to fully register
    await new Promise(resolve => setTimeout(resolve, 1000));

    statusEl.textContent = "Samples loaded!";
    startBtn.disabled = false;
  } catch (err) {
    statusEl.textContent = "Error loading samples: " + err.message;
    console.error(err);
    loadBtn.disabled = false;
  }
});

// Slider state
let kickDegrade = 0.74;
let clapDegrade = 0.42;

const kickSlider = document.getElementById("kick-degrade");
const kickValue = document.getElementById("kick-degrade-value");
const clapSlider = document.getElementById("clap-degrade");
const clapValue = document.getElementById("clap-degrade-value");

kickSlider.addEventListener("input", () => {
  kickDegrade = kickSlider.value / 100;
  kickValue.textContent = kickDegrade.toFixed(2);
  updatePattern();
});

clapSlider.addEventListener("input", () => {
  clapDegrade = clapSlider.value / 100;
  clapValue.textContent = clapDegrade.toFixed(2);
  updatePattern();
});

function buildPattern() {
  // Using dirt-samples: bd (kick), sd (snare), hh (hihat), cp (clap)

  // Hi-hat pattern
  const hihat = s(mini("hh*16"))
    .gain(0.5);

  // Kick with degradation
  const kick = s(mini("bd*16"))
    .degradeBy(kickDegrade)
    .gain(0.8);

  // Snare on beats 4 and 11
  const snare = s(mini("sd"))
    .struct(mini("0 0 0 1 0 0 0 0 0 0 1 0 0 0 0 0"))
    .gain(0.7);

  // Clap with degradation
  const clap = s(mini("cp*16"))
    .degradeBy(clapDegrade)
    .gain(0.5);

  return stack(hihat, kick, snare, clap);
}

let isPlaying = false;

function updatePattern() {
  if (isPlaying) {
    scheduler.setPattern(buildPattern());
  }
}

document.getElementById("start").addEventListener("click", () => {
  scheduler.setPattern(buildPattern());
  isPlaying = true;
  scheduler.start();
});

document.getElementById("stop").addEventListener("click", () => {
  isPlaying = false;
  scheduler.stop();
});
