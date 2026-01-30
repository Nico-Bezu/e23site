import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TonightWidget } from "@/components/tonight-widget";
import { MemberGrid } from "@/components/member-grid";
import Link from "next/link";

export const dynamic = 'force-dynamic'

function TonightWidgetFallback() {
  return (
    <Card className="border-primary/20 animate-pulse">
      <CardContent className="p-6">
        <div className="h-6 w-32 bg-muted rounded mb-4" />
        <div className="h-8 w-48 bg-muted rounded mb-2" />
        <div className="h-4 w-64 bg-muted rounded" />
      </CardContent>
    </Card>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 py-20 sm:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <Badge variant="secondary" className="mb-4">
            Suite E23
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Welcome to E23
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            The official hub for our suite. Check what&apos;s happening tonight,
            RSVP to events, and stay connected with the crew.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg" className="shadow-lg shadow-primary/25">
              <Link href="/events">See What&apos;s Happening</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#members">Meet the Suite</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Tonight Widget */}
      <section className="px-4 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <Suspense fallback={<TonightWidgetFallback />}>
            <TonightWidget />
          </Suspense>
        </div>
      </section>

      {/* Members Section */}
      <section id="members" className="px-4 py-12 sm:py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">
              The Crew
            </h2>
            <p className="text-muted-foreground mt-2">
              The 8 people who make E23 home
            </p>
          </div>

          <MemberGrid />
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>E23 Suite &copy; {new Date().getFullYear()}</p>
          <div className="flex gap-4">
            <Link href="/events" className="hover:text-foreground transition-colors">
              Events
            </Link>
            <Link href="/admin" className="hover:text-foreground transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
