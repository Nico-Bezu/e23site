'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EventForm } from '@/components/event-form'
import { logoutAction, deleteEventAction } from '@/lib/actions'
import { format, isPast } from 'date-fns'
import type { Event } from '@/lib/redis'

interface AdminDashboardProps {
  events: Event[]
}

export function AdminDashboard({ events }: AdminDashboardProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | undefined>()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const upcomingEvents = events.filter(e => !isPast(new Date(e.date)))
  const pastEvents = events.filter(e => isPast(new Date(e.date)))

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event? This cannot be undone.')) return

    setDeletingId(id)
    try {
      await deleteEventAction(id)
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to delete event')
    } finally {
      setDeletingId(null)
    }
  }

  const handleCloseForm = (open: boolean) => {
    setShowForm(open)
    if (!open) setEditingEvent(undefined)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            E23 Admin
          </Link>
          <form action={logoutAction}>
            <Button variant="ghost" size="sm" type="submit">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </form>
        </div>
      </header>

      {/* Content */}
      <section className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Events</h1>
              <p className="text-muted-foreground mt-1">
                Manage suite events
              </p>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>

          {/* Upcoming Events */}
          <div className="space-y-4 mb-8">
            <h2 className="text-xl font-semibold">Upcoming ({upcomingEvents.length})</h2>
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => (
                <EventRow
                  key={event.id}
                  event={event}
                  onEdit={() => handleEdit(event)}
                  onDelete={() => handleDelete(event.id)}
                  isDeleting={deletingId === event.id}
                />
              ))
            ) : (
              <p className="text-muted-foreground py-4">No upcoming events</p>
            )}
          </div>

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-muted-foreground">Past ({pastEvents.length})</h2>
              {pastEvents.map(event => (
                <EventRow
                  key={event.id}
                  event={event}
                  onEdit={() => handleEdit(event)}
                  onDelete={() => handleDelete(event.id)}
                  isDeleting={deletingId === event.id}
                  isPast
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Event Form Dialog */}
      <EventForm
        event={editingEvent}
        open={showForm}
        onOpenChange={handleCloseForm}
      />
    </main>
  )
}

interface EventRowProps {
  event: Event
  onEdit: () => void
  onDelete: () => void
  isDeleting: boolean
  isPast?: boolean
}

function EventRow({ event, onEdit, onDelete, isDeleting, isPast }: EventRowProps) {
  return (
    <Card className={isPast ? 'opacity-60' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{event.title}</CardTitle>
            <CardDescription>
              {format(new Date(event.date), 'EEE, MMM d')} at {format(new Date(event.date), 'h:mm a')} · {event.location}
            </CardDescription>
          </div>
          <Badge variant="outline">{event.vibeTag}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={isDeleting}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
