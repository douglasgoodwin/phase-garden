// Drumming — browser UI → WebSocket → OSC bridge → Sonic Pi

let ws = null;
let connected = false;

const connectionStatus = document.getElementById('connection-status');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const bpmSlider = document.getElementById('bpm');
const bpmValue = document.getElementById('bpm-value');
const partSelect = document.getElementById('part');
const densitySlider = document.getElementById('density');
const densityValue = document.getElementById('density-value');
const status = document.getElementById('status');

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

// --- Controls ---

bpmSlider.addEventListener('input', () => {
  bpmValue.textContent = bpmSlider.value;
  send('/drumming/bpm', parseFloat(bpmSlider.value));
});

partSelect.addEventListener('change', () => {
  send('/drumming/part', parseFloat(partSelect.value));
  status.textContent = `Playing Part ${partSelect.value}`;
});

densitySlider.addEventListener('input', () => {
  densityValue.textContent = densitySlider.value;
  send('/drumming/density', parseFloat(densitySlider.value));
});

// --- Start/Stop ---

startBtn.addEventListener('click', () => {
  send('/drumming/start');
  send('/drumming/bpm', parseFloat(bpmSlider.value));
  send('/drumming/part', parseFloat(partSelect.value));
  send('/drumming/density', parseFloat(densitySlider.value));
  status.textContent = `Playing Part ${partSelect.value}`;
});

stopBtn.addEventListener('click', () => {
  send('/drumming/stop');
  status.textContent = 'Stopped';
});

// Auto-connect
connect();
