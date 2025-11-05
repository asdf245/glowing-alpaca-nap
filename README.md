# Welcome to your Dyad app

## How to Build and Create an Installer

1. **Build the React frontend:**
   ```
   npm run build
   ```
   This generates the production-ready frontend in the `dist` folder.

2. **Package the Electron app and create the installer:**
   ```
   npx electron-builder
   ```
   This uses your `build` configuration in `package.json` to generate platform-specific installers (e.g., `.exe` for Windows, `.dmg` for macOS, `.AppImage` for Linux) in the `dist` directory.

3. **Distribute the installer:**
   - Share the generated installer file (e.g., `NIDC-Mudlog-Reporter-Setup.exe`, `.dmg`, or `.AppImage`) with your users.

### Customization

- **Windows:**  
  The installer uses NSIS by default. You can customize options like icons, shortcuts, and installation directory in the `win` and `nsis` sections.

- **macOS:**  
  The installer uses DMG and ZIP. Set your app icon in the `mac` section.

- **Linux:**  
  The installer uses AppImage and DEB. Set your app icon and category in the `linux` section.

- **Advanced:**  
  For more options, see the [electron-builder documentation](https://www.electron.build/configuration.html).