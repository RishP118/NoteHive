const axios = require('axios');
const settings = require('../config/settings');

// Cache for access token (Zoom tokens expire after 1 hour)
let accessToken = null;
let tokenExpiry = null;

/**
 * Get Zoom OAuth access token
 * Uses Server-to-Server OAuth (recommended for server-side apps)
 */
async function getZoomAccessToken() {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  if (!settings.ZOOM_ACCOUNT_ID || !settings.ZOOM_CLIENT_ID || !settings.ZOOM_CLIENT_SECRET) {
    throw new Error('Zoom credentials not configured');
  }

  try {
    const authString = Buffer.from(`${settings.ZOOM_CLIENT_ID}:${settings.ZOOM_CLIENT_SECRET}`).toString('base64');
    
    const response = await axios.post(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${settings.ZOOM_ACCOUNT_ID}`,
      {},
      {
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    accessToken = response.data.access_token;
    // Set expiry to 50 minutes (tokens last 1 hour, refresh early)
    tokenExpiry = Date.now() + (50 * 60 * 1000);
    
    return accessToken;
  } catch (error) {
    console.error('Error getting Zoom access token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Zoom');
  }
}

/**
 * Create a Zoom meeting
 */
exports.createMeeting = async (meetingData) => {
  try {
    const token = await getZoomAccessToken();
    
    // Format date and time for Zoom
    const { title, date, time, duration = 60 } = meetingData;
    const [year, month, day] = date.split('-');
    const [hours, minutes] = time.split(':');
    
    // Create ISO 8601 datetime string
    const startTime = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00`).toISOString();
    
    const meetingPayload = {
      topic: title,
      type: 2, // Scheduled meeting
      start_time: startTime,
      duration: duration, // in minutes
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: false,
        watermark: false,
        use_pmi: false,
        approval_type: 0, // Automatically approve
        audio: 'both',
        auto_recording: 'none'
      }
    };

    const response = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      meetingPayload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      meeting: {
        id: response.data.id,
        topic: response.data.topic,
        start_time: response.data.start_time,
        duration: response.data.duration,
        join_url: response.data.join_url,
        start_url: response.data.start_url,
        password: response.data.password,
        meeting_number: response.data.id
      }
    };
  } catch (error) {
    console.error('Error creating Zoom meeting:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to create Zoom meeting'
    };
  }
};

