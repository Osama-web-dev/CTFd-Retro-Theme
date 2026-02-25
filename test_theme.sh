#!/usr/bin/env bash
# =================================================================
# EPISODE ZERO — Full Theme Validation Script v2
# Run inside Docker: docker exec ctfd-ctfd-1 bash /opt/CTFd/test_theme.sh
# =================================================================
set -e

BASE="http://localhost:8000"
PASS=0; FAIL=0
LOG="/tmp/ez_test_$(date +%s).log"

G='\033[0;32m'; R='\033[0;31m'; Y='\033[1;33m'; C='\033[0;36m'; N='\033[0m'

ok()   { printf "${G}[PASS]${N} %s\n" "$*" | tee -a "$LOG"; ((PASS++)); }
fail() { printf "${R}[FAIL]${N} %s\n" "$*" | tee -a "$LOG"; ((FAIL++)); }
warn() { printf "${Y}[WARN]${N} %s\n" "$*" | tee -a "$LOG"; }
info() { printf "${C}[INFO]${N} %s\n" "$*" | tee -a "$LOG"; }

http_ok() {
  local label="$1" url="$2"
  local code; code=$(wget -q -O /dev/null -S "$url" 2>&1 | grep "HTTP/" | tail -1 | awk '{print $2}' || echo "000")
  if [[ "$code" == "200" || "$code" == "302" || "$code" == "301" ]]; then
    ok "$label → HTTP $code"
  else
    fail "$label → HTTP $code  ($url)"
  fi
}

html_contains() {
  local label="$1" url="$2" needle="$3"
  if wget -q -O - "$url" 2>/dev/null | grep -q "$needle"; then
    ok "$label → '$needle' found"
  else
    fail "$label → '$needle' NOT found"
  fi
}

asset_ok() {
  local label="$1" url="$2"
  local code; code=$(wget -q -O /dev/null -S "$url" 2>&1 | grep "HTTP/" | tail -1 | awk '{print $2}' || echo "000")
  if [[ "$code" == "200" ]]; then
    ok "$label → 200"
  else
    fail "$label → $code"
  fi
}

echo "================================================================" | tee "$LOG"
echo " Episode Zero Theme Validation — $(date)"                         | tee -a "$LOG"
echo "================================================================" | tee -a "$LOG"
echo ""

# ── Pages ────────────────────────────────────────────────────────
info "=== PAGE AVAILABILITY ==="
http_ok "Homepage"          "$BASE/"
http_ok "Login"             "$BASE/login"
http_ok "Register"          "$BASE/register"
http_ok "Challenges"        "$BASE/challenges"
http_ok "Scoreboard"        "$BASE/scoreboard"
http_ok "Users listing"     "$BASE/users"
http_ok "Notifications"     "$BASE/notifications"

# ── Static Assets ─────────────────────────────────────────────────
THEME="$BASE/themes/CTFd-theme-pixo-main/static"
info "=== STATIC ASSETS ==="
asset_ok "pixo-supreme.min.css"    "$THEME/css/pixo-supreme.min.css"
asset_ok "episode-engine.min.js"   "$THEME/js/episode-engine.min.js"
asset_ok "login-cinematic.min.js"  "$THEME/js/login-cinematic.min.js"
asset_ok "core.min.js"             "$THEME/js/core.min.js"
asset_ok "helpers.min.js"          "$THEME/js/helpers.min.js"
asset_ok "vendor.bundle.min.js"    "$THEME/js/vendor.bundle.min.js"

# ── HTML Injection Check ───────────────────────────────────────────
info "=== HTML INJECTION ==="
html_contains "pixo-supreme.css in homepage"    "$BASE/" "pixo-supreme"
html_contains "episode-engine.js in homepage"   "$BASE/" "episode-engine"
html_contains "anime.min.js CDN in homepage"    "$BASE/" "animejs"
html_contains "login-cinematic.js in homepage"  "$BASE/" "login-cinematic"
html_contains "ez-cinematic-overlay div"         "$BASE/" "ez-cinematic-overlay"
html_contains "Scoreboard crown"                "$BASE/scoreboard" "ez-crown"

# ── CSS Token Check ────────────────────────────────────────────────
info "=== CSS DESIGN TOKENS ==="
CSS=$(wget -q -O - "$THEME/css/pixo-supreme.min.css" 2>/dev/null || echo "")
if echo "$CSS" | grep -q "accent-magenta"; then
  ok "Design tokens present in CSS"
else
  fail "Design tokens missing from CSS"
fi
if echo "$CSS" | grep -q "accent-cyan"; then
  ok "Cyan token present"
else
  fail "Cyan token missing"
fi

# ── API Endpoints ──────────────────────────────────────────────────
info "=== CTFd API ==="
API_STATUS=$(wget -q -O /dev/null -S "$BASE/api/v1/challenges" 2>&1 | grep "HTTP/" | tail -1 | awk '{print $2}' || echo "000")
if [[ "$API_STATUS" == "200" || "$API_STATUS" == "302" || "$API_STATUS" == "403" ]]; then
  ok "Challenges API → $API_STATUS (reachable)"
else
  fail "Challenges API → $API_STATUS"
fi

SCB_STATUS=$(wget -q -O /dev/null -S "$BASE/api/v1/scoreboard/top/10" 2>&1 | grep "HTTP/" | tail -1 | awk '{print $2}' || echo "000")
if [[ "$SCB_STATUS" == "200" || "$SCB_STATUS" == "302" || "$SCB_STATUS" == "403" ]]; then
  ok "Scoreboard API → $SCB_STATUS (reachable)"
else
  fail "Scoreboard API → $SCB_STATUS"
fi

# ── Summary ────────────────────────────────────────────────────────
echo ""
echo "================================================================" | tee -a "$LOG"
printf " Results: ${G}%d PASSED${N}  ${R}%d FAILED${N}\n" $PASS $FAIL | tee -a "$LOG"
echo " Full log: $LOG"                                                   | tee -a "$LOG"
echo "================================================================" | tee -a "$LOG"

[[ "$FAIL" -gt 0 ]] && exit 1 || exit 0
