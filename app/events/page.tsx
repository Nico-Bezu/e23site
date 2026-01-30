import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            E23
          </Link>
          <nav className="flex gap-4">
            <Link href="/events" className="text-sm font-medium">
              Events
            </Link>
          </nav>
        </div>
      </header>

      {/* Events List */}
      <section className="px-4 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Upcoming Events</h1>
              <p className="text-muted-foreground mt-1">
                See what&apos;s happening and RSVP
              </p>
            </div>
          </div>

          {/* Events will be loaded here */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Sample Event</CardTitle>
                    <CardDescription>
                      Friday, Feb 14 at 9:00 PM
                    </CardDescription>
                  </div>
                  <Badge>Chill</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Location: Common Room
                </p>
                <div className="flex items-center gap-2">
                  <Button size="sm">Going</Button>
                  <Button size="sm" variant="outline">Maybe</Button>
                  <Button size="sm" variant="ghost">Can&apos;t Make It</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  0 going · 0 maybe
                </p>
              </CardContent>
            </Card>

            <p className="text-center text-muted-foreground py-8">
              Events will be loaded from Upstash Redis once configured.
            </p>
          </div>
        </div>
      </section>

      {/* Past Events */}
      <section className="px-4 py-8 border-t">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-4">Past Events</h2>
          <p className="text-muted-foreground">
            No past events yet.
          </p>
        </div>
      </section>
    </main>
  );
}
