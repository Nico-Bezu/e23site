import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CountdownTimer } from "./countdown-timer"
import { RSVPButtons } from "./rsvp-buttons"
import { format, isPast } from "date-fns"
import type { Event, RSVP } from "@/lib/redis"

interface EventCardProps {
  event: Event
  rsvps?: RSVP[]
  showCountdown?: boolean
  showRSVP?: boolean
}

const vibeColors: Record<string, string> = {
  chill: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  party: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  study: "bg-green-500/20 text-green-300 border-green-500/30",
  movie: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  food: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  game: "bg-red-500/20 text-red-300 border-red-500/30",
  default: "bg-muted text-muted-foreground",
}

export function EventCard({ event, rsvps = [], showCountdown = true, showRSVP = true }: EventCardProps) {
  const eventDate = new Date(event.date)
  const isEventPast = isPast(eventDate)
  const vibeColor = vibeColors[event.vibeTag?.toLowerCase()] || vibeColors.default

  const goingCount = rsvps.filter(r => r.status === 'going').length
  const maybeCount = rsvps.filter(r => r.status === 'maybe').length

  return (
    <Card className={isEventPast ? "opacity-60" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl">{event.title}</CardTitle>
            <CardDescription className="mt-1">
              {format(eventDate, "EEEE, MMM d")} at {format(eventDate, "h:mm a")}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            {event.vibeTag && (
              <Badge variant="outline" className={vibeColor}>
                {event.vibeTag}
              </Badge>
            )}
            {showCountdown && !isEventPast && (
              <div className="text-sm font-medium text-primary">
                <CountdownTimer targetDate={event.date} />
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {event.location && (
          <p className="text-sm text-muted-foreground">
            📍 {event.location}
          </p>
        )}
        {event.description && (
          <p className="text-sm">{event.description}</p>
        )}
        {event.bringNotes && (
          <p className="text-sm text-muted-foreground">
            🎒 Bring: {event.bringNotes}
          </p>
        )}

        {showRSVP && !isEventPast && (
          <div className="pt-3 border-t">
            <RSVPButtons eventId={event.id} currentRSVPs={rsvps} />
          </div>
        )}

        {(goingCount > 0 || maybeCount > 0) && !showRSVP && (
          <p className="text-xs text-muted-foreground pt-2 border-t">
            {goingCount} going · {maybeCount} maybe
          </p>
        )}
      </CardContent>
    </Card>
  )
}
