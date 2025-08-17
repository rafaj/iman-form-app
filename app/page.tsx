import { Button } from "@/components/ui/button"
import { Users, Building2, ArrowRight, Mail, Phone, MapPin, Calendar } from "lucide-react"
import Link from "next/link"
import { auth, signOut } from "@/auth"
import { prisma } from "@/lib/database"

export default async function HomePage() {
  const session = await auth()
  
  // Check if user is an actual member (has completed activation)
  let isMember = false
  if (session?.user?.id) {
    try {
      // Allow admin users to see member content in development
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
      // Fallback for admin in case of database issues
      if (session.user.email === process.env.ADMIN_EMAIL) {
        isMember = true
      }
    }
  }

  // Generate mock events
  function generateMockEvents() {
    const events = [
      {
        id: 1,
        title: "Professional Networking Mixer",
        date: "2025-01-25",
        time: "6:00 PM - 8:00 PM",
        location: "IMAN Center",
        description: "Join fellow professionals for an evening of networking and meaningful connections."
      },
      {
        id: 2,
        title: "Career Development Workshop",
        date: "2025-02-08",
        time: "10:00 AM - 12:00 PM",
        location: "Virtual",
        description: "Learn strategies for advancing your career while maintaining your values."
      },
      {
        id: 3,
        title: "Community Service Project",
        date: "2025-02-15",
        time: "9:00 AM - 3:00 PM",
        location: "Local Community Center",
        description: "Give back to the community through volunteer work and service."
      }
    ]
    return events
  }

  const events = generateMockEvents()

  // Fetch community spotlight data from database
  let communitySpotlight = []
  try {
    const sponsors = await prisma.sponsor.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' }
    })
    
    communitySpotlight = sponsors.map(sponsor => ({
      id: sponsor.id,
      name: sponsor.name,
      logo: sponsor.logoUrl || '/placeholder-logo.png',
      website: sponsor.website || '#',
      description: sponsor.description
    }))
  } catch (error) {
    console.error("Error fetching community spotlight data:", error)
    // Fallback to empty array if database fails
    communitySpotlight = []
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
            <nav className="hidden md:flex space-x-8 items-center">
              {session ? (
                <>
                  <Link href="/" className="text-emerald-700 hover:text-emerald-900 font-medium">Home</Link>
                  {isMember && (
                    <Link href="/events" className="text-emerald-700 hover:text-emerald-900 font-medium">Events</Link>
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
                  <a href="#about" className="text-emerald-700 hover:text-emerald-900 font-medium">About</a>
                  <Link href="/events" className="text-emerald-700 hover:text-emerald-900 font-medium">Events</Link>
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

      {/* Hero Section - For non-members (including non-logged-in users) */}
      {!isMember && (
        <section className="relative py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-emerald-900 mb-6">
                IMAN Professional Network
              </h1>
              <p className="text-xl md:text-2xl text-emerald-700 mb-8 max-w-4xl mx-auto">
                Connecting Muslim professionals in the Seattle Metro through meaningful 
                relationships, career growth, and community impact.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/apply">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg">
                    <Users className="h-6 w-6 mr-2" />
                    Join Our Network
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button variant="outline" size="lg" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-8 py-4 text-lg">
                    Sign In with Google
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Welcome Section - For members only */}
      {isMember && (
        <section className="relative py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-emerald-900 mb-2">
                Welcome back, {session.user?.name}!
              </h1>
              <p className="text-emerald-700">
                Stay connected with your professional community
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Mission Section - Only show for non-members */}
      {!isMember && (
        <section id="about" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-emerald-900 mb-6">Our Mission</h2>
                <p className="text-emerald-700 mb-6 text-lg">
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
                    Learn More About Membership
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="bg-emerald-50 rounded-lg p-8">
                <h3 className="text-xl font-semibold text-emerald-900 mb-6">What We Offer</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Users className="h-6 w-6 text-emerald-600 mr-3 flex-shrink-0" />
                    <span className="text-emerald-700">Weekly networking events and mixers</span>
                  </div>
                  <div className="flex items-center">
                    <Building2 className="h-6 w-6 text-emerald-600 mr-3 flex-shrink-0" />
                    <span className="text-emerald-700">Professional development workshops</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-6 w-6 text-emerald-600 mr-3 flex-shrink-0" />
                    <span className="text-emerald-700">Community service opportunities</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-6 w-6 text-emerald-600 mr-3 flex-shrink-0" />
                    <span className="text-emerald-700">Mentorship and career guidance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Values Section - Only show for non-members */}
      {!isMember && (
        <section className="py-20 bg-emerald-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-emerald-900 mb-4">Our Values</h2>
              <p className="text-emerald-700 max-w-2xl mx-auto">
                We believe in building a community that reflects our shared values and commitments.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-emerald-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-emerald-900 mb-3">Community</h3>
                <p className="text-emerald-700">
                  Building lasting relationships and supporting one another's success through shared experiences and mutual growth.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-emerald-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-emerald-900 mb-3">Excellence</h3>
                <p className="text-emerald-700">
                  Striving for professional excellence while maintaining our Islamic values and ethical principles in all endeavors.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-emerald-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-emerald-900 mb-3">Impact</h3>
                <p className="text-emerald-700">
                  Making a positive difference in our local community and beyond through service and professional contribution.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Events Section - Only show for members */}
      {isMember && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-emerald-900 mb-4">Upcoming Events</h3>
              <p className="text-emerald-700 mb-6">Join us for weekly networking and professional development</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {events.map((event) => (
                <div key={event.id} className="bg-emerald-50 rounded-lg p-6 border border-emerald-200 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-emerald-900 mb-2">{event.title}</h4>
                      <div className="space-y-1 text-sm text-emerald-700">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="ml-6">{event.time}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-emerald-700 text-sm mb-4">{event.description}</p>
                  <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Learn More
                  </Button>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link href="/events">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                  <Calendar className="h-5 w-5 mr-2" />
                  View All Events
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Community Spotlight Section - Only show for members */}
      {isMember && (
        <section className="py-20 bg-emerald-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-emerald-900 mb-4">Community Spotlight</h3>
              <p className="text-emerald-700 max-w-2xl mx-auto">
                Proud to be supported by these outstanding organizations in our community.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {communitySpotlight.map((member) => (
                <div key={member.id} className="bg-white rounded-lg p-6 border border-emerald-200 hover:shadow-lg transition-all duration-300 hover:border-emerald-300">
                  <a 
                    href={member.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="flex items-center gap-6 mb-4">
                      <div className="flex-shrink-0">
                        <img 
                          src={member.logo} 
                          alt={member.name}
                          className="h-24 w-24 object-contain rounded-lg border-2 border-emerald-100 shadow-md p-3 bg-white"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xl font-semibold text-emerald-900">{member.name}</h4>
                      </div>
                    </div>
                    {member.description && (
                      <p className="text-sm text-emerald-600 line-clamp-3">{member.description}</p>
                    )}
                  </a>
                </div>
              ))}
              {communitySpotlight.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <Building2 className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                  <p className="text-emerald-600">No community members in spotlight yet.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

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
                <li><a href="#about" className="hover:text-white">About</a></li>
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
