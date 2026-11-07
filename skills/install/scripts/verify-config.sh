#!/usr/bin/env bash
# Checks an Opem install the way the widget does: GET /api/v1/widget/config with the page's Origin
# and the project's publishable key. Prints the status, the error code when there is one, and what
# to do about it. Exit 0 on 200, 1 otherwise.
#
# The base url is the host the widget script loads from: `scriptOrigin` in get_install_snippet's
# result, or the scheme and host in the `src` of the snippet the developer pasted. It defaults to
# https://support.opem.app; pass it whenever the snippet names another host, because a key is valid
# only on the deployment that issued it.
#
# The call carries `X-Opem-Probe: 1`, so Opem answers it as usual without recording the origin as
# "seen": only a real page load counts as seen.
#
#   bash verify-config.sh <origin> <publishable key> [base url]
#   bash verify-config.sh http://localhost:3000 pk_abc123 https://support.opem.app
set -u
origin="${1:-}"
key="${2:-}"
base="${3:-https://support.opem.app}"
base="${base%/}"
if [ -z "$origin" ] || [ -z "$key" ]; then
  echo "usage: verify-config.sh <origin, such as http://localhost:3000> <publishable key, pk_…> [base url, the host in the snippet's src; default https://support.opem.app]" >&2
  exit 2
fi
case "$key" in pk_*) ;; *) echo "The key should start with pk_; a secret key (sk_) or a verification secret (vs_) never goes in the browser." >&2; exit 2;; esac
body="$(mktemp)"
headers="$(mktemp)"
trap 'rm -f "$body" "$headers"' EXIT
# On a connection failure curl prints 000 itself and exits non-zero.
status="$(curl -sS -o "$body" -D "$headers" -w '%{http_code}' -H "Origin: $origin" -H "X-Opem-Project: $key" -H "X-Opem-Probe: 1" -H "Accept: application/json" "$base/api/v1/widget/config" 2>>"$body")" || true
[ -z "$status" ] && status=000
echo "GET $base/api/v1/widget/config"
echo "Origin: $origin"
# A deployment behind Vercel Authentication answers with Vercel's sign-in page or a redirect to it,
# whatever the key. Say so before reading the status, and never print that page: it carries a nonce.
location="$(tr -d '\r' <"$headers" | grep -i '^location:' | tail -1 | cut -d: -f2- | sed 's/^[[:space:]]*//')"
protected=0
if grep -qF -e 'Vercel Authentication' -e '_vercel_sso_nonce' "$body"; then protected=1; fi
case "$status" in 3??) case "$location" in *vercel.com/sso-api*) protected=1 ;; esac ;; esac
if [ "$protected" -eq 1 ]; then
  echo "Status: $status"
  echo "The deployment at $base is protected by Vercel Authentication. The widget cannot load from any origin and the key cannot be checked; use the production host or turn protection off for this domain."
  exit 1
fi
code="$(grep -o '"code" *: *"[a-z_]*"' "$body" | head -1 | cut -d'"' -f4)"
echo "Status: $status${code:+ ($code)}"
case "$status" in
  200) echo "The key is live and the origin is allowed. The body is the project's public settings (project name, features, kinds, theme)."
       grep -o '"name":"[^"]*"' "$body" | head -1 | sed 's/"name":"/Project: /; s/"$//'
       echo "This check is not a page load: the Install tab says \"Seen from <origin>\" only after a page with the widget loads."
       exit 0 ;;
  403) if [ "$code" = "origin_not_allowed" ]; then echo "Add $origin on the project's Configuration page, Origins tab (scheme, host and port; no path)."; else echo "Refused: $code."; fi ;;
  401) if [ "$code" = "unauthenticated" ]; then
         echo "The key is unknown or revoked on $base. A key is valid only on the deployment that issued it: check that $base is the host in your snippet's src, then copy the current publishable key from that dashboard's Configuration page, Keys tab."
       else
         echo "Refused with 401:"; head -c 400 "$body"; echo
       fi ;;
  429) echo "Rate limited; wait for Retry-After and try again." ;;
  000) echo "No answer from $base. Check the base URL and the network." ;;
  *)   echo "Unexpected answer:"; head -c 400 "$body"; echo ;;
esac
exit 1
