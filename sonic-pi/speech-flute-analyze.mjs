// Speech-Flute Pitch Extraction
// Runs `aubio pitch` on a WAV file, groups frames into notes, writes JSON.
//
// Usage: node sonic-pi/speech-flute-analyze.mjs [path-to-wav]
// Default: samples/bobEdwards.wav

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const inputFile = process.argv[2] || resolve(projectRoot, 'samples/bobEdwards.wav');
const outputFile = resolve(__dirname, 'speech-flute-pitch.json');

// Run aubio pitch detection
// -H 512 gives ~86 frames/sec at 44100 Hz — good balance of resolution vs data
const cmd = `aubio pitch -i "${inputFile}" -H 512 -B 2048 -m yinfft`;
console.log(`Running: ${cmd}`);
const raw = execSync(cmd, { encoding: 'utf-8' });

// Parse aubio output: each line is "timestamp_seconds frequency_hz"
const frames = raw
  .trim()
  .split('\n')
  .map(line => {
    const [timeStr, freqStr] = line.trim().split(/\s+/);
    return { time: parseFloat(timeStr), freq: parseFloat(freqStr) };
  })
  .filter(f => !isNaN(f.time) && !isNaN(f.freq));

console.log(`Parsed ${frames.length} frames`);

// Convert Hz to MIDI note number (for grouping by semitone)
function hzToMidi(hz) {
  if (hz <= 0) return 0;
  return 12 * Math.log2(hz / 440) + 69;
}

// Quantize Hz to nearest semitone
function quantizeHz(hz) {
  const midi = Math.round(hzToMidi(hz));
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Group consecutive pitched frames into notes
// Frames at similar pitch (within 1 semitone) get merged into a single note
const MIN_DURATION = 0.04; // ignore notes shorter than 40ms
const MIN_FREQ = 50;       // ignore frequencies below 50 Hz (silence/noise)
const MAX_FREQ = 800;      // ignore unreasonably high pitches for speech
const SEMITONE_THRESHOLD = 1.5; // max semitone difference to merge frames

const notes = [];
let currentNote = null;

for (const frame of frames) {
  const pitched = frame.freq >= MIN_FREQ && frame.freq <= MAX_FREQ;

  if (pitched) {
    const midi = hzToMidi(frame.freq);

    if (currentNote && Math.abs(midi - currentNote.midi) < SEMITONE_THRESHOLD) {
      // Extend current note
      currentNote.end = frame.time;
      currentNote.freqSum += frame.freq;
      currentNote.frameCount++;
    } else {
      // Finish previous note if any
      if (currentNote) {
        finalizeNote(currentNote);
      }
      // Start new note
      currentNote = {
        start: frame.time,
        end: frame.time,
        midi,
        freqSum: frame.freq,
        frameCount: 1
      };
    }
  } else {
    // Silence or noise — finish current note
    if (currentNote) {
      finalizeNote(currentNote);
      currentNote = null;
    }
  }
}

// Don't forget the last note
if (currentNote) {
  finalizeNote(currentNote);
}

function finalizeNote(note) {
  const hopDuration = frames.length > 1 ? frames[1].time - frames[0].time : 0.012;
  const duration = note.end - note.start + hopDuration;
  if (duration < MIN_DURATION) return;

  const avgFreq = note.freqSum / note.frameCount;
  notes.push({
    time: Math.round(note.start * 1000) / 1000,
    freq: Math.round(quantizeHz(avgFreq) * 100) / 100,
    duration: Math.round(duration * 1000) / 1000
  });
}

console.log(`Grouped into ${notes.length} notes`);
console.log(`Time range: 0 — ${notes[notes.length - 1].time + notes[notes.length - 1].duration}s`);
console.log(`Frequency range: ${Math.min(...notes.map(n => n.freq))} — ${Math.max(...notes.map(n => n.freq))} Hz`);

writeFileSync(outputFile, JSON.stringify(notes, null, 2));
console.log(`Written to ${outputFile}`);
