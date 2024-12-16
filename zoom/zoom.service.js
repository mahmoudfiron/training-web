import fetch from "node-fetch";
import base64 from "base-64";
import express from "express";
import cors from "cors";

const zoomAccountId = "ovHq-65wS1OZh6bpAcV6jg";
const zoomClientId = "uquiuGESEqaXHTrI8bPGw";
const zoomClientSecret = "oXXKcKBTT5aVtIsKiZ9E8IWzXA8XhKH6";

// Initialize Express App
const app = express();
app.use(cors());
app.use(express.json());

const getAuthHeaders = () => {
    return {
        Authorization: `Basic ${base64.encode(
            `${zoomClientId}:${zoomClientSecret}`
        )}`,
        "Content-Type": "application/json",
    };
};

const generateZoomAccessToken = async () => {
    try {
        const response = await fetch(
            `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${zoomAccountId}`,
            {
                method: "POST",
                headers: getAuthHeaders(),
            }
        );

        const jsonResponse = await response.json();

        return jsonResponse?.access_token;
    } catch (error) {
        console.log("generateZoomAccessToken Error --> ", error);
        throw error;
    }
};

const generateZoomMeeting = async (lessonData) => {
    try {
        const zoomAccessToken = await generateZoomAccessToken();

        const response = await fetch(
            `https://api.zoom.us/v2/users/me/meetings`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${zoomAccessToken}`,
                },
                body: JSON.stringify({
                    agenda: lessonData.agenda || "Lesson Zoom Meeting",
                    default_password: false,
                    duration: lessonData.duration || 60,
                    password: "12345",

                    settings: {
                        allow_multiple_devices: true,
                        host_video: true,
                        join_before_host: true,
                        mute_upon_entry: true,
                        participant_video: true,
                        waiting_room: false,
                        breakout_room: {
                            enable: true,
                            rooms: [
                                {
                                    name: "room1",
                                    participants: [
                                        "email1@gmail.com",
                                        "email2@gmail.com",
                                    ],
                                },
                            ],
                        },
                        calendar_type: 1,
                        contact_email: "email1@gmail.com",
                        contact_name: "Ajay Sharma",
                        email_notification: true,
                        encryption_type: "enhanced_encryption",
                        focus_mode: true,
                        // global_dial_in_countries: ["US"],
                        host_video: true,
                        join_before_host: true,
                        meeting_authentication: true,
                        meeting_invitees: [
                            {
                                email: "email1@gmail.com",
                            },
                        ],
                        mute_upon_entry: true,
                        participant_video: true,
                        private_meeting: true,
                        waiting_room: false,
                        watermark: false,
                        continuous_meeting_chat: {
                            enable: true,
                        },
                    },
                    start_time: lessonData.start_time,
                    timezone: "Asia/Jerusalem",
                    topic: lessonData.topic || "Lesson Zoom Meeting",
                    type: 2, // 1 -> Instant Meeting, 2 -> Scheduled Meeting
                }),
            }
        );

        const jsonResponse = await response.json();
    return {
      join_url: jsonResponse.join_url,
      start_url: jsonResponse.start_url,
      password: jsonResponse.password,
    };
  } catch (error) {
    console.error("generateZoomMeeting Error -->", error);
    throw error;
  }
}; 

// API Endpoint to Generate Zoom Meeting
app.post("/generateZoom", async (req, res) => {
    try {
      const lessonData = req.body; // Expect start_time, agenda, topic, duration from frontend
      const zoomDetails = await generateZoomMeeting(lessonData);
      res.json(zoomDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate Zoom meeting", error: error.message });
    }
  });
  
  // Start the Express Server
  const PORT = 3001;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
