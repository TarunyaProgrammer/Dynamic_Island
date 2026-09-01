# justfile — Beacon command runner (Electron + TypeScript)
# Usage: just <command>

# Default: list available commands
default:
    @just --list

# Install dependencies
setup:
    npm install

# Start development server with hot reload
dev:
    npm run dev

# Run all unit tests
test:
    npm test

# Watch unit tests
test-watch:
    npm run test:watch

# Typecheck and build production assets
build:
    npm run build

# Package desktop application (.dmg & .zip)
package:
    npm run package

# Clean build artifacts
clean:
    rm -rf dist dist-electron release
    @echo "Cleaned build artifacts."
