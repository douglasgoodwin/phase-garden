# Soul Stacks - Phase Garden - Sonic Pi Edition
#
# Soul vocal phrases layered at bar-aligned intervals, building
# into a dense wall of overlapping voices. Unlike the Gamelan piece
# (prime-number intervals), intervals here are musically meaningful
# bar lengths so phrases lock into grooves before drifting.
#
# Setup:
#   1. Run this script in Sonic Pi
#   2. Start the OSC bridge: npm run bridge
#   3. Open the browser page, choose a key, and click Start

# *** UPDATE THIS PATH for your system ***
D = File.expand_path("~/_CODE/phase-garden/samples/soul")

# Pitch rates — mostly unison, occasional consonant shifts
# Soul phrasing sounds best near natural pitch
minor_rates = [1, 1, 1, 1, 1, 1, 0.75, 0.841, 1.189, 1.333, 1.5]
major_rates = [1, 1, 1, 1, 1, 1, 0.75, 0.794, 1.26, 1.333, 1.5]

# Scan initial key
set :current_key, "Cminor"
set :clips, Dir.glob(D + "/Cminor/*.wav").sort
set :rates, minor_rates
set :running, false
set :target_bpm, 95

# --- OSC control ---

live_loop :ctrl_start do
  use_real_time
  sync "/osc*/soul-stacks/start"
  set :running, true
  puts "Soul Stacks: started (#{get(:current_key)}, #{get(:clips).length} clips)"
end

live_loop :ctrl_stop do
  use_real_time
  sync "/osc*/soul-stacks/stop"
  set :running, false
  puts "Soul Stacks: stopped"
end

live_loop :ctrl_key do
  use_real_time
  val = sync "/osc*/soul-stacks/key"
  key = val[0].to_s
  found = Dir.glob(D + "/#{key}/*.wav").sort
  if found.length > 0
    set :current_key, key
    set :clips, found
    set :rates, key.include?("major") ? major_rates : minor_rates
    puts "Soul Stacks: key #{key} (#{found.length} clips)"
  else
    puts "Soul Stacks: no clips found for #{key}"
  end
end

live_loop :ctrl_bpm do
  use_real_time
  val = sync "/osc*/soul-stacks/bpm"
  set :target_bpm, val[0].to_f
end

# --- Performance ---

# Bar-aligned intervals (in bars). Dense foreground (2-6 bars),
# mid layer (7-16), sparse background (20-32).
# At 95 BPM: 2 bars ≈ 5s, 8 bars ≈ 20s, 32 bars ≈ 81s
bar_intervals = [2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 20, 24, 28, 32]

with_fx :reverb, room: 0.5, mix: 0.35 do
  bar_intervals.length.times do |idx|
    live_loop "soul_#{idx}".to_sym do
      use_bpm get(:target_bpm)
      if get(:running)
        clips = get(:clips)
        rates = get(:rates)
        if clips.length > 0
          sample clips.choose,
            amp: rrand(0.35, 0.7),
            pan: rrand(-0.6, 0.6),
            rate: rates.choose
        end
        sleep bar_intervals[idx] * 4  # bars to beats
      else
        sleep 0.5
      end
    end
  end
end
