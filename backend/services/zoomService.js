
import axios from 'axios';

const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;
const ZOOM_USER_ID = process.env.ZOOM_USER_ID;

// Get OAuth access token from Zoom
const getZoomAccessToken = async () => {
  try {
    const response = await axios.post('https://zoom.us/oauth/token', null, {
      params: {
        grant_type: 'account_credentials',
        account_id: ZOOM_ACCOUNT_ID
      },
      auth: {
        username: ZOOM_CLIENT_ID,
        password: ZOOM_CLIENT_SECRET
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Zoom OAuth Error:', {
      message: error.message,
      response: error.response?.data,
      config: error.config,
      env: {
        ZOOM_ACCOUNT_ID,
        ZOOM_CLIENT_ID,
        ZOOM_CLIENT_SECRET,
        ZOOM_USER_ID
      }
    });
    throw new Error('Failed to get Zoom access token');
  }
};

const createMeeting = async ({ title, date, time, duration }) => {
  try {
    const meetingStartTime = `${date}T${time}:00`;
    const accessToken = await getZoomAccessToken();
    const response = await axios.post(
      `https://api.zoom.us/v2/users/${ZOOM_USER_ID}/meetings`,
      {
        topic: title,
        type: 2,
        start_time: meetingStartTime,
        duration: duration || 30,
        timezone: "Asia/Kolkata",
        settings: { host_video: true, participant_video: true, join_before_host: false, mute_upon_entry: true }
      },
      { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
    );
    return { success: true, meetingId: response.data.id, joinUrl: response.data.join_url, startUrl: response.data.start_url };
  } catch (error) {
    console.error("Zoom API Error:", {
      message: error.message,
      response: error.response?.data,
      config: error.config,
      accessToken,
      ZOOM_USER_ID
    });
    return { success: false, error: error.response?.data || "Zoom API error" };
  }
};

export default { createMeeting };
