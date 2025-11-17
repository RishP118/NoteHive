# Node.js Backend Setup Guide

## ✅ Step 1: Dependencies Installed
All required packages have been installed successfully!

## 📝 Step 2: Create Environment File

You need to create a `.env` file with your Zoom API credentials.

### Option A: Create manually
Create a file named `.env` in the `backend` directory with this content:

```env
ZOOM_ACCOUNT_ID=your_account_id_here
ZOOM_CLIENT_ID=your_client_id_here
ZOOM_CLIENT_SECRET=your_client_secret_here
PORT=3000
```

### Option B: Copy from template
```bash
cd backend
cp .env.example .env
# Then edit .env and add your credentials
```

## 🔑 Step 3: Get Zoom API Credentials

1. **Go to Zoom Marketplace:**
   - Visit: https://marketplace.zoom.us/
   - Sign in with your Zoom account

2. **Create an App:**
   - Click "Develop" → "Build App"
   - Choose **"Server-to-Server OAuth"** app type
   - Fill in app details:
     - App name: `NoteHive Scheduler`
     - Company name: Your name/company
     - Developer email: Your email

3. **Get Credentials:**
   - After creating the app, go to the "Credentials" tab
   - Copy:
     - **Account ID** (found at the top)
     - **Client ID**
     - **Client Secret**

4. **Add Permissions:**
   - Go to "Scopes" tab
   - Add these scopes:
     - `meeting:write:admin` (or `meeting:write` for basic)
     - `meeting:read:admin` (optional, for reading meetings)

5. **Activate the App:**
   - Click "Activate" button at the bottom

## 🚀 Step 4: Run the Server

### Development Mode (with auto-reload):
```bash
cd backend
npm run dev
```

### Production Mode:
```bash
cd backend
npm start
```

You should see:
```
🚀 NoteHive backend server running on http://localhost:3000
📋 Health check: http://localhost:3000/health
```

## 🧪 Step 5: Test the Server

1. **Check if server is running:**
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"status":"ok","message":"NoteHive backend is running"}`

2. **Test in browser:**
   - Open: http://localhost:3000/health
   - You should see a JSON response

3. **Test Zoom integration:**
   - Open `frontend/schedular.html` in your browser
   - Create a meeting with title, date, and time
   - Click "Schedule"
   - You should get a Zoom meeting join URL!

## 📋 Common Commands

```bash
# Install dependencies
npm install

# Start server (production)
npm start

# Start server (development with auto-reload)
npm run dev

# Check if Node.js is installed
node --version

# Check if npm is installed
npm --version
```

## ⚠️ Troubleshooting

### "Cannot find module"
- Run `npm install` again
- Make sure you're in the `backend` directory

### "Port 3000 already in use"
- Change PORT in `.env` to a different number (e.g., 3001)
- Or stop the process using port 3000

### "Failed to authenticate with Zoom"
- Double-check your credentials in `.env`
- Make sure there are no extra spaces
- Verify your Zoom app is activated

### "Failed to connect to server" (in frontend)
- Make sure backend is running
- Check that `API_BASE_URL` in `schedular.html` matches your backend URL
- For different port, update: `const API_BASE_URL = 'http://localhost:YOUR_PORT';`

## 🎉 You're All Set!

Once the server is running, your scheduler will automatically create Zoom meetings!

