// Speech Flute — browser UI → WebSocket → OSC bridge → Sonic Pi

let ws = null;
let connected = false;
let scheduledTimeouts = [];
let playing = false;
let startTime = 0;
let totalDuration = 0;
let progressRAF = null;

const connectionStatus = document.getElementById('connection-status');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const status = document.getElementById('status');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

// --- WebSocket connection ---

function connect() {
  ws = new WebSocket('ws://localhost:8765');

  ws.onopen = () => {
    connected = true;
    connectionStatus.textContent = 'Connected to OSC bridge';
    connectionStatus.style.color = '#40c040';
    startBtn.disabled = false;
    stopBtn.disabled = false;
  };

  ws.onclose = () => {
    connected = false;
    connectionStatus.textContent = 'Disconnected — is the bridge running? (npm run bridge)';
    connectionStatus.style.color = '#c04040';
    startBtn.disabled = true;
    stopBtn.disabled = true;
    setTimeout(connect, 3000);
  };

  ws.onerror = () => {};
}

function send(address, ...args) {
  if (!connected || ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify({ address, args }));
}

// --- Progress display ---

function updateProgress() {
  if (!playing) return;
  const elapsed = (Date.now() - startTime) / 1000;
  const pct = Math.min(100, (elapsed / totalDuration) * 100);
  progressBar.style.width = pct + '%';
  progressText.textContent = `${elapsed.toFixed(1)}s / ${totalDuration.toFixed(1)}s`;

  if (elapsed < totalDuration) {
    progressRAF = requestAnimationFrame(updateProgress);
  } else {
    status.textContent = 'Playback complete';
    playing = false;
  }
}

// --- Start/Stop ---

startBtn.addEventListener('click', async () => {
  // Stop any current playback first
  stopPlayback();

  status.textContent = 'Loading pitch data...';

  let notes;
  try {
    const resp = await fetch('/sonic-pi/speech-flute-pitch.json');
    notes = await resp.json();
  } catch (err) {
    status.textContent = 'Error loading pitch data. Run: node sonic-pi/speech-flute-analyze.mjs';
    return;
  }

  status.textContent = `Playing ${notes.length} notes...`;
  playing = true;

  // Calculate total duration from last note
  const lastNote = notes[notes.length - 1];
  totalDuration = lastNote.time + lastNote.duration;
  startTime = Date.now();

  // Show progress
  progressContainer.style.display = 'block';
  progressBar.style.width = '0%';
  progressRAF = requestAnimationFrame(updateProgress);

  // Send start signal
  send('/speech-flute/start');

  // Schedule each note at its original timestamp
  for (const note of notes) {
    const delay = note.time * 1000; // ms
    const id = setTimeout(() => {
      send('/speech-flute/note', note.freq, note.duration);
    }, delay);
    scheduledTimeouts.push(id);
  }

  // Schedule auto-stop after playback
  const endId = setTimeout(() => {
    status.textContent = 'Playback complete';
    playing = false;
  }, totalDuration * 1000 + 500);
  scheduledTimeouts.push(endId);
});

function stopPlayback() {
  for (const id of scheduledTimeouts) {
    clearTimeout(id);
  }
  scheduledTimeouts = [];
  playing = false;

  if (progressRAF) {
    cancelAnimationFrame(progressRAF);
    progressRAF = null;
  }

  progressContainer.style.display = 'none';
  send('/speech-flute/stop');
}

stopBtn.addEventListener('click', () => {
  stopPlayback();
  status.textContent = 'Stopped';
});

// Auto-connect on load
connect();
