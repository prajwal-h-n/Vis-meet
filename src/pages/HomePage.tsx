import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowRight, Video, Shield, Laptop, Users, Award, MessageSquare, HeadphonesIcon } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-20 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center animate-fade-up">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                  Simple Video Meetings for Everyone
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Secure, reliable, and easy-to-use video meetings for work, education, and socializing.
                </p>
              </div>
              <div className="space-x-4">
                <Button size="lg" className="animate-fade-up" style={{ animationDelay: "200ms" }} asChild>
                  <Link to="/signup">
                    Get Started <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="animate-fade-up" style={{ animationDelay: "400ms" }} asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-secondary py-12 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-6 shadow-sm transition-all duration-200 hover:scale-105 animate-fade-up" style={{ animationDelay: "200ms" }}>
                <div className="rounded-full bg-primary/10 p-3">
                  <Laptop className="h-6 w-6 text-primary" />
                </div>
                <div className="text-xl font-semibold">Easy to Use</div>
                <p className="text-center text-sm text-muted-foreground">
                  No downloads required. Join meetings with a single click.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-6 shadow-sm transition-all duration-200 hover:scale-105 animate-fade-up" style={{ animationDelay: "400ms" }}>
                <div className="rounded-full bg-primary/10 p-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div className="text-xl font-semibold">Secure</div>
                <p className="text-center text-sm text-muted-foreground">
                  End-to-end encryption keeps your meetings safe and private.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-6 shadow-sm transition-all duration-200 hover:scale-105 animate-fade-up" style={{ animationDelay: "600ms" }}>
                <div className="rounded-full bg-primary/10 p-3">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <div className="text-xl font-semibold">Reliable</div>
                <p className="text-center text-sm text-muted-foreground">
                  High-quality video and audio for all your important meetings.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12 animate-fade-up">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Why Choose Zoom-Lite?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Experience the best video conferencing solution for your needs
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm border animate-fade-up" style={{ animationDelay: "200ms" }}>
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
                <p className="text-center text-muted-foreground">Connect with your team members seamlessly</p>
              </div>
              <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm border animate-fade-up" style={{ animationDelay: "400ms" }}>
                <HeadphonesIcon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Crystal Clear Audio</h3>
                <p className="text-center text-muted-foreground">Experience superior audio quality</p>
              </div>
              <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm border animate-fade-up" style={{ animationDelay: "600ms" }}>
                <MessageSquare className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Chat Features</h3>
                <p className="text-center text-muted-foreground">Built-in chat for better communication</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 animate-fade-up">
              <Award className="h-16 w-16 text-primary mb-4" />
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Join millions of users who trust Zoom-Lite for their video conferencing needs
              </p>
              <Button size="lg" className="animate-bounce" asChild>
                <Link to="/signup">
                  Start for Free <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
