
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useAuth } from "@/components/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

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
      const appID = 1197356487;
      const serverSecret = "ae07d4117925b5e2d80c7ccb654eb4a6";

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
        sharedLinks: [{
          name: 'Personal link',
          url: meetingLink,
        }],
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
        turnOnMicrophoneWhenJoining: false,
        turnOnCameraWhenJoining: false,
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        showScreenSharingButton: true,
        showTextChat: true,
        showUserList: true,
        maxUsers: 50,
        layout: "Grid",
        showLayoutButton: true,
        onLeaveRoom: () => {
          navigate("/dashboard");
        },
      });

      return () => {
        try {
          zp?.destroy();
        } catch (error) {
          console.error("Error destroying ZegoCloud instance:", error);
        }
      };
    } catch (error) {
      console.error("Error initializing ZegoCloud:", error);
      toast.error("Failed to initialize meeting. Please try again.");
      navigate("/dashboard");
    }
  }, [roomId, user, navigate, meetingLink]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-4">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate("/dashboard")}
            className="mb-4 hover:bg-secondary"
          >
            <ArrowLeft className="mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Room Code:</span>
              <span className="bg-secondary px-3 py-1 rounded-md">{roomId}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Meeting Link:</span>
              <span className="bg-secondary px-3 py-1 rounded-md break-all">{meetingLink}</span>
            </div>
          </div>
        </div>

        <div id="meeting-container" className="rounded-lg overflow-hidden border bg-card shadow-sm h-[600px]"></div>
      </main>
      <Footer />
    </div>
  );
}
