# Piano Phase - Steve Reich (1967)
# Phase Garden - Sonic Pi Edition
#
# Setup:
#   1. Run this script in Sonic Pi
#   2. Start the OSC bridge: npm run bridge
#   3. Open the browser page and click Start
#
# OSC messages received:
#   /piano-phase/start        - begin playback
#   /piano-phase/stop         - stop playback
#   /piano-phase/bpm <float>  - set tempo
#   /piano-phase/drift <float> - set Piano 2 drift (0.0 = locked, >0 = faster)

# Reich's 12-note pattern
notes = (ring :E4, :Fs4, :B4, :Cs5, :D5, :Fs4, :E4, :Cs5, :B4, :Fs4, :D5, :Cs5)

set :running, false
set :target_bpm, 144
set :phase_drift, 0.0
set :p1_idx, 0
set :p2_idx, 0

# --- OSC control listeners ---

live_loop :ctrl_start do
  use_real_time
  sync "/osc*/piano-phase/start"
  set :running, true
  set :p1_idx, 0
  set :p2_idx, 0
  set :phase_drift, 0.0
  puts "Piano Phase: started"
end

live_loop :ctrl_stop do
  use_real_time
  sync "/osc*/piano-phase/stop"
  set :running, false
  puts "Piano Phase: stopped"
end

live_loop :ctrl_bpm do
  use_real_time
  val = sync "/osc*/piano-phase/bpm"
  set :target_bpm, val[0].to_f
end

live_loop :ctrl_drift do
  use_real_time
  val = sync "/osc*/piano-phase/drift"
  set :phase_drift, val[0].to_f
end

# --- Pianos ---

with_fx :reverb, room: 0.6, mix: 0.3 do
  # Piano 1 - fixed tempo, panned left
  live_loop :piano1 do
    use_bpm get(:target_bpm)
    if get(:running)
      idx = get(:p1_idx)
      synth :piano, note: notes[idx],
        vel: 0.45, hard: 0.3,
        pan: -0.5, amp: 0.25
      set :p1_idx, (idx + 1) % 12
    end
    sleep 0.5
  end

  # Piano 2 - variable tempo, panned right
  live_loop :piano2 do
    use_bpm get(:target_bpm)
    if get(:running)
      idx = get(:p2_idx)
      synth :piano, note: notes[idx],
        vel: 0.5, hard: 0.5,
        pan: 0.5, amp: 0.25
      set :p2_idx, (idx + 1) % 12
    end
    drift = get(:phase_drift).to_f
    sleep 0.5 * (1.0 - drift)
  end
end
