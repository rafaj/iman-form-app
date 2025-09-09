import { NextResponse } from "next/server"
import { getUpcomingEvents } from "@/lib/eventbrite"

export async function GET(request: Request) {
  try {
    // Simple API key authentication for mobile
    const authHeader = request.headers.get('Authorization')
    const expectedKey = process.env.MOBILE_API_KEY || 'iman-mobile-2024'
    
    if (!authHeader || !authHeader.includes(expectedKey)) {
      return NextResponse.json(
        { success: false, message: "Invalid API key" },
        { status: 401 }
      )
    }

    console.log('📱 Mobile events API accessed')

    // Fetch upcoming events from Eventbrite
    const events = await getUpcomingEvents()
    
    // Transform events for mobile consumption
    const mobileEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.date,
      endDate: event.date, // Using same date since we have date and time separate
      time: event.time,
      location: event.location,
      isOnline: event.location === 'Online Event',
      eventUrl: event.registrationUrl,
      imageUrl: event.imageUrl,
      hasAvailableTickets: event.hasAvailableTickets
    }))

    console.log(`✅ Mobile events: returning ${mobileEvents.length} events`)

    return NextResponse.json({
      success: true,
      events: mobileEvents,
      totalCount: mobileEvents.length
    })

  } catch (error) {
    console.error('❌ Mobile events error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch events',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}