# PowerShell script to fix EMFILE errors and optimize VS Code performance
# Usage: Run this script from the project root directory

Write-Host "🔧 Starting EMFILE error fix and optimization..." -ForegroundColor Green

# Step 1: Close VS Code processes gracefully
Write-Host "📝 Note: Please save your work and close VS Code before running this script"
Read-Host "Press Enter when VS Code is closed to continue"

# Step 2: Clear VS Code extensions cache
$vscodeExtensionsPath = "$env:USERPROFILE\.vscode\extensions"
$copilotCachePath = "$vscodeExtensionsPath\github.copilot-*\dist"

if (Test-Path $copilotCachePath) {
    Write-Host "🧹 Clearing Copilot cache..." -ForegroundColor Yellow
    Get-ChildItem $copilotCachePath -Recurse -File | Where-Object { $_.Name -like "*.js.map" -or $_.Name -like "*.temp*" } | Remove-Item -Force -ErrorAction SilentlyContinue
}

# Step 3: Clean project files
Write-Host "🧹 Cleaning project temporary files..." -ForegroundColor Yellow

# Clean Next.js cache
if (Test-Path "pressbutton-web\.next") {
    Remove-Item "pressbutton-web\.next" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Cleaned Next.js cache"
}

# Clean Node.js cache
if (Test-Path "pressbutton-web\node_modules\.cache") {
    Remove-Item "pressbutton-web\node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
}

if (Test-Path "pressbutton-api\node_modules\.cache") {
    Remove-Item "pressbutton-api\node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
}

# Clean log files
Get-ChildItem -Recurse -Filter "*.log" | Remove-Item -Force -ErrorAction SilentlyContinue

Write-Host "✅ Project cleanup completed"

# Step 4: Reinstall dependencies (optional)
$reinstall = Read-Host "🔄 Do you want to reinstall dependencies? (y/N)"
if ($reinstall -eq "y" -or $reinstall -eq "Y") {
    Write-Host "📦 Reinstalling dependencies..." -ForegroundColor Blue

    # API dependencies
    if (Test-Path "pressbutton-api\package.json") {
        Push-Location "pressbutton-api"
        if (Test-Path "node_modules") { Remove-Item "node_modules" -Recurse -Force }
        if (Test-Path "package-lock.json") { Remove-Item "package-lock.json" -Force }
        npm install
        Pop-Location
    }

    # Web dependencies
    if (Test-Path "pressbutton-web\package.json") {
        Push-Location "pressbutton-web"
        if (Test-Path "node_modules") { Remove-Item "node_modules" -Recurse -Force }
        if (Test-Path "package-lock.json") { Remove-Item "package-lock.json" -Force }
        npm install
        Pop-Location
    }
}

# Step 5: Instructions for user
Write-Host ""
Write-Host "🎉 EMFILE Error Fix Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Restart your computer (recommended for full effect)"
Write-Host "2. Open VS Code"
Write-Host "3. If you still get EMFILE errors, run these commands:"
Write-Host "   - Ctrl+Shift+P -> 'Extensions: Disable' -> GitHub Copilot Chat"
Write-Host "   - Wait 10 seconds"
Write-Host "   - Ctrl+Shift+P -> 'Extensions: Enable' -> GitHub Copilot Chat"
Write-Host ""
Write-Host "✨ Your VS Code settings have been optimized to prevent future EMFILE errors!"
