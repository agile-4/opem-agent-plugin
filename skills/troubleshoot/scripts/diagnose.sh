#!/usr/bin/env bash
# Diagnoses an Opem install: calls /config as the widget does (the install skill's verify-config.sh)
# and, given a page URL, checks which of the five Content-Security-Policy sources the page's header
# lacks. The header is read from the final response after redirects; a policy in a <meta> tag is
# not seen. CSP_HEADER in the environment replaces the fetch (the tests use it).
#
#   bash diagnose.sh <origin> <publishable key> [page url] [base url]
set -u
origin="${1:-}"; key="${2:-}"; page="${3:-}"; base="${4:-https://support.opem.app}"
if [ -z "$origin" ] || [ -z "$key" ]; then
  echo "usage: diagnose.sh <origin> <publishable key> [page url] [base url]" >&2
  exit 2
fi
here="$(cd "$(dirname "$0")" && pwd)"
config=0
if [ -z "${CSP_HEADER+x}" ]; then
  echo "== /config as the widget calls it =="
  bash "$here/../../install/scripts/verify-config.sh" "$origin" "$key" "$base"
  config=$?
fi
if [ -n "$page" ] || [ -n "${CSP_HEADER+x}" ]; then
  echo
  echo "== Content-Security-Policy of ${page:-the given header} =="
  if [ -n "${CSP_HEADER+x}" ]; then
    header="$CSP_HEADER"
  else
    # The last header block is the final response's, after any redirect.
    header="$(curl -sSIL "$page" | awk 'BEGIN{RS="\r?\n\r?\n"} {last=$0} END{print last}' | grep -i '^content-security-policy:' | head -1 | cut -d: -f2-)"
  fi
  if [ -z "$header" ]; then
    echo "No Content-Security-Policy header: nothing blocks the widget. A policy in a <meta> tag is not checked here."
  else
    missing=0
    # Directives are separated by ";"; a source counts only inside its own directive.
    check() { # directive source
      if printf '%s' "$header" | tr ';' '\n' | grep -iE "^[[:space:]]*$1([[:space:]]|$)" | grep -qF -- "$2"; then
        echo "ok       $1 $2"
      else
        echo "missing  $1 $2"; missing=1
      fi
    }
    check script-src "$base"
    check connect-src "$base"
    check connect-src https://vercel.com
    check connect-src wss://ws-eu.pusher.com
    check img-src "blob:"
    [ $missing -eq 0 ] && echo "The policy allows every source the widget uses."
    [ $missing -eq 1 ] && config=1
  fi
fi
exit $config
