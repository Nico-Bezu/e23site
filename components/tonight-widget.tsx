import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CountdownTimer } from "./countdown-timer"
import { getTonightEvent, getNextEvent, getEventRSVPs } from "@/lib/events"
import { format } from "date-fns"
import Link from "next/link"

export async function TonightWidget() {
  const tonightEvent = await getTonightEvent()
  const nextEvent = tonightEvent ? null : await getNextEvent()
  const event = tonightEvent || nextEvent

  if (!event) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-card to-muted/30">
        <CardHeader>
          <CardTitle className="text-2xl">Tonight in E23</CardTitle>
          <CardDescription>What&apos;s happening</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Nothing planned yet. Check back later or hit up the admin to create something!
          </p>
          <Button asChild variant="outline">
            <Link href="/events">View All Events</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const rsvpData = await getEventRSVPs(event.id)
  const eventDate = new Date(event.date)

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-muted/30 overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardDescription className="text-primary">
              {tonightEvent ? "Tonight in E23" : "Coming Up"}
            </CardDescription>
            <CardTitle className="text-2xl mt-1">{event.title}</CardTitle>
          </div>
          {event.vibeTag && (
            <Badge variant="secondary">{event.vibeTag}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">When</p>
            <p className="font-medium">
              {format(eventDate, "EEEE")} at {format(eventDate, "h:mm a")}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Where</p>
            <p className="font-medium">{event.location}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Countdown</p>
            <p className="font-medium text-primary">
              <CountdownTimer targetDate={event.date} />
            </p>
          </div>
        </div>

        {event.description && (
          <p className="text-sm text-muted-foreground">{event.description}</p>
        )}

        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            {rsvpData.going} going · {rsvpData.maybe} maybe
          </p>
          <Button asChild>
            <Link href="/events">RSVP Now</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
