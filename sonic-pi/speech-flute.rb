# Speech-Following Flute — Offline Pitch Replay
# Phase Garden - Sonic Pi Edition
#
# A flute-like synth follows the pitch contour extracted from speech.
# Pitch data comes from aubio analysis of samples/bobEdwards.wav.
#
# Setup:
#   1. Run this script in Sonic Pi
#   2. Start the OSC bridge: npm run bridge
#   3. Open the browser page and click Start
#
# OSC messages received:
#   /speech-flute/start           - begin listening for notes
#   /speech-flute/stop            - stop playback
#   /speech-flute/note <hz> <dur> - play a flute note at given freq and duration

set :running, false

# --- OSC control listeners ---

live_loop :sf_start do
  use_real_time
  sync "/osc*/speech-flute/start"
  set :running, true
  puts "Speech Flute: started"
end

live_loop :sf_stop do
  use_real_time
  sync "/osc*/speech-flute/stop"
  set :running, false
  puts "Speech Flute: stopped"
end

# --- Flute voice ---

live_loop :sf_note do
  use_real_time
  val = sync "/osc*/speech-flute/note"
  if get(:running)
    freq = val[0].to_f
    dur = val[1].to_f
    dur = [dur, 0.05].max

    # Sustain is the note duration minus attack and release
    att = 0.05
    rel = 0.15
    sus = [dur - att - rel, 0.01].max

    with_fx :reverb, room: 0.7, mix: 0.35 do
      # Main sine tone
      synth :sine, note: hz_to_midi(freq),
        amp: 0.3,
        attack: att, sustain: sus, release: rel,
        pan: -0.2

      # Slight detune layer for warmth
      synth :sine, note: hz_to_midi(freq * 1.003),
        amp: 0.15,
        attack: att * 1.2, sustain: sus, release: rel * 1.3,
        pan: 0.2
    end
  end
end
