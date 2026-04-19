#!/bin/bash
set -e

# yarn injects npm_config_registry=https://registry.yarnpkg.com/ into the
# child env, which overrides .npmrc and routes npm through yarn's proxy
# (the token is only valid against registry.npmjs.org). Unset so npm uses
# its default.
unset npm_config_registry
unset npm_config_user_agent

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# --- Args ---------------------------------------------------------------
DRY_RUN=0
BUMP_TYPE=""
for arg in "$@"; do
    case "$arg" in
        --dry-run) DRY_RUN=1 ;;
        patch|minor|major) BUMP_TYPE="$arg" ;;
        *) echo -e "${RED}Unknown arg: ${arg}${NC}"; exit 1 ;;
    esac
done
BUMP_TYPE="${BUMP_TYPE:-patch}"

# --- Load NPM_TOKEN -----------------------------------------------------
# .npmrc is gitignored and generated here with a literal token, so yarn
# doesn't trip on ${NPM_TOKEN} interpolation at startup. Load from env,
# else fall back to gpt-manager's .env (by convention).
if [ -z "$NPM_TOKEN" ]; then
    GPT_MANAGER_ENV="${GPT_MANAGER_ENV:-$HOME/web/gpt-manager/.env}"
    if [ -f "$GPT_MANAGER_ENV" ]; then
        NPM_TOKEN=$(grep ^NPM_TOKEN= "$GPT_MANAGER_ENV" | head -1 | cut -d= -f2-)
        export NPM_TOKEN
    fi
fi

if [ -z "$NPM_TOKEN" ]; then
    echo -e "${RED}NPM_TOKEN not set and not found in ${GPT_MANAGER_ENV}.${NC}"
    exit 1
fi

# --- Write ephemeral .npmrc --------------------------------------------
NPMRC_PATH="$(pwd)/.npmrc"
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > "$NPMRC_PATH"
trap 'rm -f "$NPMRC_PATH"' EXIT

echo -e "${YELLOW}Checking npm authentication...${NC}"
CURRENT_USER=$(npm whoami)
echo -e "${GREEN}Logged in as: ${CURRENT_USER}${NC}"

if [ "$DRY_RUN" = "1" ]; then
    echo -e "${YELLOW}[dry-run] Skipping version bump, building only.${NC}"
    yarn build
    echo -e "${YELLOW}[dry-run] Running npm publish --dry-run...${NC}"
    npm publish --access public --dry-run
    echo -e "${GREEN}[dry-run] OK.${NC}"
    exit 0
fi

echo -e "${YELLOW}Bumping version (${BUMP_TYPE})...${NC}"

# Build first so version bump doesn't happen if build breaks
echo -e "${YELLOW}Building...${NC}"
yarn build

# Bump version in package.json
npm version $BUMP_TYPE --no-git-tag-version

NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}New version: ${NEW_VERSION}${NC}"

echo -e "${YELLOW}Publishing to npm...${NC}"
if npm publish --access public; then
    echo -e "${GREEN}Published successfully!${NC}"

    echo -e "${YELLOW}Committing and tagging...${NC}"
    git add package.json
    git commit -m "v${NEW_VERSION}"
    git tag "v${NEW_VERSION}"
    git push
    git push --tags

    echo -e "${GREEN}Done! Published v${NEW_VERSION}${NC}"
else
    echo -e "${RED}Publish failed!${NC}"
    echo -e "${YELLOW}Rolling back version in package.json...${NC}"
    git checkout package.json
    exit 1
fi
