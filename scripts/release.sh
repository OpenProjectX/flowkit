#!/usr/bin/env bash
# Publish all unpublished public packages to npm with provenance.
# Used instead of `changeset publish` because pnpm's publish path fails
# provenance verification with a misleading E404 (npm CLI works fine).
set -euo pipefail

pnpm -r --sort build

for pkg in packages/*/; do
    manifest="$pkg/package.json"
    [ -f "$manifest" ] || continue
    private=$(node -p "require('./$manifest').private ?? false")
    [ "$private" = "true" ] && continue

    name=$(node -p "require('./$manifest').name")
    version=$(node -p "require('./$manifest').version")
    published=$(npm view "${name}@${version}" version --registry=https://registry.npmjs.org 2>/dev/null || true)

    if [ "$published" = "$version" ]; then
        echo "⏭  ${name}@${version} already published, skipping"
    else
        echo "🚀 Publishing ${name}@${version}"
        (cd "$pkg" && npm publish --registry=https://registry.npmjs.org --access public --provenance)
    fi
done
