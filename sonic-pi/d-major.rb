# D Major - Phase Garden - Sonic Pi Edition
#
# 14 sine loops with slightly different lengths (23.5-29.9 seconds),
# each playing 1-4 note figures in D major. The different lengths
# cause voices to drift in and out of phase.
#
# Setup:
#   1. Run this script in Sonic Pi
#   2. Start the OSC bridge: npm run bridge
#   3. Open the browser page and click Start

set :running, false

live_loop :ctrl_start do
  use_real_time
  sync "/osc*/d-major/start"
  set :running, true
  puts "D Major: started"
end

live_loop :ctrl_stop do
  use_real_time
  sync "/osc*/d-major/stop"
  set :running, false
  puts "D Major: stopped"
end

# [loop_length_seconds, [notes]]
configs = [
  [23.5,    [:D3]],
  [24.25,   [:A3, :Fs4]],
  [25.0,    [:E3, :G3, :B3]],
  [25.5,    [:D4]],
  [26.0,    [:G3, :B3, :D4, :Fs4]],
  [26.5,    [:A3, :Cs4]],
  [27.0,    [:Fs3, :A3, :D4]],
  [27.375,  [:B3]],
  [27.75,   [:E4, :G4, :B4, :D5]],
  [28.25,   [:Cs4, :E4]],
  [28.625,  [:G3, :D4, :A4]],
  [29.0,    [:Fs4]],
  [29.5,    [:D3, :A3, :Fs4, :D5]],
  [29.9375, [:B3, :E4, :G4]]
]

with_fx :reverb, room: 0.7, mix: 0.4 do
  configs.length.times do |idx|
    live_loop "dmaj_#{idx}".to_sym do
      use_bpm 60  # 1 beat = 1 second
      if get(:running)
        length = configs[idx][0]
        notes = configs[idx][1]
        spacing = (length - 2.0) / notes.length

        notes.each do |n|
          synth :sine, note: n,
            attack: 0.8, decay: 0.5, sustain_level: 0.6,
            sustain: 0.7, release: 2.0, amp: 0.15
          sleep spacing
        end
        sleep 2.0
      else
        sleep 1
      end
    end
  end
end
