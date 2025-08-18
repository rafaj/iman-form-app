import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, MapPin, Clock, ExternalLink } from "lucide-react"
import Link from "next/link"
import { getUpcomingEvents, type IMANEvent } from "@/lib/eventbrite"
import { auth, signOut } from "@/auth"
import { prisma } from "@/lib/database"

type Event = IMANEvent

export default async function EventsPage() {
  const session = await auth()
  
  // Check if user is an actual member (has completed activation)
  let isMember = false
  if (session?.user?.id) {
    try {
      // Allow admin users to see member content
      if (session.user.email === process.env.ADMIN_EMAIL) {
        isMember = true
      } else {
        const member = await prisma.member.findUnique({
          where: { userId: session.user.id }
        })
        isMember = !!member
      }
    } catch (error) {
      console.error("Error checking member status:", error)
      if (session.user.email === process.env.ADMIN_EMAIL) {
        isMember = true
      }
    }
  }

  const events = await getUpcomingEvents(16)

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
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-emerald-900">IMAN Professional Network</h1>
                <p className="text-sm text-emerald-600">Events - Every Thursday at the IMAN Center</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8 items-center">
              {session ? (
                <>
                  <Link href="/" className="text-emerald-700 hover:text-emerald-900 font-medium">Home</Link>
                  {isMember && (
                    <Link href="/events" className="text-emerald-700 hover:text-emerald-900 font-medium border-b-2 border-emerald-600">Events</Link>
                  )}
                  <Link href="/apply" className="text-emerald-700 hover:text-emerald-900 font-medium">Apply</Link>
                  {session.user?.role === 'ADMIN' && (
                    <Link href="/admin" className="text-emerald-700 hover:text-emerald-900 font-medium">Admin</Link>
                  )}
                  <div className="flex items-center space-x-3">
                    {session.user?.image && (
                      <img 
                        src={session.user.image} 
                        alt={session.user.name || "User"} 
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="text-sm font-medium text-emerald-700">{session.user?.name}</span>
                  </div>
                  <form action={async () => { "use server"; await signOut() }}>
                    <Button type="submit" variant="outline" size="sm" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                      Sign Out
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/#about" className="text-emerald-700 hover:text-emerald-900 font-medium">About</Link>
                  <Link href="/events" className="text-emerald-700 hover:text-emerald-900 font-medium border-b-2 border-emerald-600">Events</Link>
                  <Link href="/auth/signin" className="text-emerald-700 hover:text-emerald-900 font-medium">
                    Member Sign In
                  </Link>
                  <Link href="/apply">
                    <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                      Become a Member
                    </Button>
                  </Link>
                </>
              )}
            </nav>
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
                {event.imageUrl && (
                  <img 
                    src={event.imageUrl} 
                    alt={event.title} 
                    className="w-full h-48 object-cover rounded-t-lg" 
                  />
                )}
                <div className="flex flex-col sm:flex-row">
                  {/* Date Column */}
                  <div className="bg-emerald-600 text-white p-4 flex items-center sm:flex-col sm:items-center sm:justify-center sm:p-6 sm:w-32">
                    <div className="text-2xl font-bold sm:text-3xl">{dateInfo.day}</div>
                    <div className="ml-4 sm:ml-0 sm:mt-1">
                        <div className="text-sm uppercase tracking-wide">{dateInfo.month}</div>
                        <div className="text-xs opacity-90 hidden sm:block">{dateInfo.weekday}</div>
                    </div>
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
