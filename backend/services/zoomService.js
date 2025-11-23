import axios from 'axios';
import jwt from 'jsonwebtoken';

const ZOOM_API_KEY = process.env.ZOOM_API_KEY;
const ZOOM_API_SECRET = process.env.ZOOM_API_SECRET;
const ZOOM_USER_ID = process.env.ZOOM_USER_ID;

const generateZoomToken = () => {
  return jwt.sign({ iss: ZOOM_API_KEY, exp: Math.floor(Date.now() / 1000) + 60 * 5 }, ZOOM_API_SECRET);
};

const createMeeting = async ({ title, date, time, duration }) => {
  try {
    const meetingStartTime = `${date}T${time}:00`;
    const token = generateZoomToken();
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
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );
    return { success: true, meetingId: response.data.id, joinUrl: response.data.join_url, startUrl: response.data.start_url };
  } catch (error) {
    console.error("Zoom API Error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data || "Zoom API error" };
  }
};

export default { createMeeting };
