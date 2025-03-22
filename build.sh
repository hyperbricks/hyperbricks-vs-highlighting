#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Clean previous build artifacts
echo "Cleaning previous builds..."
rm -rf dist

# Install dependencies
echo "Installing dependencies..."
npm install

# Compile the project (if using TypeScript)
echo "Compiling the project..."
npm run compile

# Package the extension using vsce
echo "Packaging the extension..."
npm run package

echo "Build complete!"
