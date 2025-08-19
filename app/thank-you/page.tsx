"use client"

import { CheckCircle2, Clock, Mail, Phone, MapPin } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import MobileNavigation from "@/components/mobile-navigation"

export default function ThankYouPage() {
  const { data: session } = useSession()
  const [isMember, setIsMember] = useState(false)

  useEffect(() => {
    if (session?.user?.email) {
      checkMemberStatus()
    }
  }, [session])

  const checkMemberStatus = async () => {
    if (!session?.user?.email) return
    
    try {
      const response = await fetch('/api/auth/check-admin')
      const data = await response.json()
      setIsMember(data.isMember || data.isAdmin)
    } catch (error) {
      console.error('Error checking member status:', error)
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
                <h1 className="text-xl md:text-2xl font-bold text-emerald-900">IMAN Professional Network</h1>
                <p className="text-xs md:text-sm text-emerald-600">Application Submitted</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 items-center">
              {session ? (
                <>
                  <Link href="/" className="text-emerald-700 hover:text-emerald-900 font-medium">Home</Link>
                  {isMember && (
                    <>
                      <Link href="/directory" className="text-emerald-700 hover:text-emerald-900 font-medium">Directory</Link>
                      <Link href="/events" className="text-emerald-700 hover:text-emerald-900 font-medium">Events</Link>
                    </>
                  )}
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
                    <Link href="/profile" className="text-sm font-medium text-emerald-700 hover:text-emerald-900 transition-colors">
                      {session.user?.name}
                    </Link>
                  </div>
                  <Button 
                    onClick={() => signOut()}
                    variant="outline" 
                    size="sm" 
                    className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/#about" className="text-emerald-700 hover:text-emerald-900 font-medium">About</Link>
                  <Link href="/apply" className="text-emerald-700 hover:text-emerald-900 font-medium">Apply</Link>
                  <Link href="/auth/signin" className="text-emerald-700 hover:text-emerald-900 font-medium">
                    Member Sign In
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile Navigation */}
            <MobileNavigation session={session} isMember={isMember} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-2xl shadow-xl border-emerald-100">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <CardTitle className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">
                Application Submitted Successfully!
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground">
                Thank you for your interest in joining IMAN Professional Network
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Clock className="w-6 h-6 text-emerald-600 mt-1" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-emerald-900 mb-2">What happens next?</h3>
                    <ul className="text-emerald-800 space-y-2 text-sm">
                      <li>• Your sponsor will receive an email notification</li>
                      <li>• They will review your application and provide approval</li>
                      <li>• You&apos;ll be notified once a decision has been made</li>
                      <li>• The review process typically takes 3-5 business days</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Mail className="w-6 h-6 text-amber-600 mt-1" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900 mb-2">Important Notes</h3>
                    <ul className="text-amber-800 space-y-2 text-sm">
                      <li>• Please check your email regularly for updates</li>
                      <li>• Your application will expire after 7 days if not reviewed</li>
                      <li>• Contact your sponsor if you have any questions</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4">
                <p className="text-muted-foreground mb-6">
                  We appreciate your patience during the review process.
                </p>
                <Link href="/">
                  <Button 
                    variant="outline" 
                    className="px-8 hover:border-emerald-500 hover:text-emerald-600"
                  >
                    Return to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

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
                <li><Link href="/" className="hover:text-white">Home</Link></li>
                {session && isMember && (
                  <>
                    <li><Link href="/directory" className="hover:text-white">Directory</Link></li>
                    <li><Link href="/events" className="hover:text-white">Events</Link></li>
                  </>
                )}
                {!session && (
                  <>
                    <li><Link href="/apply" className="hover:text-white">Apply</Link></li>
                    <li><Link href="/auth/signin" className="hover:text-white">Member Sign In</Link></li>
                  </>
                )}
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
