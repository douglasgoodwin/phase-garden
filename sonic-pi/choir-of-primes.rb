# Choir of Primes - Phase Garden - Sonic Pi Edition
#
# 22 voices, each repeating at a different prime-number interval.
# Because primes share no common factors, the voices almost never
# align — the texture is constantly evolving and effectively never repeats.
# Pitch shifts stay within the selected key using consonant intervals.
#
# Setup:
#   1. Run this script in Sonic Pi
#   2. Start the OSC bridge: npm run bridge
#   3. Open the browser page, choose a key, and click Start

# *** UPDATE THIS PATH for your system ***
D = File.expand_path("~/_CODE/phase-garden/samples/vocals")

# Pitch rates: intervals that stay consonant in minor vs major
minor_rates = [1, 1, 1, 1, 0.667, 0.75, 0.841, 1.189, 1.333, 1.5]
major_rates = [1, 1, 1, 1, 0.667, 0.75, 0.794, 1.26, 1.333, 1.5]

# Scan initial key
set :current_key, "Ebminor"
set :clips, Dir.glob(D + "/Ebminor/*.wav").sort
set :rates, minor_rates
set :running, false

# --- OSC control ---

live_loop :ctrl_start do
  use_real_time
  sync "/osc*/choir-of-primes/start"
  set :running, true
  puts "Choir of Primes: started (#{get(:current_key)}, #{get(:clips).length} clips)"
end

live_loop :ctrl_stop do
  use_real_time
  sync "/osc*/choir-of-primes/stop"
  set :running, false
  puts "Choir of Primes: stopped"
end

live_loop :ctrl_key do
  use_real_time
  val = sync "/osc*/choir-of-primes/key"
  key = val[0].to_s
  found = Dir.glob(D + "/#{key}/*.wav").sort
  if found.length > 0
    set :current_key, key
    set :clips, found
    set :rates, key.include?("major") ? major_rates : minor_rates
    puts "Choir of Primes: key #{key} (#{found.length} clips)"
  else
    puts "Choir of Primes: no clips found for #{key}"
  end
end

# --- Performance ---

# Prime-number intervals in beats (= seconds at 60 BPM).
# Dense layer (5-19s), mid layer (23-47s), sparse layer (53-89s)
primes = [5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89]

with_fx :reverb, room: 0.75, mix: 0.5 do
  primes.length.times do |idx|
    live_loop "choir_#{idx}".to_sym do
      use_bpm 60
      if get(:running)
        clips = get(:clips)
        rates = get(:rates)
        if clips.length > 0
          sample clips.choose,
            amp: rrand(0.3, 0.65),
            pan: rrand(-0.7, 0.7),
            rate: rates.choose
        end
        sleep primes[idx]
      else
        sleep 0.5
      end
    end
  end
end

# Rate intervals:
#   Minor keys — unison, 5th below, 4th below, m3 below, m3 up, 4th up, 5th up
#   Major keys — unison, 5th below, 4th below, M3 below, M3 up, 4th up, 5th up
