'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { redis, keys, setRSVP as redisSetRSVP, createEvent, updateEvent, deleteEvent } from './redis'
import type { Event, RSVP } from './redis'
import { revalidatePath } from 'next/cache'

// Session management
const SESSION_COOKIE = 'e23_session'
const SESSION_EXPIRY = 60 * 60 * 24 * 7 // 7 days in seconds

export async function createSession(): Promise<string> {
  const token = crypto.randomUUID()
  const cookieStore = await cookies()

  await redis.set(keys.session(token), {
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + SESSION_EXPIRY * 1000).toISOString(),
  }, { ex: SESSION_EXPIRY })

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY,
    path: '/',
  })

  return token
}

export async function validateSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (!token) return false

  const session = await redis.get(keys.session(token))
  return session !== null
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value

  if (token) {
    await redis.del(keys.session(token))
    cookieStore.delete(SESSION_COOKIE)
  }
}

// Admin authentication
export async function loginAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const password = formData.get('password') as string

  if (!password) {
    return { success: false, error: 'Password is required' }
  }

  // Get stored hash or use env password
  let storedHash = await redis.get<string>(keys.adminPassword())

  // If no hash stored, check against env password and store hash
  if (!storedHash) {
    const envPassword = process.env.ADMIN_PASSWORD
    if (!envPassword) {
      return { success: false, error: 'Admin password not configured' }
    }

    // First login - verify against env and store hash
    if (password === envPassword) {
      storedHash = await bcrypt.hash(envPassword, 10)
      await redis.set(keys.adminPassword(), storedHash)
    } else {
      return { success: false, error: 'Invalid password' }
    }
  } else {
    // Verify against stored hash
    const valid = await bcrypt.compare(password, storedHash)
    if (!valid) {
      return { success: false, error: 'Invalid password' }
    }
  }

  await createSession()
  redirect('/admin')
}

export async function logoutAction(): Promise<void> {
  await destroySession()
  redirect('/admin/login')
}

// RSVP actions
export async function rsvpAction(
  eventId: string,
  name: string,
  status: RSVP['status']
): Promise<{ success: boolean; error?: string }> {
  if (!name.trim()) {
    return { success: false, error: 'Name is required' }
  }

  if (name.trim().length > 50) {
    return { success: false, error: 'Name too long' }
  }

  try {
    await redisSetRSVP(eventId, name.trim(), status)
    revalidatePath('/events')
    return { success: true }
  } catch (error) {
    console.error('RSVP error:', error)
    return { success: false, error: 'Failed to save RSVP' }
  }
}

// Event CRUD actions (admin only)
async function requireAdmin() {
  const isAdmin = await validateSession()
  if (!isAdmin) {
    throw new Error('Unauthorized')
  }
}

export async function createEventAction(
  data: Omit<Event, 'id' | 'createdAt'>
): Promise<{ success: boolean; error?: string; event?: Event }> {
  try {
    await requireAdmin()
    const event = await createEvent(data)
    revalidatePath('/events')
    revalidatePath('/admin')
    return { success: true, event }
  } catch (error) {
    console.error('Create event error:', error)
    return { success: false, error: 'Failed to create event' }
  }
}

export async function updateEventAction(
  id: string,
  data: Partial<Event>
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()
    await updateEvent(id, data)
    revalidatePath('/events')
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Update event error:', error)
    return { success: false, error: 'Failed to update event' }
  }
}

export async function deleteEventAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin()
    await deleteEvent(id)
    revalidatePath('/events')
    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('Delete event error:', error)
    return { success: false, error: 'Failed to delete event' }
  }
}
