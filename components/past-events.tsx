'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { EventCard } from "./event-card"
import type { Event } from "@/lib/redis"

interface PastEventsProps {
  events: Event[]
}

export function PastEvents({ events }: PastEventsProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (events.length === 0) {
    return null
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-between">
          <span>Past Events ({events.length})</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 pt-4">
        {events.map(event => (
          <EventCard
            key={event.id}
            event={event}
            showCountdown={false}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
