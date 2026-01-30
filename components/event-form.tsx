'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createEventAction, updateEventAction } from '@/lib/actions'
import type { Event } from '@/lib/redis'

const VIBE_TAGS = ['Chill', 'Party', 'Study', 'Movie', 'Food', 'Game']

interface EventFormProps {
  event?: Event
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventForm({ event, open, onOpenChange }: EventFormProps) {
  const isEditing = !!event
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [title, setTitle] = useState(event?.title || '')
  const [date, setDate] = useState(event?.date ? new Date(event.date).toISOString().slice(0, 16) : '')
  const [location, setLocation] = useState(event?.location || '')
  const [vibeTag, setVibeTag] = useState(event?.vibeTag || '')
  const [description, setDescription] = useState(event?.description || '')
  const [bringNotes, setBringNotes] = useState(event?.bringNotes || '')

  const resetForm = () => {
    if (!event) {
      setTitle('')
      setDate('')
      setLocation('')
      setVibeTag('')
      setDescription('')
      setBringNotes('')
    }
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const eventData = {
        title,
        date: new Date(date).toISOString(),
        location,
        vibeTag,
        description: description || undefined,
        bringNotes: bringNotes || undefined,
      }

      const result = isEditing
        ? await updateEventAction(event.id, eventData)
        : await createEventAction(eventData)

      if (result.success) {
        resetForm()
        onOpenChange(false)
      } else {
        setError(result.error || 'Failed to save event')
      }
    } catch {
      setError('Failed to save event')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm()
      onOpenChange(isOpen)
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Event' : 'Create Event'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the event details' : 'Add a new event for the suite'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Movie Night"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date & Time *</Label>
            <Input
              id="date"
              type="datetime-local"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Common Room"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vibe">Vibe Tag *</Label>
            <Select value={vibeTag} onValueChange={setVibeTag} required>
              <SelectTrigger>
                <SelectValue placeholder="Select vibe" />
              </SelectTrigger>
              <SelectContent>
                {VIBE_TAGS.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's happening?"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bringNotes">Bring Notes</Label>
            <Input
              id="bringNotes"
              value={bringNotes}
              onChange={e => setBringNotes(e.target.value)}
              placeholder="Snacks, blankets, etc."
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
