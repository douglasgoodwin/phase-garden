// Piano Phase — browser UI → WebSocket → OSC bridge → Sonic Pi

let ws = null;
let connected = false;
let phaseInterval = null;
let displayInterval = null;

let currentPhase = 0;
let isPhasing = false;
let phaseProgress = 0;

const connectionStatus = document.getElementById('connection-status');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const bpmSlider = document.getElementById('bpm');
const bpmValue = document.getElementById('bpm-value');
const phaseSlider = document.getElementById('phase-time');
const phaseValue = document.getElementById('phase-value');
const status = document.getElementById('status');
const voicesStatus = document.getElementById('voices-status');

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
    // Reconnect after a delay
    setTimeout(connect, 3000);
  };

  ws.onerror = () => {
    // onclose will fire after this
  };
}

function send(address, ...args) {
  if (!connected || ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify({ address, args }));
}

// --- Controls ---

bpmSlider.addEventListener('input', () => {
  bpmValue.textContent = bpmSlider.value;
  send('/piano-phase/bpm', parseFloat(bpmSlider.value));
});

phaseSlider.addEventListener('input', () => {
  phaseValue.textContent = phaseSlider.value;
});

// --- Display ---

function updateDisplay() {
  const phaseText = currentPhase === 0 ? 'In unison' : `Phase ${currentPhase}/12`;
  const stateText = isPhasing ? ' (phasing...)' : ' (locked)';
  status.textContent = phaseText + stateText;

  const piano2Pos = (currentPhase + (isPhasing ? phaseProgress : 0)) / 12 * 100;

  voicesStatus.innerHTML = `
    <div style="margin: 12px 0;">
      <div style="margin: 8px 0;">
        <span style="color: #4080c0; font-weight: bold;">Piano 1</span>: Fixed tempo
        <div style="background: #333; height: 8px; width: 200px; display: inline-block; margin-left: 8px; position: relative;">
          <div style="background: #4080c0; height: 100%; width: 8px; position: absolute; left: 0%;"></div>
        </div>
      </div>
      <div style="margin: 8px 0;">
        <span style="color: #c04040; font-weight: bold;">Piano 2</span>: ${isPhasing ? 'Accelerating' : 'Locked'}
        <div style="background: #333; height: 8px; width: 200px; display: inline-block; margin-left: 8px; position: relative;">
          <div style="background: #c04040; height: 100%; width: 8px; position: absolute; left: ${piano2Pos}%;"></div>
        </div>
      </div>
    </div>
  `;
}

// --- Start/Stop ---

startBtn.addEventListener('click', () => {
  currentPhase = 0;
  isPhasing = false;
  phaseProgress = 0;

  send('/piano-phase/start');
  send('/piano-phase/bpm', parseFloat(bpmSlider.value));

  // Phase state machine — alternates between locked and phasing
  const lockDuration = 4; // seconds to stay locked before phasing
  let lockTime = 0;

  if (phaseInterval) clearInterval(phaseInterval);
  phaseInterval = setInterval(() => {
    const phaseTime = parseInt(phaseSlider.value);

    if (!isPhasing) {
      // Locked — both pianos in sync
      send('/piano-phase/drift', 0.0);
      lockTime += 0.1;

      if (lockTime >= lockDuration) {
        isPhasing = true;
        lockTime = 0;
        phaseProgress = 0;
      }
    } else {
      // Phasing — Piano 2 gradually speeds up
      phaseProgress += 0.1 / phaseTime;
      const drift = phaseProgress * 0.08; // up to 8% faster
      send('/piano-phase/drift', drift);

      if (phaseProgress >= 1) {
        currentPhase = (currentPhase + 1) % 12;
        isPhasing = false;
        phaseProgress = 0;
        send('/piano-phase/drift', 0.0);

        if (currentPhase === 0) {
          status.textContent = 'Back in unison! Cycle complete.';
        }
      }
    }
  }, 100);

  if (displayInterval) clearInterval(displayInterval);
  displayInterval = setInterval(updateDisplay, 100);
  updateDisplay();
});

stopBtn.addEventListener('click', () => {
  send('/piano-phase/stop');

  if (phaseInterval) { clearInterval(phaseInterval); phaseInterval = null; }
  if (displayInterval) { clearInterval(displayInterval); displayInterval = null; }

  status.textContent = '';
  voicesStatus.innerHTML = '';
});

// Auto-connect on load
connect();
