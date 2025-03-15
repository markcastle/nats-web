# PowerShell Deployment Script for NATS Web Client to Cloudflare Pages

Write-Host "Preparing NATS Web Client for Cloudflare Pages deployment..." -ForegroundColor Green

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Build the application
Write-Host "Building application..." -ForegroundColor Yellow
npm run build

Write-Host "Build complete! The application is ready to be deployed to Cloudflare Pages." -ForegroundColor Green
Write-Host ""

# Check if Wrangler CLI is installed
$wranglerInstalled = $null
try {
    $wranglerInstalled = Get-Command npx wrangler -ErrorAction SilentlyContinue
} catch {
    $wranglerInstalled = $null
}

if ($wranglerInstalled) {
    Write-Host "Would you like to deploy to Cloudflare Pages using Wrangler? (Y/N)" -ForegroundColor Cyan
    $deployNow = Read-Host
    
    if ($deployNow -eq "Y" -or $deployNow -eq "y") {
        Write-Host "Deploying to Cloudflare Pages..." -ForegroundColor Magenta
        npx wrangler pages publish dist
    } else {
        Write-Host "Manual deployment instructions:" -ForegroundColor Yellow
        Write-Host "1. Push your code to a Git repository" -ForegroundColor White
        Write-Host "2. Connect the repository to Cloudflare Pages" -ForegroundColor White
        Write-Host "3. Set the build command to 'npm run build'" -ForegroundColor White
        Write-Host "4. Set the build output directory to 'dist'" -ForegroundColor White
    }
} else {
    Write-Host "Wrangler CLI not found. You can install it with: npm install -g wrangler" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Manual deployment instructions:" -ForegroundColor Yellow
    Write-Host "1. Push your code to a Git repository" -ForegroundColor White
    Write-Host "2. Connect the repository to Cloudflare Pages" -ForegroundColor White
    Write-Host "3. Set the build command to 'npm run build'" -ForegroundColor White
    Write-Host "4. Set the build output directory to 'dist'" -ForegroundColor White
}

Write-Host ""
Write-Host "For local testing, you can run: npx serve -s dist" -ForegroundColor Cyan 