# Speech-Following Oboe — Offline Pitch Replay
# Phase Garden - Sonic Pi Edition
#
# A sampled oboe follows the pitch contour extracted from speech.
# Pitch data comes from aubio analysis of a speech WAV file.
#
# Setup:
#   1. Update the sample path D below to match your system
#   2. Run this script in Sonic Pi
#   3. Start the OSC bridge: npm run bridge
#   4. Open the browser page and click Start
#
# OSC messages received:
#   /speech-flute/start           - begin listening for notes
#   /speech-flute/stop            - stop playback
#   /speech-flute/note <hz> <dur> - play an oboe note at given freq and duration

# Path to samples directory — update for your system
D = File.expand_path("~/_CODE/phase-garden/samples")
oboe = "#{D}/Oboe.ff.A4.mono.wav"

set :running, false

# --- OSC control listeners ---

live_loop :sf_start do
  use_real_time
  sync "/osc*/speech-flute/start"
  set :running, true
  puts "Speech Oboe: started"
end

live_loop :sf_stop do
  use_real_time
  sync "/osc*/speech-flute/stop"
  set :running, false
  puts "Speech Oboe: stopped"
end

# --- Oboe voice ---

live_loop :sf_note do
  use_real_time
  val = sync "/osc*/speech-flute/note"
  if get(:running)
    freq = val[0].to_f
    dur = val[1].to_f
    dur = [dur, 0.05].max

    # A4 = MIDI 69; shift from there to target pitch
    shift = hz_to_midi(freq) - 69

    att = 0.05
    rel = 0.15
    sus = [dur - att - rel, 0.01].max

    with_fx :reverb, room: 0.75, mix: 0.4 do
      with_fx :echo, phase: 0.25, decay: 2, mix: 0.3 do
        sample oboe,
          rpitch: shift,
          amp: 0.4,
          attack: att, sustain: sus, release: rel,
          finish: [dur / sample_duration(oboe), 1.0].min
      end
    end
  end
end
