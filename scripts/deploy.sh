#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

git fetch origin main
git reset --hard origin/main

if [[ -f ./client/.env ]]; then
  set -a
  # shellcheck disable=SC1091
  source ./client/.env
  set +a
fi

export COMPOSE_BAKE=false
docker compose up --build -d
docker compose ps
