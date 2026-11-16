#!/usr/bin/env bash
set -euo pipefail

# Puppeteer's VP9 default derives a low encoder-speed setting from CPU count.
# Use the fast realtime setting for QA recordings in small containers.
args=("$@")
for ((i = 0; i + 1 < ${#args[@]}; i++)); do
  if [[ ${args[i]} == '-cpu-used' ]]; then
    args[i + 1]=8
  fi
done
exec "${FFMPEG_BIN:-/usr/bin/ffmpeg}" "${args[@]}"
