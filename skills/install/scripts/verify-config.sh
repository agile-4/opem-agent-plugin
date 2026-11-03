#!/usr/bin/env bash
# Checks an Opem install the way the widget does: GET /api/v1/widget/config with the page's Origin
# and the project's publishable key. Prints the status, the error code when there is one, and what
# to do about it. Exit 0 on 200, 1 otherwise.
#
#   bash verify-config.sh <origin> <publishable key> [base url]
#   bash verify-config.sh http://localhost:3000 pk_live_abc123
set -u
origin="${1:-}"
key="${2:-}"
base="${3:-https://support.opem.app}"
if [ -z "$origin" ] || [ -z "$key" ]; then
  echo "usage: verify-config.sh <origin, such as http://localhost:3000> <publishable key, pk_…> [base url]" >&2
  exit 2
fi
case "$key" in pk_*) ;; *) echo "The key should start with pk_; a secret key (sk_) or a verification secret (vs_) never goes in the browser." >&2; exit 2;; esac
body="$(mktemp)"
trap 'rm -f "$body"' EXIT
# On a connection failure curl prints 000 itself and exits non-zero.
status="$(curl -sS -o "$body" -w '%{http_code}' -H "Origin: $origin" -H "X-Opem-Project: $key" -H "Accept: application/json" "$base/api/v1/widget/config" 2>>"$body")" || true
[ -z "$status" ] && status=000
code="$(grep -o '"code":"[a-z_]*"' "$body" | head -1 | cut -d'"' -f4)"
echo "GET $base/api/v1/widget/config"
echo "Origin: $origin"
echo "Status: $status${code:+ ($code)}"
case "$status" in
  200) echo "The key is live and the origin is allowed. The body is the project's public settings (project name, features, kinds, theme)."
       grep -o '"name":"[^"]*"' "$body" | head -1 | sed 's/"name":"/Project: /; s/"$//'
       exit 0 ;;
  403) if [ "$code" = "origin_not_allowed" ]; then echo "Add $origin on the project's Configuration page, Origins tab (scheme, host and port; no path)."; else echo "Refused: $code."; fi ;;
  401) echo "The key is unknown or revoked. Copy the current publishable key from the Configuration page, Keys tab." ;;
  429) echo "Rate limited; wait for Retry-After and try again." ;;
  000) echo "No answer from $base. Check the base URL and the network." ;;
  *)   echo "Unexpected answer:"; head -c 400 "$body"; echo ;;
esac
exit 1
