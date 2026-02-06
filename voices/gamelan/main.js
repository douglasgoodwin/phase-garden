import * as Tone from 'tone';

let loops = [];
const statusEl = document.getElementById('status');

document.getElementById('start').addEventListener('click', async () => {
  await Tone.start();

  Tone.Transport.bpm.value = 30;

  // Load all the voice samples
  const voices = {
    A3: new Tone.Player('/notes/A3.m4a').toDestination(),
    A4: new Tone.Player('/notes/A4.m4a').toDestination(),
    C: new Tone.Player('/notes/C.m4a').toDestination(),
    C4: new Tone.Player('/notes/C4.m4a').toDestination(),
    C5: new Tone.Player('/notes/C5.m4a').toDestination(),
    F3: new Tone.Player('/notes/F3.m4a').toDestination(),
    F4: new Tone.Player('/notes/F4.m4a').toDestination()
  };

  // Wait for all samples to load
  try {
    statusEl.textContent = 'Loading samples...';
    await Tone.loaded();
  } catch (err) {
    statusEl.textContent = 'Error loading samples: ' + err.message;
    console.error(err);
    return;
  }

  // Much longer loop times - every 17-31 measures (68-124 beats)
  const voiceLoop1 = new Tone.Loop((time) => {
    voices.F3.start(time);
  }, '17m'); // 17 measures

  const voiceLoop2 = new Tone.Loop((time) => {
    voices.A3.start(time);
  }, '19m');

  const voiceLoop3 = new Tone.Loop((time) => {
    voices.C4.start(time);
  }, '23m');

  const voiceLoop4 = new Tone.Loop((time) => {
    voices.F4.start(time);
  }, '29m');

  const voiceLoop5 = new Tone.Loop((time) => {
    voices.A4.start(time);
  }, '31m');

  const voiceLoop6 = new Tone.Loop((time) => {
    voices.C5.start(time);
  }, '37m');

  const voiceLoop7 = new Tone.Loop((time) => {
    voices.C.start(time);
  }, '41m');

  loops = [voiceLoop1, voiceLoop2, voiceLoop3, voiceLoop4, voiceLoop5, voiceLoop6, voiceLoop7];
  loops.forEach(loop => loop.start(0));
  Tone.Transport.start();
  statusEl.textContent = 'Playing...';
});

document.getElementById('stop').addEventListener('click', () => {
  Tone.Transport.stop();
  loops.forEach(loop => loop.stop());
  statusEl.textContent = '';
});
