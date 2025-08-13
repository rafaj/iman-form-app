import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Building2, ArrowRight, MapPin, Clock, ExternalLink, Mail, Phone } from "lucide-react"
import Link from "next/link"
import { getUpcomingEvents, type IMANEvent } from "@/lib/eventbrite"
import { prisma } from "@/lib/database"

// Force dynamic rendering to show new sponsors immediately
export const dynamic = 'force-dynamic'

type Event = IMANEvent

type CommunitySpotlight = {
  id: string
  name: string
  logoUrl?: string | null
  website?: string | null
  description: string
  active: boolean
}

export default async function HomePage() {
  // Try to get real events from Eventbrite, fall back to mock data
  let upcomingEvents: Event[] = []
  
  try {
    upcomingEvents = await getUpcomingEvents(12)
  } catch {
    console.log('Eventbrite API not available, using mock data')
  }

  // If no events from API, show mock data
  if (upcomingEvents.length === 0) {
    upcomingEvents = generateMockEvents()
  }

  // Fetch real community spotlights from database
  let communitySpotlights: CommunitySpotlight[] = []
  try {
    const dbCommunitySpotlights = await prisma.sponsor.findMany({
      where: { active: true },
      orderBy: [
        { createdAt: 'desc' }
      ]
    })
    communitySpotlights = dbCommunitySpotlights
    console.log(`Found ${communitySpotlights.length} active community spotlights:`, communitySpotlights.map(s => ({ name: s.name })))
  } catch (error) {
    console.log('Failed to fetch community spotlights:', error)
    // Fallback to empty array - no community spotlights shown if database fails
    communitySpotlights = []
  }

function generateMockEvents(): Event[] {
  const events = []
  const today = new Date()
  const currentDate = new Date(today)
  
  // Find next Thursday
  const daysUntilThursday = (4 - currentDate.getDay() + 7) % 7
  if (daysUntilThursday === 0 && currentDate.getHours() >= 18) {
    // If it's Thursday after 6 PM, start from next Thursday
    currentDate.setDate(currentDate.getDate() + 7)
  } else {
    currentDate.setDate(currentDate.getDate() + daysUntilThursday)
  }

  const eventTypes = [
    { type: 'networking', title: 'Weekly Networking Mixer', description: 'Join fellow professionals for networking and refreshments' },
    { type: 'workshop', title: 'Professional Development Workshop', description: 'Skills development for career advancement' },
    { type: 'social', title: 'Community Social Hour', description: 'Casual gathering for community building' },
    { type: 'networking', title: 'Industry Meetup', description: 'Connect with professionals in your field' }
  ] as const

  for (let i = 0; i < 12; i++) {
    const eventTemplate = eventTypes[i % eventTypes.length]
    const eventDate = new Date(currentDate)
    eventDate.setDate(currentDate.getDate() + (i * 7))

    events.push({
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

  return events
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

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-emerald-900">IMAN Professional Network</h1>
                <p className="text-sm text-emerald-600">Connecting Professionals in the Seattle Metro</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/events" className="text-emerald-700 hover:text-emerald-900 font-medium">Events</Link>
              <a href="#spotlight" className="text-emerald-700 hover:text-emerald-900 font-medium">Community Spotlight</a>
              <a href="#about" className="text-emerald-700 hover:text-emerald-900 font-medium">About</a>
              <Link href="/apply">
                <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                  Become a Member
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xl text-emerald-700 mb-8 max-w-3xl mx-auto">
            Join a thriving community of Muslim professionals in the Seattle Metro. 
            Network, learn, and grow together through meaningful connections and professional development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3">
                <Users className="h-5 w-5 mr-2" />
                Join Our Network
              </Button>
            </Link>
            <Link href="/events">
              <Button size="lg" variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-8 py-3">
                <Calendar className="h-5 w-5 mr-2" />
                View Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section id="events" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-emerald-900 mb-4">Upcoming Events</h3>
            <p className="text-emerald-700 max-w-2xl mx-auto">
              Join us every Thursday for networking, professional development, and community building events at the IMAN Center
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingEvents.slice(0, 3).map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getEventTypeColor(event.type)}>
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </Badge>
                  </div>
                  <CardTitle className="text-emerald-900">{event.title}</CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-emerald-600" />
                      {event.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
                      {event.location}
                    </div>
                  </div>
                  <Link href={event.registrationUrl} passHref>
                    <Button className="w-full mt-4" variant="outline">
                      Learn More
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/events">
              <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50">
                View All Events
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Community Spotlight Section */}
      <section id="spotlight" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-emerald-900 mb-4">Community Spotlight</h3>
            <p className="text-emerald-700 max-w-2xl mx-auto">
              Highlighting the amazing organizations and individuals in our community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {communitySpotlights.slice(0, 3).map((spotlight) => (
              <Card key={spotlight.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  
                  {spotlight.logoUrl && (
                    <div className="mb-4">
                      {spotlight.website ? (
                        <a href={spotlight.website} target="_blank" rel="noopener noreferrer">
                          <img
                            src={spotlight.logoUrl}
                            alt={`${spotlight.name} logo`}
                            className="h-12 w-auto object-contain"
                          />
                        </a>
                      ) : (
                        <img
                          src={spotlight.logoUrl}
                          alt={`${spotlight.name} logo`}
                          className="h-12 w-auto object-contain"
                        />
                      )}
                    </div>
                  )}
                  <CardTitle className="text-emerald-900">{spotlight.name}</CardTitle>
                  <CardDescription>{spotlight.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {spotlight.website && (
                    <a 
                      href={spotlight.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-emerald-600 hover:text-emerald-700"
                    >
                      Visit Website
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-emerald-900 mb-6">About IMAN Professional Network</h3>
              <p className="text-emerald-700 mb-6">
                The IMAN Professional Network is a vibrant community of Muslim professionals 
                in the Seattle Metro, dedicated to fostering career growth, meaningful 
                connections, and positive impact in our communities.
              </p>
              <p className="text-emerald-700 mb-6">
                Through networking events, professional development workshops, and community 
                service initiatives, we empower our members to excel in their careers while 
                staying true to their values and faith.
              </p>
              <Link href="/apply">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Join Our Community
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="bg-emerald-100 rounded-lg p-8">
              <h4 className="text-xl font-semibold text-emerald-900 mb-4">Get Involved</h4>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-emerald-600 mr-3" />
                  <span className="text-emerald-700">Attend networking events</span>
                </div>
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 text-emerald-600 mr-3" />
                  <span className="text-emerald-700">Professional development workshops</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-emerald-600 mr-3" />
                  <span className="text-emerald-700">Community service projects</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-emerald-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xl font-semibold mb-4">IMAN Professional Network</h4>
              <p className="text-emerald-200">
                Connecting Muslim professionals in the Seattle Metro through 
                networking, professional development, and community service.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-emerald-200">
                <li><Link href="/events" className="hover:text-white">Events</Link></li>
                <li><a href="#spotlight" className="hover:text-white">Community Spotlight</a></li>
                <li><Link href="/apply" className="hover:text-white">Become a Member</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-emerald-200">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>info@iman-wa.org</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>(206) 202-IMAN (4626)</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-1" />
                  <div>
                    <div>IMAN Center</div>
                    <div>515 State St. S</div>
                    <div>Kirkland, WA 98033</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-emerald-800 mt-8 pt-8 text-center text-emerald-200">
            <p>&copy; 2025 IMAN Professional Network. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
