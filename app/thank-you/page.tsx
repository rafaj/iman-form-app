import { CheckCircle2, Clock, Mail } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ThankYouPage() {
  return (
    <main className="min-h-[100svh] bg-gradient-to-b from-emerald-50 to-white">
      <section className="mx-auto max-w-5xl px-4 py-10">
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
      </section>
    </main>
  )
}
