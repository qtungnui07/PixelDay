#!/bin/sh
set -eu

attempt=1
until node dist/migrate.js; do
  if [ "$attempt" -ge 30 ]; then
    echo "Migration failed after $attempt attempts"
    exit 1
  fi

  echo "Waiting for database before migration... ($attempt/30)"
  attempt=$((attempt + 1))
  sleep 2
done

exec node dist/index.js
