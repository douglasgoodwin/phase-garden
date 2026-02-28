# Call & Response - Phase Garden - Sonic Pi Edition
#
# Soul vocal phrases in paired call-and-response layers.
# Each pair plays a "call" clip panned left, waits 1-3 beats,
# then a "response" clip panned right. Pairs repeat at different
# bar-aligned intervals, building overlapping conversations.
#
# Setup:
#   1. Run this script in Sonic Pi
#   2. Start the OSC bridge: npm run bridge
#   3. Open the browser page, choose a key, and click Start

# *** UPDATE THIS PATH for your system ***
D = File.expand_path("~/_CODE/phase-garden/samples/soul")

# Response pitch rates — mostly unison, occasional harmony
minor_rates = [1, 1, 1, 1, 0.75, 1.189, 1.333, 1.5]
major_rates = [1, 1, 1, 1, 0.75, 1.26, 1.333, 1.5]

# Scan initial key
set :current_key, "Emajor"
set :clips, Dir.glob(D + "/Emajor/*.wav").sort
set :rates, major_rates
set :running, false
set :target_bpm, 95

# --- OSC control ---

live_loop :ctrl_start do
  use_real_time
  sync "/osc*/call-response/start"
  set :running, true
  puts "Call & Response: started (#{get(:current_key)}, #{get(:clips).length} clips)"
end

live_loop :ctrl_stop do
  use_real_time
  sync "/osc*/call-response/stop"
  set :running, false
  puts "Call & Response: stopped"
end

live_loop :ctrl_key do
  use_real_time
  val = sync "/osc*/call-response/key"
  key = val[0].to_s
  found = Dir.glob(D + "/#{key}/*.wav").sort
  if found.length > 0
    set :current_key, key
    set :clips, found
    set :rates, key.include?("major") ? major_rates : minor_rates
    puts "Call & Response: key #{key} (#{found.length} clips)"
  else
    puts "Call & Response: no clips found for #{key}"
  end
end

live_loop :ctrl_bpm do
  use_real_time
  val = sync "/osc*/call-response/bpm"
  set :target_bpm, val[0].to_f
end

# --- Performance ---

# Bar intervals for each call-response pair.
# Dense pairs (2-5 bars) keep the conversation active,
# sparse pairs (8-32 bars) add surprise interjections.
bar_intervals = [2, 3, 4, 5, 6, 8, 10, 14, 20, 28]

with_fx :reverb, room: 0.5, mix: 0.3 do
  bar_intervals.length.times do |idx|
    live_loop "pair_#{idx}".to_sym do
      use_bpm get(:target_bpm)
      if get(:running)
        clips = get(:clips)
        rates = get(:rates)
        total_beats = bar_intervals[idx] * 4
        response_delay = [1, 2, 2, 2, 3].choose

        if clips.length > 0
          # Call — panned left, always natural pitch
          sample clips.choose,
            amp: rrand(0.4, 0.7),
            pan: rrand(-0.7, -0.2)

          sleep response_delay

          # Response — panned right, occasional pitch shift, wetter
          with_fx :reverb, room: 0.6, mix: 0.25 do
            sample clips.choose,
              amp: rrand(0.3, 0.6),
              pan: rrand(0.2, 0.7),
              rate: rates.choose
          end

          sleep total_beats - response_delay
        else
          sleep total_beats
        end
      else
        sleep 0.5
      end
    end
  end
end
