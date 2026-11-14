#!/usr/bin/env bash
set -euo pipefail
project_id="${1:-}"
if [[ ! "$project_id" =~ ^[a-z][a-z0-9-]{4,28}[a-z0-9]$ ]]; then
  echo 'Usage: bash deploy.sh YOUR_FIREBASE_PROJECT_ID' >&2
  exit 1
fi
cd "$(dirname "$0")"
command -v gcloud >/dev/null || { echo 'Run this in Google Cloud Shell.' >&2; exit 1; }
gcloud projects describe "$project_id" --format='value(projectId)' >/dev/null
if ! gcloud firestore databases describe --project="$project_id" --database='(default)' --format='value(name)' >/dev/null 2>&1; then
  echo 'Create the default Firestore database in Native mode in Firebase Console first, then run again.' >&2
  exit 1
fi
npm --prefix functions install --omit=dev
# Firebase prompts privately for the key; it is never written into source.
npx --yes firebase-tools functions:secrets:set GEMINI_API_KEY --project "$project_id"
npx --yes firebase-tools deploy --only functions:alter --project "$project_id"
# Quota documents contain only counts and a hashed address, never messages.
gcloud firestore fields ttls update expiresAt --collection-group=alterQuota --enable-ttl --project="$project_id" --quiet
printf '\nDeployment complete. Send Codex the HTTPS URL for alterAdvice printed above.\n'
printf 'Do not send the Gemini API key.\n'
