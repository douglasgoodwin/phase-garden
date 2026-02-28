// Vocal Kit — browser UI → WebSocket → OSC bridge → Sonic Pi

let ws = null;
let connected = false;

const connectionStatus = document.getElementById('connection-status');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const bpmSlider = document.getElementById('bpm');
const bpmValue = document.getElementById('bpm-value');
const driftSlider = document.getElementById('drift');
const driftValue = document.getElementById('drift-value');
const status = document.getElementById('status');

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

bpmSlider.addEventListener('input', () => {
  bpmValue.textContent = bpmSlider.value;
  send('/vocal-kit/bpm', parseFloat(bpmSlider.value));
});

driftSlider.addEventListener('input', () => {
  driftValue.textContent = driftSlider.value;
  // Scale 0-50 slider to 0.0-0.05 drift value
  send('/vocal-kit/drift', parseFloat(driftSlider.value) / 1000);
});

startBtn.addEventListener('click', () => {
  send('/vocal-kit/bpm', parseFloat(bpmSlider.value));
  send('/vocal-kit/drift', parseFloat(driftSlider.value) / 1000);
  send('/vocal-kit/start');
  status.textContent = 'Playing — bring up the drift slider to phase';
});

stopBtn.addEventListener('click', () => {
  send('/vocal-kit/stop');
  status.textContent = 'Stopped';
});

connect();
