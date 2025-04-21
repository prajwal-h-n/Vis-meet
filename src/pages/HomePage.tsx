
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ArrowRight, Video, Shield, Laptop } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="py-12 md:py-20 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Simple Video Meetings for Everyone
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Secure, reliable, and easy-to-use video meetings for work, education, and socializing.
                </p>
              </div>
              <div className="space-x-4">
                <Button size="lg" asChild>
                  <Link to="/signup">
                    Get Started <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-secondary py-12 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <Laptop className="h-6 w-6 text-primary" />
                </div>
                <div className="text-xl font-semibold">Easy</div>
                <p className="text-center text-sm text-muted-foreground">
                  No downloads required. Join meetings with a single click.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div className="text-xl font-semibold">Secure</div>
                <p className="text-center text-sm text-muted-foreground">
                  End-to-end encryption keeps your meetings safe and private.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border bg-card p-6 shadow-sm">
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
      </main>
      <Footer />
    </div>
  );
}
