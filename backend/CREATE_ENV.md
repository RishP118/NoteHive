# Quick Setup: Create .env File for Zoom Integration

## ✅ Backend Server Status
Your backend server is **running** on `http://localhost:3000` ✅

## 🔑 Next Step: Add Zoom Credentials

To enable Zoom meeting creation, you need to create a `.env` file with your Zoom API credentials.

### Step 1: Create .env File

In the `backend` directory, create a file named `.env`:

```bash
cd /home/rishp11/Documents/NoteHive/backend
nano .env
```

Or use any text editor you prefer.

### Step 2: Add This Content

```env
ZOOM_ACCOUNT_ID=your_account_id_here
ZOOM_CLIENT_ID=your_client_id_here
ZOOM_CLIENT_SECRET=your_client_secret_here
PORT=3000
```

### Step 3: Get Zoom Credentials

1. **Go to Zoom Marketplace:**
   - Visit: https://marketplace.zoom.us/
   - Sign in with your Zoom account

2. **Create an App:**
   - Click "Develop" → "Build App"
   - Choose **"Server-to-Server OAuth"** app type
   - Fill in:
     - App name: `NoteHive Scheduler`
     - Company: Your name/company
     - Email: Your email

3. **Get Credentials:**
   - After creating, go to "Credentials" tab
   - Copy:
     - **Account ID** (at the top) 
     - **Client ID**  HSg9D1_R96sw24_LbPJlw
     - **Client Secret**  lpYWGZnEyOJ9ngbpwKzDBfnc4DQhOt3U
     

4. **Add Permissions:**
   - Go to "Scopes" tab
   - Add: `meeting:write:admin`
   - Click "Activate" button

5. **Update .env File:**
   - Replace `your_account_id_here` with your Account ID
   - Replace `your_client_id_here` with your Client ID
   - Replace `your_client_secret_here` with your Client Secret

### Step 4: Restart Server

After creating `.env` file, restart the server:

```bash
# Stop current server (Ctrl+C if running in terminal)
# Then start again:
cd /home/rishp11/Documents/NoteHive/backend
npm start
```

## 🧪 Test It

1. Open `frontend/schedular.html` in your browser
2. Create a meeting
3. You should now get a Zoom meeting link! 🎉

## ⚠️ Without Zoom Credentials

Even without Zoom credentials, the server will:
- ✅ Run successfully
- ✅ Accept API requests
- ❌ But Zoom meeting creation will fail

The scheduler will still save meetings locally, but won't create Zoom meetings.

## 🆘 Troubleshooting

**Server not starting?**
- Make sure you're in the `backend` directory
- Check: `node --version` (should be v14+)
- Run: `npm install` if needed

**Zoom creation still failing?**
- Verify `.env` file exists and has correct values
- Check for typos in credentials
- Make sure Zoom app is activated
- Check server console for error messages

