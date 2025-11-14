# MSI Build Script for NIDC Mudlog Reporter
# This PowerShell script automates the building of the Windows MSI installer
# Using electron-builder for professional MSI package creation

param(
    [string]$ProjectRoot = (Get-Location),
    [switch]$SkipNpmInstall = $false,
    [switch]$Verbose = $false
)

# Enable error handling
$ErrorActionPreference = "Stop"
$VerbosePreference = if ($Verbose) { "Continue" } else { "SilentlyContinue" }

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NIDC Mudlog Reporter - MSI Build Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Validate Environment
Write-Host "[1/5] Validating build environment..." -ForegroundColor Yellow

if (-not (Test-Path $ProjectRoot)) {
    Write-Error "Project root directory not found: $ProjectRoot"
    exit 1
}

# Check for Node.js
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Error "Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
}
Write-Host "  NodeJS found: $nodeVersion" -ForegroundColor Green

# Check for npm/pnpm
$npmVersion = npm --version 2>$null
if (-not $npmVersion) {
    Write-Error "npm is not installed with Node.js."
    exit 1
}
Write-Host "  npm found: $npmVersion" -ForegroundColor Green

# Step 2: Install/Update Dependencies
Write-Host ""
Write-Host "[2/5] Installing project dependencies..." -ForegroundColor Yellow

Set-Location $ProjectRoot

if ($SkipNpmInstall) {
    Write-Host "  Skipping npm install (--SkipNpmInstall flag set)" -ForegroundColor Yellow
} else {
    Write-Host "  Installing with npm..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "npm install failed with exit code $LASTEXITCODE"
        exit 1
    }
    Write-Host "  Dependencies installed successfully" -ForegroundColor Green
}

# Step 3: Build React Frontend
Write-Host ""
Write-Host "[3/5] Building React frontend..." -ForegroundColor Yellow

Write-Host "  Building production React bundle..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "npm run build failed with exit code $LASTEXITCODE"
    exit 1
}
Write-Host "  React frontend built successfully" -ForegroundColor Green

# Step 4: Verify electron-builder
Write-Host ""
Write-Host "[4/5] Verifying electron-builder setup..." -ForegroundColor Yellow

$builderVersion = npx electron-builder --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Installing electron-builder..." -ForegroundColor Cyan
    npm install --save-dev electron-builder
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install electron-builder"
        exit 1
    }
}
Write-Host "  electron-builder verified" -ForegroundColor Green

# Step 5: Build MSI Installer
Write-Host ""
Write-Host "[5/5] Building Windows MSI installer..." -ForegroundColor Yellow
Write-Host "  This may take a few minutes..." -ForegroundColor Cyan
Write-Host ""

npx electron-builder --win --msi --publish=never
if ($LASTEXITCODE -ne 0) {
    Write-Error "electron-builder MSI creation failed with exit code $LASTEXITCODE"
    exit 1
}

# Step 6: Verify Output
Write-Host ""
Write-Host "[6/6] Verifying MSI output..." -ForegroundColor Yellow

$distDir = Join-Path $ProjectRoot "dist"
$msiFiles = Get-ChildItem $distDir -Filter "*.msi" -ErrorAction SilentlyContinue

if ($msiFiles) {
    Write-Host "  MSI installer(s) created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Generated files:" -ForegroundColor Cyan
    foreach ($msi in $msiFiles) {
        $size = [math]::Round($msi.Length / 1MB, 2)
        Write-Host "    - $($msi.Name) ($size MB)" -ForegroundColor White
    }
} else {
    Write-Error "No MSI files found in dist directory"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "MSI Build Completed Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test the MSI installer by running it" -ForegroundColor White
Write-Host "  2. Upload to GitHub release" -ForegroundColor White
Write-Host "  3. Create a signed version if needed" -ForegroundColor White
