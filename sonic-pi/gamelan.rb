# Gamelan - Phase Garden - Sonic Pi Edition
#
# 23 vocal clips layered densely at prime-number beat intervals.
# Each loop picks a random clip with varied pan, amplitude, and
# occasional pitch shifts, creating a thick evolving vocal texture.
#
# Setup:
#   1. Run this script in Sonic Pi
#   2. Start the OSC bridge: npm run bridge
#   3. Open the browser page and click Start

# *** UPDATE THIS PATH for your system ***
D = "~/_CODE/phase-garden/samples/Ebminor"

# All 23 clips
clips = (1..23).map { |i| D + "/_%05d.wav" % i }

set :running, false

live_loop :ctrl_start do
  use_real_time
  sync "/osc*/gamelan/start"
  set :running, true
  puts "Gamelan: started"
end

live_loop :ctrl_stop do
  use_real_time
  sync "/osc*/gamelan/stop"
  set :running, false
  puts "Gamelan: stopped"
end

# Prime-number intervals in BEATS (not measures).
# At 60 BPM these are seconds. Range: 5s to 89s.
# Dense layer (5-19s), mid layer (23-47s), sparse layer (53-89s)
primes = [5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89]

with_fx :reverb, room: 0.75, mix: 0.5 do
  primes.length.times do |idx|
    live_loop "gamelan_#{idx}".to_sym do
      use_bpm 60
      if get(:running)
        clip = clips.choose
        pan = rrand(-0.7, 0.7)
        amp = rrand(0.3, 0.65)
        # Rates tuned to Eb minor: unison, 5th below, 4th below,
        # minor 3rd up (Gb), 4th up (Ab), 5th up (Bb)
        rate = [1, 1, 1, 1, 0.667, 0.75, 0.841, 1.189, 1.333, 1.5].choose
        sample clip, amp: amp, pan: pan, rate: rate
        sleep primes[idx]
      else
        sleep 0.5
      end
    end
  end
end

# Rate intervals (Eb minor):
#   1.0    — unison (Eb)
#   0.667  — fifth below (Ab, deep)
#   0.75   — fourth below (Bb)
#   0.841  — minor third below (Cb/B)
#   1.189  — minor third up (Gb)
#   1.333  — fourth up (Ab)
#   1.5    — fifth up (Bb)
