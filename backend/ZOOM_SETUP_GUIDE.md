# Complete Guide: Creating Zoom Server-to-Server OAuth App

## 📋 Step-by-Step Instructions

### Step 1: Access Zoom Marketplace

1. **Open your web browser**
2. **Go to:** https://marketplace.zoom.us/
3. **Sign in** with your Zoom account
   - If you don't have a Zoom account, create one at https://zoom.us/signup
   - You need a Zoom account (free or paid) to create apps

### Step 2: Navigate to Developer Section

1. Once signed in, look for **"Develop"** in the top navigation menu
2. Click on **"Develop"** → **"Build App"**
   - Or go directly to: https://marketplace.zoom.us/develop/create

### Step 3: Choose App Type

1. You'll see different app types:
   - **OAuth** (for user authorization)
   - **Server-to-Server OAuth** ← **SELECT THIS ONE**
   - **JWT** (deprecated)
   - **SDK** (for embedded apps)

2. **Click on "Server-to-Server OAuth"**
   - This is the recommended type for server-side applications
   - No user interaction required
   - Perfect for automated meeting creation

### Step 4: Fill in App Information

Fill out the required information:

#### Basic Information:
- **App Name:** `NoteHive Scheduler` (or any name you prefer)
- **Company Name:** Your name or organization
- **Developer Contact Information:**
  - **Email:** Your email address
  - **Name:** Your name

#### App Category:
- Select: **"Education"** or **"Other"**

#### Description:
- **Short Description:** "Automated Zoom meeting creation for NoteHive study platform"
- **Long Description:** (Optional) More details about your app

#### Developer Information:
- Fill in your contact details

### Step 5: Configure App Settings

After creating the app, you'll be taken to the app configuration page.

#### A. Add Scopes (Permissions)

1. **Click on the "Scopes" tab** (or "Permissions" tab)
2. **Click "Add Scopes"**
3. **Search for and select:**
   - ✅ `meeting:write:admin` - **REQUIRED** (Create and manage meetings)
   - ✅ `meeting:read:admin` - Optional (Read meeting information)
   - ✅ `user:read:admin` - Optional (Read user information)

4. **Click "Done"** or "Save"

#### B. Activate Your App

1. **Scroll to the bottom of the page**
2. **Click the "Activate" button**
   - This activates your app and makes it ready to use
   - You'll see a confirmation message

### Step 6: Get Your Credentials

1. **Click on the "Credentials" tab** (or "App Credentials")

2. **You'll see three important values:**

   ```
   Account ID: xxxxxxxxxx
   Client ID: xxxxxxxxxxxxxxxxxxxxxx
   Client Secret: xxxxxxxxxxxxxxxxxxxxxx
   ```

3. **Copy these values** - You'll need them for your `.env` file

   ⚠️ **IMPORTANT:** 
   - Keep these credentials **SECRET**
   - Never commit them to version control
   - The Client Secret is only shown once - save it immediately!

### Step 7: Add Credentials to Your Project

1. **Open your `.env` file** in the backend directory:
   ```bash
   cd /home/rishp11/Documents/NoteHive/backend
   nano .env
   ```

2. **Paste your credentials:**
   ```env
   ZOOM_ACCOUNT_ID=paste_your_account_id_here
   ZOOM_CLIENT_ID=paste_your_client_id_here
   ZOOM_CLIENT_SECRET=paste_your_client_secret_here
   PORT=3000
   ```

3. **Save the file** (Ctrl+X, then Y, then Enter in nano)

### Step 8: Restart Your Backend Server

1. **Stop the current server** (if running):
   - Press `Ctrl+C` in the terminal where it's running
   - Or find and kill the process

2. **Start the server again:**
   ```bash
   cd /home/rishp11/Documents/NoteHive/backend
   npm start
   ```

3. **You should see:**
   ```
   🚀 NoteHive backend server running on http://localhost:3000
   📋 Health check: http://localhost:3000/health
   ```
   (No warning about missing credentials)

### Step 9: Test the Integration

1. **Open your scheduler:**
   - Open `frontend/schedular.html` in your browser

2. **Create a test meeting:**
   - Fill in: Title, Date, Time
   - Click "Schedule"

3. **Expected Result:**
   - ✅ Success message: "Zoom meeting created successfully!"
   - ✅ Zoom meeting link displayed
   - ✅ Meeting appears in "Upcoming Classes" with Zoom link

## 🔍 Visual Guide (What You'll See)

### Zoom Marketplace Homepage
```
┌─────────────────────────────────────┐
│  Zoom Marketplace                   │
│  [Develop ▼] [Documentation] ...   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Build App                  │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### App Type Selection
```
┌─────────────────────────────────────┐
│  Choose App Type                    │
│                                     │
│  [OAuth]                            │
│  [Server-to-Server OAuth] ← SELECT │
│  [JWT]                              │
│  [SDK]                              │
└─────────────────────────────────────┘
```

### Credentials Page
```
┌─────────────────────────────────────┐
│  App Credentials                    │
│                                     │
│  Account ID:                        │
│  ┌─────────────────────────────┐   │
│  │ xxxxxxxxxx                  │   │
│  └─────────────────────────────┘   │
│                                     │
│  Client ID:                         │
│  ┌─────────────────────────────┐   │
│  │ xxxxxxxxxxxxxxxxxxxxxx      │   │
│  └─────────────────────────────┘   │
│                                     │
│  Client Secret:                     │
│  ┌─────────────────────────────┐   │
│  │ xxxxxxxxxxxxxxxxxxxxxx      │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Copy] [Regenerate]                 │
└─────────────────────────────────────┘
```

## ⚠️ Common Issues & Solutions

### Issue 1: "App not activated"
**Solution:** Make sure you clicked the "Activate" button at the bottom of the app configuration page.

### Issue 2: "Invalid credentials"
**Solution:** 
- Double-check you copied the credentials correctly
- Make sure there are no extra spaces in your `.env` file
- Verify the Account ID, Client ID, and Client Secret match exactly

### Issue 3: "Insufficient permissions"
**Solution:**
- Go back to "Scopes" tab
- Make sure `meeting:write:admin` is added and saved
- Reactivate the app if needed

### Issue 4: "Client Secret not shown"
**Solution:**
- If you lost the Client Secret, you can regenerate it
- Click "Regenerate" next to Client Secret
- **Warning:** Regenerating will invalidate the old secret
- Update your `.env` file with the new secret

### Issue 5: "Account ID not found"
**Solution:**
- The Account ID is usually at the top of the Credentials page
- It's different from your Zoom account email
- It's a unique identifier for your Zoom account

## 🔒 Security Best Practices

1. **Never commit `.env` file to Git**
   - It's already in `.gitignore`
   - Double-check before committing

2. **Keep credentials private**
   - Don't share them in screenshots
   - Don't paste them in chat/email

3. **Use environment variables**
   - Always use `.env` file
   - Never hardcode credentials in code

4. **Rotate credentials if compromised**
   - Regenerate Client Secret if needed
   - Update `.env` file immediately

## ✅ Verification Checklist

- [ ] Zoom account created and signed in
- [ ] Server-to-Server OAuth app created
- [ ] App name and details filled in
- [ ] `meeting:write:admin` scope added
- [ ] App activated
- [ ] Credentials copied (Account ID, Client ID, Client Secret)
- [ ] `.env` file created with credentials
- [ ] Backend server restarted
- [ ] Test meeting created successfully
- [ ] Zoom link received and displayed

## 🎉 Success Indicators

When everything is set up correctly, you'll see:

1. **Backend Server:**
   ```
   🚀 NoteHive backend server running on http://localhost:3000
   📋 Health check: http://localhost:3000/health
   ```
   (No warning about missing credentials)

2. **Scheduler Page:**
   - Green success message
   - Zoom meeting link displayed
   - Copy button works
   - Meeting appears in list with Zoom badge

3. **Browser Console:**
   - No CORS errors
   - Successful API response
   - Meeting data includes `join_url`

## 📞 Need Help?

If you encounter issues:
1. Check the backend server console for error messages
2. Check browser console (F12) for frontend errors
3. Verify `.env` file format is correct
4. Ensure Zoom app is activated
5. Verify scopes are added correctly

---

**Next Steps:** After setting up, try creating a meeting in your scheduler to test the Zoom integration!

