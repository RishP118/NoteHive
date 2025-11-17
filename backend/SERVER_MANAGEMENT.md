# Server Management Guide

## 🚀 Quick Commands

Instead of using `npm start` directly, use the helper script for easier server management:

### Start Server
```bash
cd /home/rishp11/Documents/NoteHive/backend
./start-server.sh start
```

### Stop Server
```bash
./start-server.sh stop
```

### Restart Server
```bash
./start-server.sh restart
```

### Check Status
```bash
./start-server.sh status
```

## 📋 Manual Commands (Alternative)

If you prefer to manage manually:

### Check if port is in use
```bash
lsof -ti :3000
```

### Kill process on port 3000
```bash
lsof -ti :3000 | xargs kill
```

### Start server
```bash
npm start
```

### Start in background
```bash
npm start &
```

## ⚠️ Common Issue: Port Already in Use

If you see `EADDRINUSE: address already in use :::3000`:

**Quick Fix:**
```bash
cd /home/rishp11/Documents/NoteHive/backend
./start-server.sh restart
```

**Or manually:**
```bash
# Kill existing process
lsof -ti :3000 | xargs kill

# Start server
npm start
```

## 🔍 Troubleshooting

### Server won't start
1. Check if port is in use: `lsof -ti :3000`
2. Kill existing process: `lsof -ti :3000 | xargs kill`
3. Try starting again: `npm start`

### Server not responding
1. Check status: `./start-server.sh status`
2. Check server logs in terminal
3. Verify `.env` file exists (if using Zoom)

### Multiple server instances
```bash
# Find all node processes
ps aux | grep node

# Kill all node server processes
pkill -f "node.*server.js"
```

## 💡 Tips

- **Always check status before starting:** `./start-server.sh status`
- **Use the helper script** - it handles port conflicts automatically
- **Check terminal output** for error messages
- **Restart after changing `.env` file** to load new credentials

