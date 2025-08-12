// Eventbrite API integration for IMAN Professional Network

interface EventbriteEvent {
  name: {
    text: string
  }
  description: {
    text: string
  }
  id: string
  url: string
  start: {
    timezone: string
    local: string
    utc: string
  }
  end: {
    timezone: string
    local: string
    utc: string
  }
  venue?: {
    name: string
    address: {
      address_1: string
      city: string
      region: string
      postal_code: string
    }
  }
  online_event: boolean
  capacity?: number
  ticket_availability?: {
    has_available_tickets: boolean
  }
  logo?: {
    url: string
  }
  category?: {
    name: string
  }
}

interface EventbriteResponse {
  events: EventbriteEvent[]
  pagination: {
    page_number: number
    page_count: number
    page_size: number
    object_count: number
  }
}

export interface IMANEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  type: 'networking' | 'workshop' | 'conference' | 'social'
  registrationUrl: string
  capacity?: number
  hasAvailableTickets: boolean
  imageUrl?: string
}

const EVENTBRITE_API_BASE = 'https://www.eventbriteapi.com/v3'

export async function getIMANEvents(): Promise<IMANEvent[]> {
  const apiKey = process.env.EVENTBRITE_API_KEY
  const organizationId = process.env.EVENTBRITE_ORGANIZATION_ID

  if (!apiKey || !organizationId) {
    console.error('Missing Eventbrite API credentials')
    return []
  }

  try {
    const response = await fetch(
      `${EVENTBRITE_API_BASE}/organizations/${organizationId}/events/?status=live&order_by=start_asc&expand=venue,ticket_availability,category`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        // Cache for 5 minutes
        next: { revalidate: 300 }
      }
    )

    if (!response.ok) {
      throw new Error(`Eventbrite API error: ${response.status}`)
    }

    const data: EventbriteResponse = await response.json()
    
    return data.events.map(transformEventbriteEvent).filter(Boolean) as IMANEvent[]
  } catch (error) {
    console.error('Failed to fetch events from Eventbrite:', error)
    return []
  }
}

function transformEventbriteEvent(event: EventbriteEvent): IMANEvent | null {
  try {
    const startDate = new Date(event.start.local)
    const endDate = new Date(event.end.local)
    
    // Skip past events
    if (startDate < new Date()) {
      return null
    }

    // Format time
    const timeString = `${startDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })} - ${endDate.toLocaleTimeString('en-US', {
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    })}`

    // Determine event type from category or title
    const eventType = determineEventType(event.name.text, event.category?.name)
    
    // Format location
    let location = 'TBD'
    if (event.online_event) {
      location = 'Online Event'
    } else if (event.venue) {
      location = `${event.venue.name}, ${event.venue.address.city}`
    }

    return {
      id: event.id,
      title: event.name.text,
      description: event.description.text || 'Professional networking event',
      date: startDate.toISOString().split('T')[0],
      time: timeString,
      location,
      type: eventType,
      registrationUrl: event.url,
      capacity: event.capacity,
      hasAvailableTickets: event.ticket_availability?.has_available_tickets ?? true,
      imageUrl: event.logo?.url
    }
  } catch (error) {
    console.error('Error transforming event:', error)
    return null
  }
}

function determineEventType(title: string, category?: string): IMANEvent['type'] {
  const titleLower = title.toLowerCase()
  const categoryLower = category?.toLowerCase() || ''
  
  if (titleLower.includes('workshop') || titleLower.includes('training') || categoryLower.includes('workshop')) {
    return 'workshop'
  }
  
  if (titleLower.includes('conference') || titleLower.includes('summit') || categoryLower.includes('conference')) {
    return 'conference'
  }
  
  if (titleLower.includes('social') || titleLower.includes('mixer') || titleLower.includes('happy hour')) {
    return 'social'
  }
  
  // Default to networking
  return 'networking'
}

// Get upcoming events (next 3 months)
export async function getUpcomingEvents(limit: number = 10): Promise<IMANEvent[]> {
  const events = await getIMANEvents()
  return events.slice(0, limit)
}

// Get events by type
export async function getEventsByType(type: IMANEvent['type']): Promise<IMANEvent[]> {
  const events = await getIMANEvents()
  return events.filter(event => event.type === type)
}
