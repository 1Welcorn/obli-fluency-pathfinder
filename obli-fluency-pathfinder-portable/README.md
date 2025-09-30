# OBLI Fluency Pathfinder - Portable Version

This is a portable version of the OBLI Fluency Pathfinder application that can run without requiring Node.js installation or complex setup.

## 🚀 Quick Start

### Option 1: Run with Local Server (Recommended)
1. **Double-click** `start-server.bat` (Windows) or run `start-server.ps1` (PowerShell)
2. Open your browser and go to: `http://localhost:3000`
3. The application will load and be fully functional

### Option 2: Open Directly in Browser
1. **Double-click** `index-standalone.html`
2. The application will open in your default browser
3. Note: Some features may not work due to CORS restrictions

## 📁 What's Included

- `index.html` - Main application file (for server use)
- `index-standalone.html` - Standalone version (direct browser use)
- `assets/` - All JavaScript bundles and resources
- `start-server.js` - Simple HTTP server
- `start-server.bat` - Windows batch file to start server
- `start-server.ps1` - PowerShell script to start server
- `404.html` - Custom 404 page for SPA routing

## 🔧 Requirements

- **Node.js** (for server version) - Download from [nodejs.org](https://nodejs.org/)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## 🌐 Features

- ✅ **Offline capable** - Works without internet connection
- ✅ **Cross-platform** - Runs on Windows, Mac, Linux
- ✅ **No installation required** - Just download and run
- ✅ **Self-contained** - All dependencies included
- ✅ **SPA routing** - Full single-page application functionality

## 🛠️ Troubleshooting

### Server won't start?
- Make sure Node.js is installed
- Check if port 3000 is available
- Try running `node start-server.js` directly

### App doesn't load?
- Check browser console for errors
- Try the standalone version (`index-standalone.html`)
- Clear browser cache and reload

### CORS errors?
- Use the server version instead of opening HTML directly
- The server handles CORS headers properly

## 📱 Usage

1. **Start the server** using one of the provided scripts
2. **Open your browser** and navigate to `http://localhost:3000`
3. **Use the application** - all features should work normally
4. **Stop the server** by pressing `Ctrl+C` in the terminal

## 🔒 Security Note

This portable version is designed for local use. The server only accepts connections from localhost for security.

## 📞 Support

If you encounter any issues:
1. Check the console output for error messages
2. Try the alternative startup methods
3. Ensure all files are present in the directory

---

**Version:** 0.0.0  
**Build Date:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Git Commit:** 21ae95332d78132251f8ad039ff676b7a49ecd03

