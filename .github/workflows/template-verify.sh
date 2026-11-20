#!/usr/bin/env bash
# Verifies that a Copier render is a project we would hand out.
#
#   template-verify.sh <rendered-dir> <registry-token-answer>
#
# The token argument must be the placeholder the render was given, never a real
# token: the secrets check proves it stays inside the rendered .env. Run it by
# hand after `copier copy` when a template change trips CI.

set -euo pipefail

rendered=${1:?usage: template-verify.sh <rendered-dir> <registry-token-answer>}
sentinel_token=${2:?missing registry token answer}

failed=0

# Report an error annotation and count the failure.
fail() {
  printf '::error::%s\n' "$*" >&2
  failed=$((failed + 1))
}

# Assert a file contains a fixed string: <file> <needle> <message>.
contains() {
  grep -qF -- "$2" "$1" || fail "$3"
}

# The render must contain the Coasti manifest, carrying the product_id answer.
check_coasti_yml() {
  [ -f "$rendered/coasti.yml" ] || fail 'Rendered project has no coasti.yml'
  contains "$rendered/coasti.yml" 'id: ci_example' \
    'coasti.yml does not carry the rendered product_id'
}

# Both manifests must carry the same version answer; they are rendered from
# the same question, so a mismatch means one of the two lost it.
check_version() {
  local pkg manifest
  pkg=$(sed -n 's/^ *"version": *"\([^"]*\)".*/\1/p' "$rendered/package.json")
  manifest=$(sed -n 's/^version: *"\([^"]*\)".*/\1/p' "$rendered/coasti.yml")
  [ "$pkg" = "$manifest" ] ||
    fail "package.json has version '$pkg' but coasti.yml has '$manifest'"
}

# No .jinja files and no unresolved answers may survive the render.
check_syntax() {
  local leftovers
  leftovers=$(find "$rendered" -name '*.jinja' -print -quit)
  [ -z "$leftovers" ] || fail "Rendered project still contains .jinja files: $leftovers"

  # JSX inline styles legitimately contain "{{", so this looks for Jinja block
  # tags and unresolved answers rather than for braces.
  ! grep -rInI -E '\{%|\{\{[[:space:]]*(product_id|product_name|id_shorthand|product_description|registry_ro_token|_copier_conf)' "$rendered" ||
    fail 'Rendered project contains unrendered template syntax'
}

# The token answer belongs in .env only, and .gitignore must cover .env.
check_secrets() {
  local leaks
  leaks=$(grep -rIl -F -- "$sentinel_token" "$rendered" | grep -vxF "$rendered/.env" || true)
  [ -z "$leaks" ] || fail "Rendered project leaks the registry token outside .env: $leaks"

  [ -f "$rendered/.env" ] || fail 'Rendered project has no .env'
  contains "$rendered/.env" "$sentinel_token" \
    '.env does not carry the registry token answer'

  # Line-exact: ".env.*" alone would not ignore ".env".
  grep -qx -- '.env' "$rendered/.gitignore" ||
    fail 'The rendered .gitignore does not ignore .env'
}

# A product ships exactly one workflow, ci.yml, and every local action that
# workflow uses must have shipped too.
check_workflows() {
  local workflow="$rendered/.github/workflows/ci.yml" target shipped
  shipped=$(find "$rendered/.github/workflows" -maxdepth 1 -type f -printf '%f\n' | sort | tr '\n' ' ')
  [ "$shipped" = 'ci.yml ' ] || {
    fail "Rendered workflows should be exactly 'ci.yml', found: $shipped"
    return
  }

  # actionlint checks expressions but not local paths, so a renamed action
  # would otherwise pass silently.
  while IFS= read -r target; do
    [ -n "$target" ] || continue
    [ -e "$rendered/${target#./}" ] ||
      fail "Rendered workflow references a missing action: $target"
  done < <(grep -oE 'uses: \./[^[:space:]]+' "$workflow" | sed 's/^uses: //')
}

# A check keeps going after fail, so one run lists every problem in that area.
# The counter is compared instead of the return status because set -e is off
# inside the if-condition, where a `||` list only reports its last command; it
# increments so that a later failing check is not hidden by an earlier one.
run() {
  local name=${1#check_} before=$failed
  "$@" || failed=$((failed + 1))
  if [ "$failed" = "$before" ]; then
    printf 'ok    %s\n' "$name"
  else
    printf 'FAIL  %s\n' "$name"
  fi
}

run check_coasti_yml
run check_version
run check_syntax
run check_secrets
run check_workflows

if [ "$failed" -ne 0 ]; then
  fail 'The rendered project does not pass the template contract.'
  exit 1
fi
