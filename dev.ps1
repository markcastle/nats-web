# PowerShell Development Script for NATS Web Client

Write-Host "Starting NATS Web Client development server..." -ForegroundColor Green

# Navigate to the project directory (if needed)
# Uncomment the next line if you need to change directory
# Set-Location -Path "path\to\nats-web"

# Start the development server
npm run dev

# This line will only execute if the server is stopped
Write-Host "Development server stopped." -ForegroundColor Yellow 