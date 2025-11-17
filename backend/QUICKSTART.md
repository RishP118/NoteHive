# Quick Start Guide - Zoom Integration

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Get Zoom Credentials
1. Visit: https://marketplace.zoom.us/develop/create
2. Create a "Server-to-Server OAuth" app
3. Copy your Account ID, Client ID, and Client Secret

### Step 3: Create .env File
Create `backend/.env`:
```env
ZOOM_ACCOUNT_ID=your_account_id
ZOOM_CLIENT_ID=your_client_id
ZOOM_CLIENT_SECRET=your_client_secret
PORT=3000
```

### Step 4: Start Backend
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### Step 5: Test It!
1. Open `frontend/schedular.html` in your browser
2. Fill in a class title, date, and time
3. Click "Schedule"
4. You should see a Zoom meeting join URL!

## ✅ That's It!

Your scheduler now creates real Zoom meetings automatically!

## 🔧 Troubleshooting

**Backend won't start?**
- Make sure Node.js is installed: `node --version`
- Check that port 3000 is available

**Zoom meeting creation fails?**
- Verify your `.env` credentials are correct
- Check the backend console for error messages
- Make sure your Zoom app has meeting creation permissions

**Frontend can't connect?**
- Ensure backend is running on `http://localhost:3000`
- Check browser console for CORS or connection errors
- Update `API_BASE_URL` in `schedular.html` if using a different port

## 📚 More Info

See `README.md` for detailed documentation.

