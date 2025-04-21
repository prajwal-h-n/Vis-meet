
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useAuth } from "@/components/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function MeetingPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const meetingLink = `${window.location.origin}/meeting/${roomId}`;

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
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-4">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Room Code:</span>
              <span className="bg-secondary px-3 py-1 rounded">{roomId}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Meeting Link:</span>
              <span className="bg-secondary px-3 py-1 rounded break-all">{meetingLink}</span>
            </div>
          </div>
        </div>

        <div id="meeting-container" className="rounded-lg overflow-hidden border bg-card shadow-sm"></div>
      </main>
      <Footer />
    </div>
  );
}
