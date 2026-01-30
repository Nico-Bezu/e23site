import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="mb-4">
            Suite E23
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Welcome to E23
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            The official hub for our suite. Check what&apos;s happening tonight,
            RSVP to events, and stay connected with the crew.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/events">See What&apos;s Happening</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#members">Meet the Suite</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Tonight Widget Placeholder */}
      <section className="px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Tonight in E23</CardTitle>
              <CardDescription>
                What&apos;s happening right now
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No events scheduled for tonight. Check back later or create one in admin.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Members Section Placeholder */}
      <section id="members" className="px-4 py-12 sm:py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">
            The Crew
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="group hover:border-primary/50 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-2xl text-muted-foreground">?</span>
                  </div>
                  <p className="font-medium">Member {i + 1}</p>
                  <p className="text-sm text-muted-foreground">Coming soon</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted-foreground">
          <p>E23 Suite &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </main>
  );
}
