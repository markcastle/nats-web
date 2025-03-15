# PowerShell Build Script for NATS Web Client

Write-Host "Building NATS Web Client..." -ForegroundColor Green

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Build the application
Write-Host "Building application..." -ForegroundColor Yellow
npm run build

Write-Host "Build complete! The application is ready to be deployed." -ForegroundColor Green
Write-Host "The built files are in the 'dist' directory." -ForegroundColor Cyan
Write-Host ""
Write-Host "To deploy to Cloudflare Pages:" -ForegroundColor Magenta
Write-Host "1. Push your code to a Git repository" -ForegroundColor White
Write-Host "2. Connect the repository to Cloudflare Pages" -ForegroundColor White
Write-Host "3. Set the build command to 'npm run build'" -ForegroundColor White
Write-Host "4. Set the build output directory to 'dist'" -ForegroundColor White
Write-Host ""
Write-Host "For local testing, you can run: npx serve -s dist" -ForegroundColor Yellow 