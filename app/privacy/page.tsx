"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import MobileNavigation from "@/components/mobile-navigation"
import { Shield } from "lucide-react"

export default function PrivacyPolicyPage() {
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
                <p className="text-xs md:text-sm text-emerald-600">Privacy Policy</p>
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
              <Shield className="w-8 h-8 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">
              Privacy Policy
            </CardTitle>
            <p className="text-lg text-muted-foreground">
              Effective Date: September 14, 2025
            </p>
          </CardHeader>

          <CardContent className="prose prose-emerald max-w-none">
            <div className="space-y-8 text-gray-700">

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">1. Introduction</h2>
                <p>The Ithna-asheri Muslim Association of the Northwest (&quot;IMAN,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our IMAN Professional Network mobile application and website at https://www.iman-wa.pro/ (collectively, the &quot;Service&quot;).</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">2. Information We Collect</h2>
                <h3 className="text-xl font-medium text-emerald-800 mb-2">2.1 Personal Information You Provide</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Account Information</strong>: Name, email address, professional details</li>
                  <li><strong>Profile Information</strong>: Professional qualifications, employer, education, skills, LinkedIn profile</li>
                  <li><strong>Application Data</strong>: Membership application details, sponsor information</li>
                  <li><strong>Community Contributions</strong>: Posts, comments, forum discussions</li>
                  <li><strong>Mentorship Information</strong>: Mentor/mentee profiles, requests, and communications</li>
                  <li><strong>Communications</strong>: Messages sent through our platform</li>
                </ul>

                <h3 className="text-xl font-medium text-emerald-800 mb-2 mt-4">2.2 Automatically Collected Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Device Information</strong>: Device type, operating system, app version</li>
                  <li><strong>Usage Data</strong>: App features used, time spent, interaction patterns</li>
                  <li><strong>Location Data</strong>: GPS coordinates for prayer times and Qibla direction (when permission granted)</li>
                  <li><strong>Technical Data</strong>: IP address, browser type, access times</li>
                </ul>

                <h3 className="text-xl font-medium text-emerald-800 mb-2 mt-4">2.3 Islamic Feature Data</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Prayer Times</strong>: Location data for accurate prayer time calculations</li>
                  <li><strong>Qibla Compass</strong>: Device compass and magnetometer data</li>
                  <li><strong>IMAN Center</strong>: Distance and direction calculations to our physical location</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">3. How We Use Your Information</h2>
                <h3 className="text-xl font-medium text-emerald-800 mb-2">3.1 Core Service Provision</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Facilitate professional networking within the Muslim community</li>
                  <li>Enable mentorship connections and communications</li>
                  <li>Provide accurate Islamic prayer times and Qibla direction</li>
                  <li>Manage community events and meetups</li>
                  <li>Operate discussion forums and social features</li>
                </ul>

                <h3 className="text-xl font-medium text-emerald-800 mb-2 mt-4">3.2 Account and Security</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Create and manage user accounts</li>
                  <li>Authenticate users via magic link email system</li>
                  <li>Prevent fraud and ensure platform security</li>
                  <li>Verify membership applications with sponsors</li>
                </ul>

                <h3 className="text-xl font-medium text-emerald-800 mb-2 mt-4">3.3 Communication</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Send important service updates and notifications</li>
                  <li>Respond to user inquiries and support requests</li>
                  <li>Notify users of mentorship requests and community activities</li>
                  <li>Share relevant community announcements</li>
                </ul>

                <h3 className="text-xl font-medium text-emerald-800 mb-2 mt-4">3.4 Service Improvement</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Analyze usage patterns to improve user experience</li>
                  <li>Develop new features based on community needs</li>
                  <li>Ensure technical performance and reliability</li>
                  <li>Conduct research for Islamic feature accuracy</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">4. Information Sharing and Disclosure</h2>
                <h3 className="text-xl font-medium text-emerald-800 mb-2">4.1 Within the IMAN Community</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Directory Information</strong>: Professional profiles are visible to verified members</li>
                  <li><strong>Forum Posts</strong>: Public discussions are visible to all community members</li>
                  <li><strong>Mentorship Profiles</strong>: Available to facilitate mentor-mentee connections</li>
                  <li><strong>Event Participation</strong>: May be visible to other attendees</li>
                </ul>

                <h3 className="text-xl font-medium text-emerald-800 mb-2 mt-4">4.2 Service Providers</h3>
                <p>We may share information with trusted third parties who assist in operating our Service:</p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li><strong>Email Services</strong>: For magic link authentication and notifications</li>
                  <li><strong>Event Platforms</strong>: Eventbrite integration for community events</li>
                  <li><strong>Analytics Services</strong>: To understand and improve user experience</li>
                  <li><strong>Technical Support</strong>: For app maintenance and security</li>
                </ul>

                <h3 className="text-xl font-medium text-emerald-800 mb-2 mt-4">4.3 Legal Requirements</h3>
                <p>We may disclose information when required by law or to:</p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li>Comply with legal process or government requests</li>
                  <li>Protect the rights, property, or safety of IMAN, users, or others</li>
                  <li>Enforce our Terms of Service</li>
                  <li>Investigate potential violations or security issues</li>
                </ul>

                <h3 className="text-xl font-medium text-emerald-800 mb-2 mt-4">4.4 We Do Not Sell Personal Information</h3>
                <p>We do not sell, rent, or trade your personal information to third parties for their marketing purposes.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">5. Data Security</h2>
                <h3 className="text-xl font-medium text-emerald-800 mb-2">5.1 Technical Safeguards</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Secure API authentication with bearer tokens</li>
                  <li>Regular security updates and monitoring</li>
                  <li>Limited access to personal information on a need-to-know basis</li>
                </ul>

                <h3 className="text-xl font-medium text-emerald-800 mb-2 mt-4">5.2 Account Security</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Magic link authentication for secure, password-free access</li>
                  <li>Biometric authentication support (Face ID, Touch ID)</li>
                  <li>Session management and automatic logout</li>
                  <li>Cookie and session security measures</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">6. Location Data and Islamic Features</h2>
                <h3 className="text-xl font-medium text-emerald-800 mb-2">6.1 Location Usage</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Prayer Times</strong>: Your location is used to calculate accurate Islamic prayer times</li>
                  <li><strong>Qibla Direction</strong>: GPS coordinates determine precise direction to Kaaba in Mecca</li>
                  <li><strong>IMAN Center</strong>: Distance and directions to our physical location in Kirkland, WA</li>
                  <li><strong>Precision</strong>: Location data is processed locally on your device when possible</li>
                </ul>

                <h3 className="text-xl font-medium text-emerald-800 mb-2 mt-4">6.2 Location Control</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You can deny location access and manually set your location</li>
                  <li>Location sharing is optional for prayer time features</li>
                  <li>You can disable location services at any time in device settings</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">7. Your Privacy Rights and Choices</h2>
                <h3 className="text-xl font-medium text-emerald-800 mb-2">7.1 Access and Control</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Profile Management</strong>: Update your professional information at any time</li>
                  <li><strong>Privacy Settings</strong>: Control visibility of your information to other members</li>
                  <li><strong>Communication Preferences</strong>: Opt out of non-essential notifications</li>
                  <li><strong>Account Deletion</strong>: Request complete account and data deletion</li>
                </ul>

                <h3 className="text-xl font-medium text-emerald-800 mb-2 mt-4">7.2 Data Portability</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Request a copy of your personal data in a portable format</li>
                  <li>Export your forum posts and community contributions</li>
                  <li>Transfer your professional networking connections</li>
                </ul>

                <h3 className="text-xl font-medium text-emerald-800 mb-2 mt-4">7.3 California Privacy Rights (CCPA)</h3>
                <p>California residents have additional rights:</p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li>Right to know what personal information is collected</li>
                  <li>Right to delete personal information</li>
                  <li>Right to opt-out of the sale of personal information (which we don&apos;t engage in)</li>
                  <li>Right to non-discrimination for exercising privacy rights</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">8. Data Retention</h2>
                <h3 className="text-xl font-medium text-emerald-800 mb-2">8.1 Active Accounts</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We retain your information while your account is active</li>
                  <li>Professional directory information is kept to maintain community connections</li>
                  <li>Forum posts and discussions are retained to preserve community knowledge</li>
                </ul>

                <h3 className="text-xl font-medium text-emerald-800 mb-2 mt-4">8.2 Account Deletion</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Upon account deletion, we remove personal identifiers within 30 days</li>
                  <li>Some information may be retained for legal compliance or security purposes</li>
                  <li>Anonymous usage data may be retained for service improvement</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">9. Children&apos;s Privacy</h2>
                <p>Our Service is not intended for children under 18. We do not knowingly collect personal information from minors. If we become aware that we have collected information from a child under 18, we will delete such information promptly.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">10. International Data Transfers</h2>
                <p>Your information may be processed and stored in the United States. By using our Service, you consent to the transfer of your information to countries that may have different privacy laws than your country of residence.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">11. Third-Party Links and Services</h2>
                <h3 className="text-xl font-medium text-emerald-800 mb-2">11.1 External Links</h3>
                <p>Our Service may contain links to third-party websites or services. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.</p>

                <h3 className="text-xl font-medium text-emerald-800 mb-2 mt-4">11.2 Integrations</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>LinkedIn</strong>: If you choose to connect your LinkedIn profile</li>
                  <li><strong>Apple Maps</strong>: For directions to IMAN Center</li>
                  <li><strong>Eventbrite</strong>: For event registration and management</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">12. Changes to This Privacy Policy</h2>
                <p>We may update this Privacy Policy periodically. We will notify you of significant changes via:</p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li>Email notification to registered users</li>
                  <li>In-app notification upon next login</li>
                  <li>Prominent notice on our website</li>
                </ul>
                <p className="mt-3">Your continued use of the Service after changes constitutes acceptance of the updated Privacy Policy.</p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">13. Contact Us</h2>
                <p>If you have questions about this Privacy Policy or our privacy practices, contact us:</p>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-4">
                  <p className="font-semibold text-emerald-900">Ithna-asheri Muslim Association of the Northwest (IMAN)</p>
                  <p>515 State Street<br />Kirkland, WA 98033</p>
                  <p>Email: admin@iman.org<br />Website: https://www.iman-wa.pro/<br />Privacy Inquiries: privacy@iman.org</p>
                  <p className="mt-3 font-medium">For technical support related to the mobile app:</p>
                  <p>App Support: support@iman.org</p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-emerald-900 mb-4">14. Islamic Privacy Principles</h2>
                <p>As a Muslim organization, we are committed to upholding Islamic principles of privacy and trust (Amanah). We strive to:</p>
                <ul className="list-disc pl-6 mt-3 space-y-2">
                  <li>Protect the dignity and privacy of all community members</li>
                  <li>Use information only for legitimate community purposes</li>
                  <li>Maintain transparency in our data practices</li>
                  <li>Honor the trust placed in us by our community</li>
                </ul>
              </section>

              <div className="text-center pt-8 border-t border-emerald-200">
                <p className="text-sm text-gray-600">
                  <em>This Privacy Policy is effective as of September 14, 2025, and was last updated on September 14, 2025.</em>
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