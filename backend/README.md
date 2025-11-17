# NoteHive Backend - Zoom Integration

This backend server integrates Zoom API for scheduling meetings in the NoteHive scheduler.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Zoom Account with API access

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Get Zoom API Credentials

1. Go to [Zoom Marketplace](https://marketplace.zoom.us/)
2. Sign in with your Zoom account
3. Click "Develop" → "Build App"
4. Choose "Server-to-Server OAuth" app type
5. Fill in the app information:
   - App name: NoteHive Scheduler
   - Company name: Your company
   - Developer contact: Your email
6. After creation, you'll get:
   - **Account ID** (found in the app credentials page)
   - **Client ID**
   - **Client Secret**

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
ZOOM_ACCOUNT_ID=your_account_id_here
ZOOM_CLIENT_ID=your_client_id_here
ZOOM_CLIENT_SECRET=your_client_secret_here
PORT=3000
```

**Important:** Never commit the `.env` file to version control. It's already in `.gitignore`.

### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000` (or the PORT you specified).

### 5. Test the Integration

1. Make sure the backend server is running
2. Open the scheduler page in your frontend
3. Create a new meeting with title, date, and time
4. The meeting should be created in Zoom and you'll get a join URL

## API Endpoints

### Health Check
```
GET /health
```
Returns server status.

### Create Zoom Meeting
```
POST /api/zoom/create-meeting
Content-Type: application/json

{
  "title": "OS – CPU Scheduling",
  "date": "2024-12-25",
  "time": "14:30",
  "duration": 60  // optional, defaults to 60 minutes
}
```

**Response:**
```json
{
  "success": true,
  "meeting": {
    "id": "123456789",
    "topic": "OS – CPU Scheduling",
    "start_time": "2024-12-25T14:30:00Z",
    "duration": 60,
    "join_url": "https://zoom.us/j/123456789?pwd=...",
    "start_url": "https://zoom.us/s/123456789?zak=...",
    "password": "123456",
    "meeting_number": "123456789"
  }
}
```

## Troubleshooting

### "Failed to authenticate with Zoom"
- Check that your Zoom credentials in `.env` are correct
- Verify your Zoom app has the necessary permissions
- Make sure your Zoom account has API access enabled

### "Failed to connect to server"
- Ensure the backend server is running
- Check that the `API_BASE_URL` in `schedular.html` matches your backend URL
- For production, update the API URL in the frontend code

### CORS Errors
- The backend includes CORS middleware to allow frontend requests
- If you're hosting frontend and backend on different domains, you may need to configure CORS further

## Security Notes

- Keep your `.env` file secure and never commit it
- Use environment variables for all sensitive data
- In production, use HTTPS for all API calls
- Consider adding rate limiting for production use

## Next Steps

- Add meeting deletion/update endpoints
- Implement user authentication
- Add email notifications for meeting invites
- Store meetings in a database instead of localStorage

