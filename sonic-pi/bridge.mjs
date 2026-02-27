// OSC Bridge: WebSocket (browser) → UDP (Sonic Pi)
// Usage: node sonic-pi/bridge.mjs [sonic-pi-port]

import { WebSocketServer } from 'ws';
import dgram from 'dgram';

const SONIC_PI_PORT = parseInt(process.argv[2] || '4560');
const WS_PORT = 8765;

// Minimal OSC encoder — just strings and floats
function encodeOSCString(str) {
  const buf = Buffer.from(str + '\0');
  const padded = Buffer.alloc(Math.ceil(buf.length / 4) * 4);
  buf.copy(padded);
  return padded;
}

function encodeOSCFloat(value) {
  const buf = Buffer.alloc(4);
  buf.writeFloatBE(value);
  return buf;
}

function encodeOSC(address, args = []) {
  const parts = [encodeOSCString(address)];

  let typeTags = ',';
  for (const arg of args) {
    if (typeof arg === 'string') typeTags += 's';
    else if (typeof arg === 'number') typeTags += 'f';
  }
  parts.push(encodeOSCString(typeTags));

  for (const arg of args) {
    if (typeof arg === 'string') parts.push(encodeOSCString(arg));
    else if (typeof arg === 'number') parts.push(encodeOSCFloat(arg));
  }

  return Buffer.concat(parts);
}

// UDP socket for sending to Sonic Pi
const udp = dgram.createSocket('udp4');

// WebSocket server for browser
const wss = new WebSocketServer({ port: WS_PORT });

wss.on('connection', (ws) => {
  console.log('Browser connected');

  ws.on('message', (data) => {
    try {
      const { address, args } = JSON.parse(data);
      const buf = encodeOSC(address, args || []);
      udp.send(buf, SONIC_PI_PORT, '127.0.0.1');
    } catch (err) {
      console.error('Error:', err.message);
    }
  });

  ws.on('close', () => console.log('Browser disconnected'));
});

console.log(`OSC Bridge running`);
console.log(`  WebSocket: ws://localhost:${WS_PORT}`);
console.log(`  UDP out:   127.0.0.1:${SONIC_PI_PORT} (Sonic Pi)`);
