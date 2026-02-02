#!/bin/bash
set -e

# NOTE: npm now requires granular tokens with 2FA, max 90-day lifetime
# Classic tokens have been revoked. If auth fails, you'll need to:
# 1. Run `npm login` to create a new granular token
# 2. Complete 2FA verification
# See: https://gh.io/all-npm-classic-tokens-revoked

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Checking npm authentication...${NC}"

# Check if logged in by trying to get current user
if ! npm whoami &>/dev/null; then
    echo -e "${RED}Not logged in to npm or token expired.${NC}"
    echo -e "${YELLOW}Please log in to npm:${NC}"
    npm login

    # Verify login succeeded
    if ! npm whoami &>/dev/null; then
        echo -e "${RED}Login failed. Aborting.${NC}"
        exit 1
    fi
fi

CURRENT_USER=$(npm whoami)
echo -e "${GREEN}Logged in as: ${CURRENT_USER}${NC}"

# Get the version bump type (default to patch)
BUMP_TYPE=${1:-patch}

if [[ ! "$BUMP_TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo -e "${RED}Invalid version bump type: ${BUMP_TYPE}${NC}"
    echo "Usage: ./scripts/publish.sh [patch|minor|major]"
    exit 1
fi

echo -e "${YELLOW}Bumping version (${BUMP_TYPE})...${NC}"

# Build first to catch any errors before version bump
echo -e "${YELLOW}Building...${NC}"
yarn build

# Bump version (this updates package.json)
npm version $BUMP_TYPE --no-git-tag-version

# Get the new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}New version: ${NEW_VERSION}${NC}"

# Publish to npm
echo -e "${YELLOW}Publishing to npm...${NC}"
if npm publish; then
    echo -e "${GREEN}Published successfully!${NC}"

    # Git operations
    echo -e "${YELLOW}Committing and tagging...${NC}"
    git add .
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
