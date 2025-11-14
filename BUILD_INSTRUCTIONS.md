# Building the MSI Installer for NIDC Mudlog Reporter

## Overview

This document provides instructions for building the Windows MSI installer for the NIDC Mudlog Reporter Electron application.

## Prerequisites

### System Requirements
- **OS**: Windows 10 or Windows 11
- **Node.js**: v16.0.0 or higher (includes npm)
- **PowerShell**: v5.0 or higher (included with Windows 10+)
- **Disk Space**: At least 2GB free space for dependencies and build artifacts

### Installation

1. **Install Node.js** (if not already installed)
   - Download from https://nodejs.org/
   - Choose the LTS (Long-term Support) version
   - During installation, make sure to check "Add to PATH"

2. **Verify Installation**
   ```powershell
   node --version
   npm --version
   ```

## Building the MSI

### Method 1: Using PowerShell Script (Recommended)

The `build-msi.ps1` script automates the entire build process.

1. **Open PowerShell**
   - Press `Win + X` and select "Windows PowerShell (Admin)"
   - Or search for PowerShell in the Start menu

2. **Navigate to Project Directory**
   ```powershell
   cd path\to\glowing-alpaca-nap
   ```

3. **Run the Build Script**
   ```powershell
   .\build-msi.ps1
   ```

   **Optional Parameters:**
   ```powershell
   # Skip npm install (use if dependencies already installed)
   .\build-msi.ps1 -SkipNpmInstall

   # Enable verbose output
   .\build-msi.ps1 -Verbose

   # Combine parameters
   .\build-msi.ps1 -SkipNpmInstall -Verbose
   ```

### Method 2: Manual Build Steps

If you prefer to run commands manually:

1. **Install Dependencies**
   ```powershell
   npm install
   ```

2. **Build React Frontend**
   ```powershell
   npm run build
   ```

3. **Build MSI Installer**
   ```powershell
   npx electron-builder --win --msi --publish=never
   ```

## Build Output

After successful build, the MSI installer will be located in:
```
dist/NIDC-Mudlog-Reporter-Setup.msi
```

Additional output files:
- `dist/NIDC-Mudlog-Reporter-Setup-version.exe` - NSIS installer (if configured)
- `dist/win-unpacked/` - Unpacked application files

## Testing the Installer

1. **Run the MSI**
   ```powershell
   .\dist\NIDC-Mudlog-Reporter-Setup.msi
   ```

2. **Follow Installation Wizard**
   - Accept license terms
   - Choose installation directory
   - Select installation options
   - Complete installation

3. **Verify Installation**
   - Check Start Menu for application shortcut
   - Run the application
   - Verify functionality

## Troubleshooting

### Issue: "node: command not found"
**Solution**: Node.js is not installed or not in PATH. Reinstall Node.js and ensure "Add to PATH" is checked.

### Issue: "npm install fails with permission denied"
**Solution**: Run PowerShell as Administrator (right-click and select "Run as administrator").

### Issue: "electron-builder: command not found"
**Solution**: Run `npm install --save-dev electron-builder` in the project directory.

### Issue: MSI file not created
**Solution**: 
1. Check build output for errors
2. Ensure you have at least 2GB free disk space
3. Close any security software that might interfere
4. Try running the manual build steps

### Issue: PowerShell execution policy error
**Solution**: Set execution policy for current user:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## GitHub Actions Automated Build

The repository includes GitHub Actions workflows that automatically build and release the MSI installer on new releases:

- **Workflow File**: `.github/workflows/Release.yml`
- **Trigger**: Creating a new GitHub release
- **Output**: MSI artifact available for download from release page

## Configuration

### MSI Configuration
The MSI configuration is defined in `package.json` under the `build.win.msi` section:

```json
{
  "build": {
    "win": {
      "msi": {
        "oneClick": false,
        "perMachine": true,
        "allowToChangeInstallationDirectory": true
      }
    }
  }
}
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review build output logs
3. Open an issue on GitHub repository
4. Include build output and system information in bug reports
