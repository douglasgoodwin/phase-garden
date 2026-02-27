# Tapping Music - After Steve Reich's Clapping Music (1972)
# Phase Garden - Sonic Pi Edition
#
# Two FM bells play the same 12-beat pattern.
# Bell 2 shifts one beat every N bars until back in unison.
#
# Setup:
#   1. Run this script in Sonic Pi
#   2. Start the OSC bridge: npm run bridge
#   3. Open the browser page and click Start
#
# OSC messages:
#   /tapping-music/start
#   /tapping-music/stop
#   /tapping-music/bpm <float>
#   /tapping-music/bars-per-shift <float>
#   /tapping-music/humanize <float>  (ms)

# Reich's 12-beat pattern: X X X - X X - X - X X -
pattern = [1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0]

set :running, false
set :target_bpm, 168
set :bars_per_shift, 8
set :humanize_ms, 20.0
set :shift_position, 0
set :bar_count, 0

# --- OSC control listeners ---

live_loop :ctrl_start do
  use_real_time
  sync "/osc*/tapping-music/start"
  set :running, true
  set :shift_position, 0
  set :bar_count, 0
  puts "Tapping Music: started"
end

live_loop :ctrl_stop do
  use_real_time
  sync "/osc*/tapping-music/stop"
  set :running, false
  puts "Tapping Music: stopped"
end

live_loop :ctrl_bpm do
  use_real_time
  val = sync "/osc*/tapping-music/bpm"
  set :target_bpm, val[0].to_f
end

live_loop :ctrl_bars do
  use_real_time
  val = sync "/osc*/tapping-music/bars-per-shift"
  set :bars_per_shift, val[0].to_i
end

live_loop :ctrl_humanize do
  use_real_time
  val = sync "/osc*/tapping-music/humanize"
  set :humanize_ms, val[0].to_f
end

# --- Performance ---

live_loop :tapping do
  use_bpm get(:target_bpm)
  if get(:running)
    shift = get(:shift_position)
    shifted = pattern.rotate(shift)
    h_ms = get(:humanize_ms)

    12.times do |i|
      # Clapper 1 - fixed pattern, panned left
      if pattern[i] == 1
        h = rrand(-1, 1) * h_ms / 1000.0
        time_warp h do
          sample :perc_snap, rate: 0.95, pan: -0.7, amp: 1.2
        end
      end
      # Clapper 2 - shifted pattern, panned right
      if shifted[i] == 1
        h = rrand(-1, 1) * h_ms / 1000.0
        time_warp h do
          sample :perc_snap2, rate: 1.05, pan: 0.7, amp: 1.2
        end
      end
      sleep 0.5
    end

    # Bar complete — count and shift
    bc = get(:bar_count) + 1
    set :bar_count, bc
    if bc >= get(:bars_per_shift)
      set :bar_count, 0
      new_shift = (get(:shift_position) + 1) % 12
      set :shift_position, new_shift
      puts "Shift: #{new_shift}/12"
    end
  else
    sleep 0.5
  end
end
