#!/bin/bash

# Print Node.js version
echo "Using Node.js version: $(node -v)"
echo "Using npm version: $(npm -v)"

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the project
echo "Building the project..."
# Skip TypeScript type checking for the build
echo "Skipping TypeScript type checking..."
npx vite build

echo "Build completed successfully!" 