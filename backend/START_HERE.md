# 🚀 Quick Start - Node.js Backend

## What You Have Now ✅
- ✅ Node.js installed (v14.21.3)
- ✅ npm installed (v6.14.18)
- ✅ All dependencies installed
- ✅ Backend code ready

## What You Need to Do Next

### 1️⃣ Create `.env` File

In the `backend` directory, create a file named `.env`:

```bash
cd /home/rishp11/Documents/NoteHive/backend
nano .env
# or use any text editor
```

Add this content (replace with your actual Zoom credentials):

```env
ZOOM_ACCOUNT_ID=your_account_id_here
ZOOM_CLIENT_ID=your_client_id_here
ZOOM_CLIENT_SECRET=your_client_secret_here
PORT=3000
```

### 2️⃣ Get Zoom Credentials

1. Visit: **https://marketplace.zoom.us/develop/create**
2. Create **"Server-to-Server OAuth"** app
3. Copy Account ID, Client ID, Client Secret
4. Add scopes: `meeting:write:admin`
5. Activate the app

### 3️⃣ Start the Server

```bash
cd /home/rishp11/Documents/NoteHive/backend
npm start
```

You'll see:
```
🚀 NoteHive backend server running on http://localhost:3000
```

### 4️⃣ Test It!

1. Open `frontend/schedular.html` in browser
2. Create a meeting
3. Get Zoom join URL! 🎉

## 📚 More Help

- **Detailed setup:** See `SETUP.md`
- **Quick reference:** See `QUICKSTART.md`
- **Full docs:** See `README.md`

## 🆘 Need Help?

- Check `SETUP.md` for troubleshooting
- Make sure `.env` file exists and has correct credentials
- Verify backend is running on port 3000

