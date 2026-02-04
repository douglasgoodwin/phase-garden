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

// Slow tempo for ambient vocal textures
scheduler.setCps(0.15);

const statusEl = document.getElementById("status");
const loadBtn = document.getElementById("load");
const startBtn = document.getElementById("start");

loadBtn.addEventListener("click", async () => {
  loadBtn.disabled = true;
  statusEl.textContent = "Loading samples (this takes a moment)...";

  try {
    await samples("github:tidalcycles/dirt-samples");
    await new Promise(resolve => setTimeout(resolve, 1000));

    statusEl.textContent = "Samples loaded!";
    startBtn.disabled = false;
  } catch (err) {
    statusEl.textContent = "Error loading samples: " + err.message;
    console.error(err);
    loadBtn.disabled = false;
  }
});

function buildPattern() {
  // Ambient texture using samples we know exist (bd, sd, hh, cp from drums)
  // Plus trying some melodic samples

  // Using hihats as shimmery texture
  const shimmer = s(mini("hh*8"))
    .slow(7)
    .gain(0.3)
    .room(0.8)
    .size(5);

  // Sparse kicks as low pulse
  const pulse = s(mini("bd ~ ~ bd ~ ~ ~ ~"))
    .slow(11)
    .gain(0.5)
    .room(0.6)
    .size(4);

  // Claps as accents
  const accent = s(mini("cp"))
    .slow(13)
    .gain(0.3)
    .room(0.7)
    .size(5)
    .degradeBy(0.5);

  // Snare texture
  const texture = s(mini("sd ~ sd ~"))
    .slow(17)
    .gain(0.25)
    .room(0.8)
    .size(6);

  // Try arpy (arpeggio samples - likely exists)
  const arp = s(mini("arpy"))
    .n(mini("0 2 4 7"))
    .slow(5)
    .gain(0.4)
    .room(0.6)
    .size(4);

  return stack(shimmer, pulse, accent, texture, arp);
}

let isPlaying = false;

document.getElementById("start").addEventListener("click", () => {
  scheduler.setPattern(buildPattern());
  isPlaying = true;
  scheduler.start();
});

document.getElementById("stop").addEventListener("click", () => {
  isPlaying = false;
  scheduler.stop();
});
