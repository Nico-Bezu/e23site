// Run with: npx tsx scripts/seed-events.ts
// Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars

import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

interface Event {
  id: string
  title: string
  date: string
  location: string
  vibeTag: string
  bringNotes?: string
  description?: string
  createdAt: string
}

const sampleEvents: Omit<Event, 'id' | 'createdAt'>[] = [
  {
    title: "Movie Night",
    date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    location: "Common Room",
    vibeTag: "Chill",
    description: "Watching the new Marvel movie. Popcorn provided!",
    bringNotes: "Blankets, snacks"
  },
  {
    title: "Game Night",
    date: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(), // Tomorrow
    location: "Suite Lounge",
    vibeTag: "Game",
    description: "Mario Kart tournament. Winner gets bragging rights.",
  },
  {
    title: "Study Session",
    date: new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString(), // 2 days
    location: "Library Room 204",
    vibeTag: "Study",
    description: "Midterm prep for CS101",
    bringNotes: "Laptop, notes"
  },
  {
    title: "Friday Hangout",
    date: new Date(Date.now() + 74 * 60 * 60 * 1000).toISOString(), // 3 days
    location: "Rooftop",
    vibeTag: "Party",
    description: "End of week vibes. Music and good company.",
    bringNotes: "Good vibes only"
  },
]

async function seed() {
  console.log('Seeding events...')

  for (const eventData of sampleEvents) {
    const id = crypto.randomUUID()
    const event: Event = {
      ...eventData,
      id,
      createdAt: new Date().toISOString(),
    }

    await Promise.all([
      redis.set(`event:${id}`, event),
      redis.sadd('events:list', id),
    ])

    console.log(`Created: ${event.title}`)
  }

  console.log('Done! Created', sampleEvents.length, 'events')
}

seed().catch(console.error)
