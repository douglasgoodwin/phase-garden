// Tapping Music — browser UI → WebSocket → OSC bridge → Sonic Pi
//
// Sonic Pi handles the bar counting and phase shifting internally.
// The browser sends parameters and estimates the display.

const basePattern = [1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0];

let ws = null;
let connected = false;
let displayInterval = null;
let startTime = null;

const connectionStatus = document.getElementById('connection-status');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const bpmSlider = document.getElementById('bpm');
const bpmValue = document.getElementById('bpm-value');
const barsSlider = document.getElementById('bars-per-shift');
const barsValue = document.getElementById('bars-value');
const humanizeSlider = document.getElementById('humanize');
const humanizeValue = document.getElementById('humanize-value');
const status = document.getElementById('status');
const patternDisplay = document.getElementById('pattern-display');

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

// --- Rotate pattern ---

function rotatePattern(arr, n) {
  const shift = n % arr.length;
  return [...arr.slice(shift), ...arr.slice(0, shift)];
}

// --- Pattern visualization ---

function renderPattern(pat, label, color) {
  const beats = pat.map(b =>
    `<span style="display:inline-block; width:18px; height:18px; margin:2px;
      background:${b ? color : '#333'}; border-radius:3px;"></span>`
  ).join('');
  return `<div style="margin:6px 0;">
    <span style="color:${color}; font-weight:bold; width:60px; display:inline-block;">${label}</span>${beats}
  </div>`;
}

// --- Display (estimated from timing) ---

function estimateShift() {
  if (!startTime) return 0;
  const bpm = parseInt(bpmSlider.value);
  const barsPerShift = parseInt(barsSlider.value);
  const barDuration = 12 * (60 / bpm / 2); // 12 eighth notes per bar
  const elapsed = (Date.now() - startTime) / 1000;
  const totalBars = Math.floor(elapsed / barDuration);
  return Math.floor(totalBars / barsPerShift) % 12;
}

function updateDisplay() {
  const shift = estimateShift();
  const shifted = rotatePattern(basePattern, shift);

  if (shift === 0 && startTime && (Date.now() - startTime) > 2000) {
    status.textContent = 'In unison (shift 0/12)';
  } else if (shift === 0) {
    status.textContent = 'In unison (shift 0/12)';
  } else {
    status.textContent = `Shift: ${shift}/12`;
  }

  patternDisplay.innerHTML =
    renderPattern(basePattern, 'Bell 1', '#4080c0') +
    renderPattern(shifted, 'Bell 2', '#c04040');
}

// --- Controls ---

bpmSlider.addEventListener('input', () => {
  bpmValue.textContent = bpmSlider.value;
  send('/tapping-music/bpm', parseFloat(bpmSlider.value));
});

barsSlider.addEventListener('input', () => {
  barsValue.textContent = barsSlider.value;
  send('/tapping-music/bars-per-shift', parseFloat(barsSlider.value));
});

humanizeSlider.addEventListener('input', () => {
  humanizeValue.textContent = humanizeSlider.value;
  send('/tapping-music/humanize', parseFloat(humanizeSlider.value));
});

// --- Start/Stop ---

startBtn.addEventListener('click', () => {
  startTime = Date.now();

  send('/tapping-music/start');
  send('/tapping-music/bpm', parseFloat(bpmSlider.value));
  send('/tapping-music/bars-per-shift', parseFloat(barsSlider.value));
  send('/tapping-music/humanize', parseFloat(humanizeSlider.value));

  if (displayInterval) clearInterval(displayInterval);
  displayInterval = setInterval(updateDisplay, 200);
  updateDisplay();
});

stopBtn.addEventListener('click', () => {
  send('/tapping-music/stop');
  startTime = null;

  if (displayInterval) { clearInterval(displayInterval); displayInterval = null; }

  status.textContent = 'Stopped';
  patternDisplay.innerHTML = '';
});

// Auto-connect
connect();
