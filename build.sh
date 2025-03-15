#!/bin/bash

# Build script for NATS Web Client

echo "Building NATS Web Client..."

# Install dependencies
npm install

# Build the application
npm run build

echo "Build complete! The application is ready to be deployed."
echo "The built files are in the 'dist' directory."
echo ""
echo "To deploy to Cloudflare Pages:"
echo "1. Push your code to a Git repository"
echo "2. Connect the repository to Cloudflare Pages"
echo "3. Set the build command to 'npm run build'"
echo "4. Set the build output directory to 'dist'"
echo ""
echo "For local testing, you can run: npx serve -s dist" 