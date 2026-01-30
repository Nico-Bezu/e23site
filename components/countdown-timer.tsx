'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow, isPast, differenceInSeconds } from 'date-fns'

interface CountdownTimerProps {
  targetDate: string
  className?: string
}

export function CountdownTimer({ targetDate, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    const updateCountdown = () => {
      const target = new Date(targetDate)

      if (isPast(target)) {
        setTimeLeft('Started')
        return
      }

      const secondsLeft = differenceInSeconds(target, new Date())

      if (secondsLeft < 60) {
        setTimeLeft(`${secondsLeft}s`)
      } else if (secondsLeft < 3600) {
        const minutes = Math.floor(secondsLeft / 60)
        setTimeLeft(`${minutes}m`)
      } else if (secondsLeft < 86400) {
        const hours = Math.floor(secondsLeft / 3600)
        const minutes = Math.floor((secondsLeft % 3600) / 60)
        setTimeLeft(`${hours}h ${minutes}m`)
      } else {
        setTimeLeft(formatDistanceToNow(target, { addSuffix: false }))
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  // Prevent hydration mismatch by showing nothing on server
  if (!isClient) {
    return <span className={className}>--</span>
  }

  return <span className={className}>{timeLeft}</span>
}
