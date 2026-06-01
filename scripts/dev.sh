#!/usr/bin/env bash
# Starts the dev server with the Node/npm versions required by this repo.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [[ -s "$NVM_DIR/nvm.sh" ]]; then
  # shellcheck source=/dev/null
  . "$NVM_DIR/nvm.sh"
  nvm install
  nvm use
else
  echo "nvm not found. Install Node 22+ from https://nodejs.org/"
  exit 1
fi

echo "Node: $(node -v)"
echo "npm:  $(npm -v)"

npm install -g npm@latest
npm install
npm run dev
