'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { rsvpAction } from '@/lib/actions'
import type { RSVP } from '@/lib/redis'

interface RSVPButtonsProps {
  eventId: string
  currentRSVPs: RSVP[]
}

export function RSVPButtons({ eventId, currentRSVPs }: RSVPButtonsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<RSVP['status'] | null>(null)
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleStatusClick = (status: RSVP['status']) => {
    setSelectedStatus(status)
    setError('')
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStatus || !name.trim()) return

    setIsSubmitting(true)
    setError('')

    try {
      const result = await rsvpAction(eventId, name.trim(), selectedStatus)
      if (result.success) {
        setIsOpen(false)
        setName('')
        setSelectedStatus(null)
      } else {
        setError(result.error || 'Something went wrong')
      }
    } catch {
      setError('Failed to save RSVP')
    } finally {
      setIsSubmitting(false)
    }
  }

  const goingNames = currentRSVPs
    .filter(r => r.status === 'going')
    .map(r => r.name)

  const maybeNames = currentRSVPs
    .filter(r => r.status === 'maybe')
    .map(r => r.name)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => handleStatusClick('going')}>
              Going
            </Button>
          </DialogTrigger>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" onClick={() => handleStatusClick('maybe')}>
              Maybe
            </Button>
          </DialogTrigger>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" onClick={() => handleStatusClick('not_going')}>
              Can&apos;t Make It
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedStatus === 'going' && "You're going!"}
                {selectedStatus === 'maybe' && "Maybe attending"}
                {selectedStatus === 'not_going' && "Can't make it"}
              </DialogTitle>
              <DialogDescription>
                Enter your name to RSVP
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your name"
                  autoFocus
                  maxLength={50}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !name.trim()}>
                  {isSubmitting ? 'Saving...' : 'Confirm'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {(goingNames.length > 0 || maybeNames.length > 0) && (
        <div className="text-xs text-muted-foreground space-y-1">
          {goingNames.length > 0 && (
            <p>
              <span className="text-green-400">Going:</span>{' '}
              {goingNames.join(', ')}
            </p>
          )}
          {maybeNames.length > 0 && (
            <p>
              <span className="text-amber-400">Maybe:</span>{' '}
              {maybeNames.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
