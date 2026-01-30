import { redis, keys, type Event, type RSVP } from './redis'

// Get all events sorted by date
export async function getAllEvents(): Promise<Event[]> {
  try {
    const eventIds = await redis.smembers(keys.eventsList())
    if (!eventIds.length) return []

    const events = await Promise.all(
      eventIds.map(id => redis.get<Event>(keys.event(id)))
    )

    return events
      .filter((e): e is Event => e !== null)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  } catch (error) {
    console.error('Failed to fetch events:', error)
    return []
  }
}

// Get upcoming events (date >= now)
export async function getUpcomingEvents(): Promise<Event[]> {
  const events = await getAllEvents()
  const now = new Date()
  return events.filter(e => new Date(e.date) >= now)
}

// Get past events (date < now)
export async function getPastEvents(): Promise<Event[]> {
  const events = await getAllEvents()
  const now = new Date()
  return events
    .filter(e => new Date(e.date) < now)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Most recent first
}

// Get tonight's event (6pm today to 4am tomorrow)
export async function getTonightEvent(): Promise<Event | null> {
  const events = await getAllEvents()
  const now = new Date()

  // Tonight window: 6pm today to 4am tomorrow
  const todaySixPM = new Date(now)
  todaySixPM.setHours(18, 0, 0, 0)

  const tomorrowFourAM = new Date(now)
  tomorrowFourAM.setDate(tomorrowFourAM.getDate() + 1)
  tomorrowFourAM.setHours(4, 0, 0, 0)

  // If it's before 4am, adjust the window to yesterday 6pm to today 4am
  if (now.getHours() < 4) {
    todaySixPM.setDate(todaySixPM.getDate() - 1)
    tomorrowFourAM.setDate(tomorrowFourAM.getDate() - 1)
  }

  const tonightEvents = events.filter(e => {
    const eventDate = new Date(e.date)
    return eventDate >= todaySixPM && eventDate <= tomorrowFourAM
  })

  // Return the soonest tonight event
  return tonightEvents[0] || null
}

// Get next upcoming event
export async function getNextEvent(): Promise<Event | null> {
  const events = await getUpcomingEvents()
  return events[0] || null
}

// Get RSVPs for an event with counts
export async function getEventRSVPs(eventId: string): Promise<{
  rsvps: RSVP[]
  going: number
  maybe: number
  notGoing: number
}> {
  try {
    const rsvpKeys = await redis.smembers(keys.rsvpsByEvent(eventId))
    if (!rsvpKeys.length) {
      return { rsvps: [], going: 0, maybe: 0, notGoing: 0 }
    }

    const rsvps = await Promise.all(
      rsvpKeys.map(key => redis.get<RSVP>(key))
    )

    const validRSVPs = rsvps.filter((r): r is RSVP => r !== null)

    return {
      rsvps: validRSVPs,
      going: validRSVPs.filter(r => r.status === 'going').length,
      maybe: validRSVPs.filter(r => r.status === 'maybe').length,
      notGoing: validRSVPs.filter(r => r.status === 'not_going').length,
    }
  } catch (error) {
    console.error('Failed to fetch RSVPs:', error)
    return { rsvps: [], going: 0, maybe: 0, notGoing: 0 }
  }
}

// Check if Redis is configured
export async function isRedisConfigured(): Promise<boolean> {
  try {
    await redis.ping()
    return true
  } catch {
    return false
  }
}
