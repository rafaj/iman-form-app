import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, MapPin, Clock, ExternalLink } from "lucide-react"
import Link from "next/link"
import { getUpcomingEvents, type IMANEvent } from "@/lib/eventbrite"

type Event = IMANEvent

export default async function EventsPage() {
  // Try to get real events from Eventbrite, fall back to mock data
  let events: Event[] = []
  
  try {
    events = await getUpcomingEvents(16)
  } catch (error) {
    console.log('Eventbrite API not available, using mock data')
    // Generate mock events for demo
    events = generateMockEvents()
  }

  // If no events from API, show mock data
  if (events.length === 0) {
    events = generateMockEvents()
  }

function generateMockEvents(): Event[] {
  const mockEvents = []
  const today = new Date()
  const currentDate = new Date(today)
  
  // Find next Thursday
  const daysUntilThursday = (4 - currentDate.getDay() + 7) % 7
  if (daysUntilThursday === 0 && currentDate.getHours() >= 18) {
    currentDate.setDate(currentDate.getDate() + 7)
  } else {
    currentDate.setDate(currentDate.getDate() + daysUntilThursday)
  }

  const eventTypes = [
    { type: 'networking', title: 'Weekly Networking Mixer', description: 'Join fellow professionals for networking and refreshments. Connect with like-minded individuals and expand your professional network.' },
    { type: 'workshop', title: 'Professional Development Workshop', description: 'Skills development for career advancement. Learn new techniques and strategies to excel in your professional journey.' },
    { type: 'social', title: 'Community Social Hour', description: 'Casual gathering for community building. Relax and connect with community members in a friendly, informal setting.' },
    { type: 'networking', title: 'Industry Meetup', description: 'Connect with professionals in your field. Share experiences, discuss industry trends, and build meaningful connections.' },
    { type: 'workshop', title: 'Leadership Skills Workshop', description: 'Develop your leadership capabilities. Learn essential leadership skills and techniques for managing teams effectively.' },
    { type: 'social', title: 'Family Social Event', description: 'Bring your family for a community gathering. Enjoy activities for all ages while building community connections.' }
  ] as const

  for (let i = 0; i < 16; i++) {
    const eventTemplate = eventTypes[i % eventTypes.length]
    const eventDate = new Date(currentDate)
    eventDate.setDate(currentDate.getDate() + (i * 7))

    mockEvents.push({
      id: (i + 1).toString(),
      title: eventTemplate.title,
      description: eventTemplate.description,
      date: eventDate.toISOString().split('T')[0],
      time: '6:00 PM - 8:00 PM',
      location: 'IMAN Center, Kirkland',
      type: eventTemplate.type,
      registrationUrl: `https://eventbrite.com/e/iman-${i + 1}`,
      hasAvailableTickets: true
    })
  }

  return mockEvents
}

  const getEventTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'networking': return 'bg-blue-100 text-blue-800'
      case 'workshop': return 'bg-green-100 text-green-800'
      case 'conference': return 'bg-purple-100 text-purple-800'
      case 'social': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      day: date.getDate(),
      weekday: date.toLocaleDateString('en-US', { weekday: 'long' }),
      fullDate: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-emerald-900">IMAN Events</h1>
                <p className="text-sm text-emerald-600">Every Thursday at the IMAN Center</p>
              </div>
            </div>
            <Link href="/apply">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Users className="h-4 w-4 mr-2" />
                Become a Member
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Events List */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-emerald-900 mb-4">Upcoming Events</h2>
          <p className="text-emerald-700">
            Join us every Thursday for networking, professional development, and community building at the IMAN Center in Kirkland.
          </p>
        </div>

        <div className="space-y-6">
          {events.map((event) => {
            const dateInfo = formatDate(event.date)
            return (
              <Card key={event.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="flex">
                  {/* Date Column */}
                  <div className="bg-emerald-600 text-white p-6 flex flex-col items-center justify-center min-w-[120px]">
                    <div className="text-2xl font-bold">{dateInfo.day}</div>
                    <div className="text-sm uppercase tracking-wide">{dateInfo.month}</div>
                    <div className="text-xs mt-1 opacity-90">{dateInfo.weekday}</div>
                  </div>
                  
                  {/* Event Details */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <Badge className={`${getEventTypeColor(event.type)} mb-2`}>
                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                        </Badge>
                        <h3 className="text-xl font-semibold text-emerald-900 mb-2">{event.title}</h3>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4 leading-relaxed">{event.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-emerald-600" />
                        {event.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
                        {event.location}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <a 
                        href={event.registrationUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                          Register on Eventbrite
                        </Button>
                      </a>
                      <a 
                        href={event.registrationUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button size="sm" variant="outline">
                          Event Details
                          <ExternalLink className="h-3 w-3 ml-2" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center bg-white rounded-lg p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-emerald-900 mb-4">Ready to Join Us?</h3>
          <p className="text-emerald-700 mb-6">
            Become a member of the IMAN Professional Network and get access to all our events, 
            networking opportunities, and professional development resources.
          </p>
          <Link href="/apply">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              <Users className="h-5 w-5 mr-2" />
              Become a Member Today
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-emerald-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4">
            <h4 className="text-lg font-semibold mb-2">IMAN Center</h4>
            <p className="text-emerald-200">515 State St. S, Kirkland, WA 98033</p>
            <p className="text-emerald-200">(206) 202-IMAN (4626)</p>
          </div>
          <p className="text-emerald-200 text-sm">
            &copy; 2025 IMAN Professional Network. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
