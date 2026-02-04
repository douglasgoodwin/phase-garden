// main.js
import { stack, note, repl } from "@strudel/core";
import { mini } from "@strudel/mini";
import {
  initAudioOnFirstClick,
  getAudioContext,
  webaudioOutput,
  registerSynthSounds,
} from "@strudel/webaudio";

/*
  Assumes your HTML contains:
    <button id="start">Start</button>
    <button id="stop">Stop</button>
*/

initAudioOnFirstClick();
registerSynthSounds();

const ctx = getAudioContext();
const { scheduler } = repl({
  defaultOutput: webaudioOutput,
  getTime: () => ctx.currentTime,
});

// Make 1 cycle = 1 second so slow(L) means an L-second loop.
scheduler.setCps(1);

// Your 14 loop lengths (seconds) and note-figure content (D major).
// Notes in each figure play in sequence across the loop, then repeat.
const VOICES = [
  { len: 23.5, notes: "d3" },
  { len: 25.5, notes: "d4" },
  { len: 27.375, notes: "b3" },
  { len: 29.0, notes: "f#4" },

  { len: 24.25, notes: "a3 f#4" },
  { len: 26.5, notes: "a3 c#4" },
  { len: 28.25, notes: "c#4 e4" },

  { len: 25.0, notes: "e3 g3 b3" },
  { len: 27.0, notes: "f#3 a3 d4" },
  { len: 28.625, notes: "g3 d4 a4" },
  { len: 29.9375, notes: "b3 e4 g4" },

  { len: 26.0, notes: "g3 b3 d4 f#4" },
  { len: 27.75, notes: "e4 g4 b4 d5" },
  { len: 29.5, notes: "d3 a3 f#4 d5" },
];

// Match Tone.js envelope and reverb settings
function voicePattern({ len, notes }) {
  const n = notes.trim().split(/\s+/).length;

  // Gain scaled for 14 voices (Tone.js used -12dB per voice)
  const perVoiceGain = 0.05 / Math.max(1, Math.sqrt(n));

  return note(mini(notes))
    .slow(len)
    .s("sine")
    .attack(0.8)      // Tone.js: attack 0.8
    .decay(0.5)       // Tone.js: decay 0.5
    .sustain(0.6)     // Tone.js: sustain 0.6
    .release(2.0)     // Tone.js: release 2.0
    .gain(perVoiceGain)
    .room(0.4)        // Tone.js: reverb wet 0.4
    .size(4);         // Tone.js: reverb decay 4
}

function buildAllVoices() {
  return stack(...VOICES.map(voicePattern));
}

let patternSet = false;

function getButton(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id} in HTML`);
  return el;
}

getButton("start").addEventListener("click", () => {
  if (!patternSet) {
    scheduler.setPattern(buildAllVoices());
    patternSet = true;
  }
  scheduler.start();
});

getButton("stop").addEventListener("click", () => {
  scheduler.stop();
});