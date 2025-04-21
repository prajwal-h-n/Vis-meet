
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useAuth } from "@/components/AuthContext";

export default function MeetingPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!roomId) {
      navigate("/dashboard");
      return;
    }

    // Create a container for the meeting UI
    const container = document.getElementById("meeting-container");
    if (!container) return;

    try {
      // Initialize ZegoCloud - You would need to replace with your own ZegoCloud credentials
      // This is just a placeholder for demo purposes
      const appID = 123456789; // Replace with your actual appID from ZegoCloud
      const serverSecret = "your-server-secret"; // Replace with your actual serverSecret

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID, 
        serverSecret,
        roomId,
        user?.id || Date.now().toString(),
        user?.name || "Guest User"
      );

      // Create meeting instance
      const zp = ZegoUIKitPrebuilt.create(kitToken);

      // Join the room
      zp.joinRoom({
        container,
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
      turnOnMicrophoneWhenJoining: true,
      turnOnCameraWhenJoining: true,
      showMyCameraToggleButton: true,
      showMyMicrophoneToggleButton: true,
      showAudioVideoSettingsButton: true,
      showScreenSharingButton: true,
      showTextChat: true,
      maxUsers: 50,
      layout: "Auto",
      showLayoutButton: true,
      onLeaveRoom: () => {
        navigate("/dashboard");
      },
    });

    return () => {
      // Clean up when component unmounts
      try {
        zp?.destroy();
      } catch (error) {
        console.error("Error destroying ZegoCloud instance:", error);
      }
    };
    
    } catch (error) {
      console.error("Error initializing ZegoCloud:", error);
      alert("Failed to initialize meeting. Please check your ZegoCloud credentials.");
      navigate("/dashboard");
    }
  }, [roomId, user, navigate]);

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      <div id="meeting-container" className="flex-1"></div>
    </div>
  );
}
