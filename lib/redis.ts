import { Redis } from '@upstash/redis'

// Initialize Redis client
// Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Type definitions for our data models
export interface Event {
  id: string
  title: string
  date: string // ISO string
  location: string
  vibeTag: string
  bringNotes?: string
  description?: string
  createdAt: string
}

export interface RSVP {
  eventId: string
  name: string
  status: 'going' | 'maybe' | 'not_going'
  createdAt: string
}

export interface Member {
  id: string
  name: string
  oneLiner: string
  avatarUrl?: string
}

// Redis key patterns
export const keys = {
  event: (id: string) => `event:${id}`,
  eventsList: () => 'events:list',
  rsvp: (eventId: string, name: string) => `rsvp:${eventId}:${name}`,
  rsvpsByEvent: (eventId: string) => `rsvps:${eventId}`,
  members: () => 'members:list',
  session: (token: string) => `session:${token}`,
  adminPassword: () => 'admin:password',
}

// Event operations
export async function getEvents(): Promise<Event[]> {
  const eventIds = await redis.smembers(keys.eventsList())
  if (!eventIds.length) return []

  const events = await Promise.all(
    eventIds.map(id => redis.get<Event>(keys.event(id)))
  )

  return events.filter((e): e is Event => e !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export async function getEvent(id: string): Promise<Event | null> {
  return redis.get<Event>(keys.event(id))
}

export async function createEvent(event: Omit<Event, 'id' | 'createdAt'>): Promise<Event> {
  const id = crypto.randomUUID()
  const newEvent: Event = {
    ...event,
    id,
    createdAt: new Date().toISOString(),
  }

  await Promise.all([
    redis.set(keys.event(id), newEvent),
    redis.sadd(keys.eventsList(), id),
  ])

  return newEvent
}

export async function updateEvent(id: string, updates: Partial<Event>): Promise<Event | null> {
  const existing = await getEvent(id)
  if (!existing) return null

  const updated: Event = { ...existing, ...updates, id }
  await redis.set(keys.event(id), updated)
  return updated
}

export async function deleteEvent(id: string): Promise<boolean> {
  const [removed] = await Promise.all([
    redis.srem(keys.eventsList(), id),
    redis.del(keys.event(id)),
    // Also delete all RSVPs for this event
    redis.del(keys.rsvpsByEvent(id)),
  ])
  return removed > 0
}

// RSVP operations
export async function getRSVPs(eventId: string): Promise<RSVP[]> {
  const rsvpKeys = await redis.smembers(keys.rsvpsByEvent(eventId))
  if (!rsvpKeys.length) return []

  const rsvps = await Promise.all(
    rsvpKeys.map(key => redis.get<RSVP>(key))
  )

  return rsvps.filter((r): r is RSVP => r !== null)
}

export async function setRSVP(eventId: string, name: string, status: RSVP['status']): Promise<RSVP> {
  const rsvp: RSVP = {
    eventId,
    name,
    status,
    createdAt: new Date().toISOString(),
  }

  const key = keys.rsvp(eventId, name)
  await Promise.all([
    redis.set(key, rsvp),
    redis.sadd(keys.rsvpsByEvent(eventId), key),
  ])

  return rsvp
}

// Connection test
export async function testConnection(): Promise<boolean> {
  try {
    await redis.ping()
    return true
  } catch {
    return false
  }
}
