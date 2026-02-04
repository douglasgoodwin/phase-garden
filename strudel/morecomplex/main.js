import { stack, s, note, repl } from "@strudel/core";
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

// 140 BPM
scheduler.setCps(140 / 60 / 4);

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
  // Use synthesized sounds only (no samples needed)

  // Pulsing hihat - high frequency sine burst
  const hihat = note(mini("c6*16"))
    .s("sine")
    .decay(0.03)
    .sustain(0)
    .gain(0.3);

  // Kick - low sine with longer decay
  const kick = note(mini("c1*16"))
    .s("sine")
    .decay(0.15)
    .sustain(0)
    .degradeBy(kickDegrade)
    .gain(0.7);

  // Snare - chord on beats 4 and 11 of 16
  const snare = note(mini("[c4,e4,g4,b4]"))
    .s("sine")
    .decay(0.1)
    .sustain(0)
    .gain(0.5)
    .struct(mini("0 0 0 1 0 0 0 0 0 0 1 0 0 0 0 0"));

  // Clap - short burst chord
  const clap = note(mini("[e5,g5,b5]*16"))
    .s("sine")
    .decay(0.05)
    .sustain(0)
    .degradeBy(clapDegrade)
    .gain(0.25);

  return stack(hihat, kick, snare, clap);
}

let patternSet = false;
let isPlaying = false;

function updatePattern() {
  if (isPlaying) {
    scheduler.setPattern(buildPattern());
  }
}

document.getElementById("start").addEventListener("click", () => {
  scheduler.setPattern(buildPattern());
  patternSet = true;
  isPlaying = true;
  scheduler.start();
});

document.getElementById("stop").addEventListener("click", () => {
  isPlaying = false;
  scheduler.stop();
});
