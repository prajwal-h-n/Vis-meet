
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Video, Users, LogOut } from "lucide-react";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [roomId, setRoomId] = useState("");

  // Generate a random meeting ID for new meetings
  const startNewMeeting = () => {
    const meetingId = Math.random().toString(36).substring(2, 12);
    navigate(`/meeting/${meetingId}`);
  };

  const joinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim()) {
      toast({
        title: "Room ID Required",
        description: "Please enter a valid room ID",
        variant: "destructive",
      });
      return;
    }
    navigate(`/meeting/${roomId}`);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}</h1>
              <p className="text-muted-foreground">Manage your meetings from your dashboard</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              <Card className="border-2 border-primary/10 hover:border-primary/30 transition-colors">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Video className="h-6 w-6 text-primary" />
                    <CardTitle>Start a New Meeting</CardTitle>
                  </div>
                  <CardDescription>
                    Create an instant meeting and invite others to join
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Start a new meeting with video and audio enabled. You'll get a meeting link to share with others.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={startNewMeeting} className="w-full" size="lg">
                    <Video className="mr-2 h-5 w-5" />
                    New Meeting
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-2 border-primary/10 hover:border-primary/30 transition-colors">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Users className="h-6 w-6 text-primary" />
                    <CardTitle>Join a Meeting</CardTitle>
                  </div>
                  <CardDescription>
                    Enter a meeting ID to join an existing meeting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={joinMeeting} className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        placeholder="Enter meeting ID"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                      />
                    </div>
                  </form>
                </CardContent>
                <CardFooter>
                  <Button onClick={joinMeeting} className="w-full" size="lg">
                    <Users className="mr-2 h-5 w-5" />
                    Join Meeting
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="mt-10">
              <Card className="border border-destructive/20">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <LogOut className="h-5 w-5 text-destructive" />
                    <CardTitle className="text-base">Sign Out</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Sign out from your account to end your session
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                  >
                    Sign Out
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
