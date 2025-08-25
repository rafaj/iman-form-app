"use client"

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

export default function ActivityTracker() {
  const { data: session } = useSession()

  useEffect(() => {
    if (!session?.user) return

    // Update activity immediately on mount
    updateActivity()

    // Set up interval to update activity every 5 minutes
    const interval = setInterval(updateActivity, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [session])

  const updateActivity = async () => {
    try {
      await fetch('/api/auth/update-activity', {
        method: 'POST',
      })
    } catch (error) {
      // Silently fail - don't disrupt user experience
      console.debug('Failed to update activity:', error)
    }
  }

  // This component doesn't render anything
  return null
}