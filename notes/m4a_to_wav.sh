#!/usr/bin/env bash

shopt -s nullglob   # avoid literal *.m4a if none exist (bash-specific)

for f in *.m4a; do
  out="${f%.m4a}.wav"
  echo "Converting: $f -> $out"
  ffmpeg -y -i "$f" -acodec pcm_s16le -ar 44100 "$out"
done

