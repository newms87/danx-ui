#!/bin/bash
# Lint Vue and TypeScript files after Edit/Write

# Read JSON input from stdin
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Only lint .vue and .ts files
if [[ "$FILE_PATH" != *.vue && "$FILE_PATH" != *.ts ]]; then
  exit 0
fi

# Run eslint --fix
yarn lint --fix "$FILE_PATH" 2>&1

exit 0
