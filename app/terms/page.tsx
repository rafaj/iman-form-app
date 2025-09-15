"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import MobileNavigation from "@/components/mobile-navigation"
import { FileText } from "lucide-react"

export default function TermsOfServicePage() {
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
                <p className="text-xs md:text-sm text-emerald-600">Terms of Service</p>
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
                      <Link href="/events" className="text-emerald-700 hover:text-emerald-900 font-medium">Meetups</Link>
                      <Link href="/forum" className="text-emerald-700 hover:text-emerald-900 font-medium">Forum</Link>
                      <Link href="/mentorship" className="text-emerald-700 hover:text-emerald-900 font-medium">Mentorship</Link>
                    </>
                  )}
                  {session.user?.role === 'ADMIN' && (
                    <Link href="/admin" className="text-emerald-700 hover:text-emerald-900 font-medium">Admin</Link>
                  )}
                  <div className="flex items-center space-x-3">
                    {session.user?.image && (
                      <Image
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="w-8 h-8 rounded-full"
                        width={32}
                        height={32}
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
            <MobileNavigation session={session} isProfessional={isMember} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-xl border-emerald-100">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">
              Terms of Service
            </CardTitle>
            <p className="text-lg text-muted-foreground">
              Effective Date: September 14, 2025
            </p>
          </CardHeader>

          <CardContent className="prose prose-emerald max-w-none">
            <div className="space-y-8 text-gray-700">

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">1. Acceptance of Terms</h2>
                <p>By accessing or using the IMAN Professional Network mobile application ("App") and website at https://www.iman-wa.pro/ ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">2. Description of Service</h2>
                <p>The IMAN Professional Network is a community platform serving the Ithna-asheri Muslim Association of the Northwest (IMAN) and connects Muslim professionals in the Seattle Metro area. Our Service provides:</p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li>Professional networking directory</li>
                  <li>Community events and meetups</li>
                  <li>Discussion forums (tikTalk)</li>
                  <li>Mentorship connections</li>
                  <li>Islamic features (prayer times, Qibla compass)</li>
                  <li>Member application and management system</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">3. User Accounts and Registration</h2>
                <h3 className="text-xl font-medium text-emerald-800 mb-2">3.1 Account Creation</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You must provide accurate, current, and complete information during registration</li>
                  <li>You are responsible for safeguarding your account credentials</li>
                  <li>You must be 18 years or older to create an account</li>
                  <li>Membership applications require sponsor approval</li>
                </ul>

                <h3 className="text-xl font-medium text-emerald-800 mb-2 mt-4">3.2 Account Security</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You are responsible for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                  <li>We reserve the right to suspend accounts that violate these Terms</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">4. Acceptable Use Policy</h2>
                <h3 className="text-xl font-medium text-emerald-800 mb-2">4.1 Permitted Uses</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Professional networking and community engagement</li>
                  <li>Sharing relevant professional opportunities and discussions</li>
                  <li>Participating respectfully in community forums</li>
                  <li>Using Islamic features for personal worship and guidance</li>
                </ul>

                <h3 className="text-xl font-medium text-emerald-800 mb-2 mt-4">4.2 Prohibited Activities</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Harassment, discrimination, or hate speech</li>
                  <li>Sharing false, misleading, or defamatory content</li>
                  <li>Commercial solicitation without permission</li>
                  <li>Violation of others' privacy or intellectual property</li>
                  <li>Attempting to access unauthorized areas of the Service</li>
                  <li>Using the Service for any illegal activities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">5. Content and Intellectual Property</h2>
                <h3 className="text-xl font-medium text-emerald-800 mb-2">5.1 User Content</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You retain ownership of content you post</li>
                  <li>You grant IMAN a license to use, display, and distribute your content within the Service</li>
                  <li>You are responsible for ensuring your content doesn't violate others' rights</li>
                  <li>We reserve the right to remove content that violates these Terms</li>
                </ul>

                <h3 className="text-xl font-medium text-emerald-800 mb-2 mt-4">5.2 IMAN Content</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All Service features, design, and functionality are owned by IMAN</li>
                  <li>You may not copy, modify, or distribute our content without permission</li>
                  <li>Islamic content (prayer times, Qibla calculations) is provided for religious observance</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">6. Privacy and Data Protection</h2>
                <p>Your privacy is important to us. Please review our <Link href="/privacy" className="text-emerald-600 hover:text-emerald-800 underline">Privacy Policy</Link>, which also governs your use of the Service, to understand our practices.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">7. Community Guidelines</h2>
                <h3 className="text-xl font-medium text-emerald-800 mb-2">7.1 Professional Conduct</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Maintain professional and respectful communication</li>
                  <li>Provide accurate professional information</li>
                  <li>Respect others' time and expertise in mentorship interactions</li>
                </ul>

                <h3 className="text-xl font-medium text-emerald-800 mb-2 mt-4">7.2 Religious Respect</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Honor the Islamic values that unite our community</li>
                  <li>Use Islamic features respectfully for worship</li>
                  <li>Avoid content that conflicts with Islamic principles</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">8. Mentorship Program</h2>
                <h3 className="text-xl font-medium text-emerald-800 mb-2">8.1 Mentor Responsibilities</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide guidance in your areas of expertise</li>
                  <li>Maintain professional boundaries</li>
                  <li>Respond to mentorship requests in a timely manner</li>
                </ul>

                <h3 className="text-xl font-medium text-emerald-800 mb-2 mt-4">8.2 Mentee Responsibilities</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Be respectful of mentors' time and expertise</li>
                  <li>Come prepared to mentorship sessions</li>
                  <li>Provide feedback to help improve the program</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">9. Events and Meetups</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Event information is provided for community benefit</li>
                  <li>Registration and attendance policies are set by event organizers</li>
                  <li>IMAN is not responsible for third-party events listed on the platform</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">10. Disclaimers and Limitations</h2>
                <h3 className="text-xl font-medium text-emerald-800 mb-2">10.1 Service Availability</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We strive for continuous service but cannot guarantee 100% uptime</li>
                  <li>We reserve the right to modify or discontinue features with notice</li>
                </ul>

                <h3 className="text-xl font-medium text-emerald-800 mb-2 mt-4">10.2 Islamic Content Accuracy</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Prayer times and Qibla directions are calculated using recognized Islamic methods</li>
                  <li>Users should verify with local Islamic authorities for critical religious observances</li>
                  <li>We are not responsible for worship practices based solely on app calculations</li>
                </ul>

                <h3 className="text-xl font-medium text-emerald-800 mb-2 mt-4">10.3 Professional Networking</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We do not endorse or verify professional qualifications</li>
                  <li>Networking connections and opportunities are user-generated</li>
                  <li>Exercise professional judgment in all interactions</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">11. Limitation of Liability</h2>
                <p>To the fullest extent permitted by law, IMAN shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">12. Indemnification</h2>
                <p>You agree to defend, indemnify, and hold IMAN harmless from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">13. Termination</h2>
                <h3 className="text-xl font-medium text-emerald-800 mb-2">13.1 By You</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You may delete your account at any time through the app settings</li>
                  <li>Termination does not relieve you of obligations incurred before termination</li>
                </ul>

                <h3 className="text-xl font-medium text-emerald-800 mb-2 mt-4">13.2 By IMAN</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We may suspend or terminate accounts for violations of these Terms</li>
                  <li>We may terminate the Service with 30 days' notice</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">14. Changes to Terms</h2>
                <p>We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or app notification. Continued use constitutes acceptance of modified Terms.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">15. Governing Law</h2>
                <p>These Terms are governed by the laws of the State of Washington, United States, without regard to conflict of law principles.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">16. Contact Information</h2>
                <p>For questions about these Terms, contact us at:</p>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-4">
                  <p className="font-semibold text-emerald-900">Ithna-asheri Muslim Association of the Northwest (IMAN)</p>
                  <p>515 State Street<br />Kirkland, WA 98033</p>
                  <p>Email: admin@iman.org<br />Website: https://www.iman-wa.pro/</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">17. Severability</h2>
                <p>If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.</p>
              </section>

              <div className="text-center pt-8 border-t border-emerald-200">
                <p className="text-sm text-gray-600">
                  <em>These Terms of Service are effective as of September 14, 2025, and were last updated on September 14, 2025.</em>
                </p>
                <div className="mt-6">
                  <Link href="/">
                    <Button
                      variant="outline"
                      className="px-8 hover:border-emerald-500 hover:text-emerald-600"
                    >
                      Return to Home
                    </Button>
                  </Link>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer with Legal Links */}
      <footer className="bg-emerald-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
                <li><Link href="/apply" className="hover:text-white">Apply</Link></li>
                <li><Link href="/auth/signin" className="hover:text-white">Professional Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-emerald-200">
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-emerald-200">
                <div>admin@iman.org</div>
                <div>(206) 202-IMAN (4626)</div>
                <div>515 State St. S<br />Kirkland, WA 98033</div>
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