// Soul Stacks — browser UI → WebSocket → OSC bridge → Sonic Pi

let ws = null;
let connected = false;

const connectionStatus = document.getElementById('connection-status');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const keySelect = document.getElementById('key');
const bpmSlider = document.getElementById('bpm');
const bpmValue = document.getElementById('bpm-value');
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

keySelect.addEventListener('change', () => {
  send('/soul-stacks/key', keySelect.value);
  status.textContent = `Switched to ${keySelect.options[keySelect.selectedIndex].text}`;
});

bpmSlider.addEventListener('input', () => {
  bpmValue.textContent = bpmSlider.value;
  send('/soul-stacks/bpm', parseFloat(bpmSlider.value));
});

startBtn.addEventListener('click', () => {
  send('/soul-stacks/key', keySelect.value);
  send('/soul-stacks/bpm', parseFloat(bpmSlider.value));
  send('/soul-stacks/start');
  status.textContent = `Playing in ${keySelect.options[keySelect.selectedIndex].text}`;
});

stopBtn.addEventListener('click', () => {
  send('/soul-stacks/stop');
  status.textContent = 'Stopped';
});

connect();
