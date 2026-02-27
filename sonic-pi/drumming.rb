# Drumming - Steve Reich (1970-71)
# Phase Garden - Sonic Pi Edition
#
# Four parts with interlocking voices playing the same 12-beat
# rhythmic pattern at different phase offsets.
#
# Setup:
#   1. Run this script in Sonic Pi
#   2. Start the OSC bridge: npm run bridge
#   3. Open the browser page and click Start
#
# OSC messages:
#   /drumming/start
#   /drumming/stop
#   /drumming/bpm <float>
#   /drumming/part <float>      (1=bongos, 2=marimbas, 3=glocks, 4=all)
#   /drumming/density <float>   (0-100)

# *** UPDATE THIS PATH for your system ***
D = "~/_CODE/phase-garden/dirt-samples"

# Reich's basic 12-beat rhythmic pattern
# X . . X . . X . X . X .  (positions 0, 3, 6, 8, 10)
pat = [1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0]

set :running, false
set :target_bpm, 168
set :active_part, 4
set :density, 100

define :hit do |i, offset|
  pat[(i - offset) % 12] == 1
end

# --- OSC control listeners ---

live_loop :ctrl_start do
  use_real_time
  sync "/osc*/drumming/start"
  set :running, true
  puts "Drumming: started"
end

live_loop :ctrl_stop do
  use_real_time
  sync "/osc*/drumming/stop"
  set :running, false
  puts "Drumming: stopped"
end

live_loop :ctrl_bpm do
  use_real_time
  val = sync "/osc*/drumming/bpm"
  set :target_bpm, val[0].to_f
end

live_loop :ctrl_part do
  use_real_time
  val = sync "/osc*/drumming/part"
  set :active_part, val[0].to_i
  puts "Drumming: part #{val[0].to_i}"
end

live_loop :ctrl_density do
  use_real_time
  val = sync "/osc*/drumming/density"
  set :density, val[0].to_f
end

# --- Performance ---

with_fx :reverb, room: 0.4, mix: 0.3 do
  live_loop :drumming do
    use_bpm get(:target_bpm)
    if get(:running)
      part = get(:active_part)
      dens = get(:density) / 100.0

      12.times do |i|

        # Part 1: Tuned bongos — tabla samples (4 voices at offsets 0, 1, 3, 6)
        if part == 1 or part == 4
          if hit(i, 0) and rand < dens
            sample D + "/bongos/bongo1.wav", pan: -0.3, amp: 0.6
          end
          if hit(i, 1) and rand < dens
            sample D + "/bongos/bongo2.wav", pan: -0.1, amp: 0.55
          end
          if hit(i, 3) and rand < dens
            sample D + "/bongos/bongo3.wav", pan: 0.1, amp: 0.5
          end
          if hit(i, 6) and rand < dens
            sample D + "/bongos/bongo4.wav", pan: 0.3, amp: 0.45
          end
        end

        # Part 2: Marimbas — wood block pitched to F Ab C Eb F Ab
        # (6 voices at offsets 0, 2, 4, 5, 7, 9)
        if part == 2 or part == 4
          if hit(i, 0) and rand < dens
            sample D + "/marimbas/marimbaB3.wav", rate: 0.63, pan: -0.4, amp: 0.7
          end
          if hit(i, 2) and rand < dens
            sample D + "/marimbas/marimbaB5.wav", rate: 0.79, pan: -0.2, amp: 0.65
          end
          if hit(i, 4) and rand < dens
            sample D + "/marimbas/marimbaE4.wav", rate: 1.0, pan: 0, amp: 0.6
          end
          if hit(i, 5) and rand < dens
            sample D + "/marimbas/marimbaG4.wav", rate: 1.19, pan: 0.1, amp: 0.6
          end
          if hit(i, 7) and rand < dens
            sample D + "/east/000_nipon_wood_block.wav", rate: 1.33, pan: 0.2, amp: 0.55
          end
          if hit(i, 9) and rand < dens
            sample D + "/east/000_nipon_wood_block.wav", rate: 1.59, pan: 0.4, amp: 0.55
          end
        end

        # Part 3: Glockenspiels — metal samples pitched to different notes
        # (5 voices at offsets 0, 2, 4, 6, 8)
        if part == 3 or part == 4
          if hit(i, 0) and rand < dens
            sample D + "/glock/glockenspielA2.wav", rate: 1.0, pan: -0.2, amp: 0.35
          end
          if hit(i, 2) and rand < dens
            sample D + "/glock/glockenspielA3.wav", rate: 1.0, pan: -0.1, amp: 0.35
          end
          if hit(i, 4) and rand < dens
            sample D + "/glock/glockenspielF6.wav", rate: 1.0, pan: 0, amp: 0.3
          end
          if hit(i, 6) and rand < dens
            sample D + "/glock/glockenspielG.wav", rate: 1.0, pan: 0.1, amp: 0.3
          end
          if hit(i, 8) and rand < dens
            sample D + "/glock/glockenspielToy.wav", rate: 1.0, pan: 0.2, amp: 0.28
          end
        end

        sleep 0.5
      end
    else
      sleep 0.5
    end
  end
end
