# Vocal Kit - Phase Garden - Sonic Pi Edition
#
# A phasing beatbox: 3 drum kits made of mouth sounds play the
# same 16-step pattern. Kit 1 holds steady while Kits 2 and 3
# drift ahead, creating polyrhythmic textures as the copies
# slide against each other — Piano Phase for a beatbox.
#
# Setup:
#   1. Run this script in Sonic Pi
#   2. Start the OSC bridge: npm run bridge
#   3. Open the browser page and click Start

# *** UPDATE THIS PATH for your system ***
D = File.expand_path("~/_CODE/phase-garden/samples/vocalpercussion")

# Load sample pools
kicks   = Dir.glob(D + "/Kick/*.wav").sort
snares  = Dir.glob(D + "/Snare/*.wav").sort
hihats  = Dir.glob(D + "/Highhat/*.wav").sort
clicks  = Dir.glob(D + "/Click/*.wav").sort
pops    = Dir.glob(D + "/Pop/*.wav").sort
toms    = Dir.glob(D + "/Tom/*.wav").sort
shakers = Dir.glob(D + "/Shaker/*.wav").sort
crashes = Dir.glob(D + "/Crash/*.wav").sort

puts "Vocal Kit loaded: #{kicks.length} kicks, #{snares.length} snares, #{hihats.length} hihats"

# 16-step pattern (2 bars of 4/4 in 8th notes)
#
# Step:  1 . 2 . 3 . 4 .│1 . 2 . 3 . 4 .
kick_p  = [1,0,0,1,0,0,1,0,0,0,1,0,0,1,0,0]
snare_p = [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0]
hh_p    = [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]
click_p = [0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,1]

set :running, false
set :target_bpm, 100
set :drift, 0.0

# --- OSC control ---

live_loop :ctrl_start do
  use_real_time
  sync "/osc*/vocal-kit/start"
  set :running, true
  puts "Vocal Kit: started"
end

live_loop :ctrl_stop do
  use_real_time
  sync "/osc*/vocal-kit/stop"
  set :running, false
  puts "Vocal Kit: stopped"
end

live_loop :ctrl_bpm do
  use_real_time
  val = sync "/osc*/vocal-kit/bpm"
  set :target_bpm, val[0].to_f
end

live_loop :ctrl_drift do
  use_real_time
  val = sync "/osc*/vocal-kit/drift"
  set :drift, val[0].to_f
end

# --- Performance ---

# 3 kits panned left / center / right
3.times do |kit|
  live_loop "kit_#{kit}".to_sym do
    use_bpm get(:target_bpm)
    if get(:running)
      d = get(:drift) * kit  # kit 0 = fixed, kit 1 = 1x drift, kit 2 = 2x
      pan = (kit - 1) * 0.5  # -0.5, 0, 0.5

      16.times do |step|
        # Kick
        if kick_p[step] == 1
          sample kicks.choose, pan: pan, amp: rrand(0.55, 0.7)
        end

        # Snare
        if snare_p[step] == 1
          sample snares.choose, pan: pan, amp: rrand(0.45, 0.6)
        end

        # Hi-hat (with ghost notes on off-steps)
        if hh_p[step] == 1
          sample hihats.choose, pan: pan, amp: rrand(0.25, 0.4)
        elsif rand < 0.3
          sample hihats.choose, pan: pan, amp: rrand(0.08, 0.15)
        end

        # Click accents
        if click_p[step] == 1
          sample clicks.choose, pan: pan, amp: rrand(0.2, 0.35)
        end

        # Occasional pop on offbeats
        if step % 4 == 3 and rand < 0.2
          sample pops.choose, pan: pan, amp: rrand(0.15, 0.3)
        end

        # Rare tom fill
        if step >= 12 and rand < 0.08
          sample toms.choose, pan: pan, amp: rrand(0.25, 0.4)
        end

        # Rare crash on downbeat
        if step == 0 and rand < 0.05
          sample crashes.choose, pan: pan, amp: rrand(0.15, 0.25)
        end

        sleep 0.5 * (1.0 - d)
      end
    else
      sleep 0.5
    end
  end

  # Shaker layer per kit — 16th note feel
  live_loop "shaker_#{kit}".to_sym do
    use_bpm get(:target_bpm)
    if get(:running)
      d = get(:drift) * kit
      pan = (kit - 1) * 0.5

      16.times do
        if rand < 0.4
          sample shakers.choose, pan: pan, amp: rrand(0.06, 0.15)
        end
        sleep 0.25 * (1.0 - d)
      end
    else
      sleep 0.5
    end
  end
end
