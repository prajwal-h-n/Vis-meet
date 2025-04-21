
# Zoom-Lite Video Meeting App

This is a simple Zoom-like meeting application built with React and ZegoCloud.

## Features

- User authentication (signup/login)
- Dashboard with options to create or join meetings
- Video conferencing with ZegoCloud
- Light/dark mode support
- Responsive design

## ZegoCloud Setup

For the video meeting functionality to work properly, you need to set up ZegoCloud:

1. Create a ZegoCloud account at [https://www.zegocloud.com/](https://www.zegocloud.com/)
2. Create a new project in the ZegoCloud Console
3. Get your AppID and ServerSecret
4. Update the `src/pages/MeetingPage.tsx` file with your credentials:

```javascript
// Replace these values with your actual ZegoCloud credentials
const appID = 123456789; // Your AppID
const serverSecret = "your-server-secret"; // Your ServerSecret
```

## Usage

1. Sign up for a new account
2. Log in with your credentials
3. From the dashboard, you can:
   - Start a new meeting (generates a random meeting ID)
   - Join an existing meeting by entering a meeting ID
4. In a meeting, you have controls for:
   - Turning camera on/off
   - Muting/unmuting microphone
   - Screen sharing
   - Chat
   - Leaving the meeting
5. When you leave a meeting, you'll be redirected back to the dashboard

## Development

This project is built with:

- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- ZegoCloud for video conferencing

## Notes

- This is a demo application with simulated authentication (using localStorage)
- In a production environment, you would implement proper authentication and secure storage of ZegoCloud credentials
