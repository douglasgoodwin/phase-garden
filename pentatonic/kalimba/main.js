import * as Tone from 'tone';

let loops = [];

const bpmSlider = document.getElementById('bpm');
const bpmValue = document.getElementById('bpm-value');

bpmSlider.addEventListener('input', () => {
  const bpm = bpmSlider.value;
  bpmValue.textContent = bpm;
  Tone.Transport.bpm.value = bpm;
});

document.getElementById('start').addEventListener('click', async () => {
  await Tone.start();

  Tone.Transport.bpm.value = bpmSlider.value;

  // Reverb for ambience
  const reverb = new Tone.Reverb({ decay: 2, wet: 0.3 }).toDestination();

  // Thumb piano / kalimba-like synth settings
  const plinkSettings = {
    oscillator: { type: 'triangle' },
    envelope: {
      attack: 0.001,
      decay: 0.4,
      sustain: 0,
      release: 0.3
    }
  };

  // High voice - pentatonic melody
  const highSynth = new Tone.Synth(plinkSettings).connect(reverb);
  const highNotes = ['C5', 'D5', 'F5', 'G5', 'A5'];
  const highLoop = new Tone.Loop((time) => {
    const note = highNotes[Math.floor(Math.random() * highNotes.length)];
    highSynth.triggerAttackRelease(note, '8n', time);
  }, '4n');

  // Low voice - slower bass
  const lowSynth = new Tone.Synth(plinkSettings).connect(reverb);
  const lowNotes = ['C4', 'G4'];
  const lowLoop = new Tone.Loop((time) => {
    const note = lowNotes[Math.floor(Math.random() * lowNotes.length)];
    lowSynth.triggerAttackRelease(note, '8n', time);
  }, '2n');

  loops = [highLoop, lowLoop];
  loops.forEach(loop => loop.start(0));
  Tone.Transport.start();
});

document.getElementById('stop').addEventListener('click', () => {
  Tone.Transport.stop();
  loops.forEach(loop => loop.stop());
});
