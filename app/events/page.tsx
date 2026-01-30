import Link from "next/link";
import { getUpcomingEvents, getPastEvents, getEventRSVPs, isRedisConfigured } from "@/lib/events";
import { EventCard } from "@/components/event-card";
import { PastEvents } from "@/components/past-events";

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EventsPage() {
  const configured = await isRedisConfigured()
  const upcomingEvents = configured ? await getUpcomingEvents() : []
  const pastEvents = configured ? await getPastEvents() : []

  // Get RSVP counts for all upcoming events
  const rsvpCounts = configured
    ? await Promise.all(
        upcomingEvents.map(async (event) => ({
          eventId: event.id,
          ...(await getEventRSVPs(event.id)),
        }))
      )
    : []

  const getRSVPCount = (eventId: string) => {
    const counts = rsvpCounts.find((c) => c.eventId === eventId)
    return counts ? { going: counts.going, maybe: counts.maybe } : undefined
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
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

          {!configured && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-6">
              <p className="text-amber-200 text-sm">
                Redis not configured. Add your Upstash credentials to .env.local to enable events.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  rsvpCounts={getRSVPCount(event.id)}
                  showCountdown
                />
              ))
            ) : (
              <p className="text-center text-muted-foreground py-12">
                No upcoming events. Check back later!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Past Events */}
      <section className="px-4 py-8 border-t">
        <div className="max-w-4xl mx-auto">
          <PastEvents events={pastEvents} />
          {pastEvents.length === 0 && (
            <p className="text-muted-foreground text-sm">No past events yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}
