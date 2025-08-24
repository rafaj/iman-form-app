"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chrome, Mail } from "lucide-react"
import { useState } from "react"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      const result = await signIn("resend", { 
        email, 
        redirect: false,
        callbackUrl: "/"
      })
      
      if (result?.ok) {
        setEmailSent(true)
      }
    } catch (error) {
      console.error("Error sending magic link:", error)
    }
    setIsLoading(false)
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-emerald-800">
              Check Your Email
            </CardTitle>
            <CardDescription>
              We&apos;ve sent a secure sign-in link to {email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="p-4 bg-emerald-50 rounded-lg">
              <Mail className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm text-emerald-700">
                Click the link in your email to complete sign-in. You can close this page.
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setEmailSent(false)
                setEmail("")
              }}
            >
              Use Different Email
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-emerald-800">
            Welcome to IMAN
          </CardTitle>
          <CardDescription>
            Sign in to access the IMAN Professional Network
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Magic Link Form */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Sign in with email</h3>
            <form onSubmit={handleMagicLink} className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !email}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Mail className="w-4 h-4 mr-2" />
                {isLoading ? "Sending..." : "Send Sign-In Link"}
              </Button>
            </form>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <Button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            variant="outline"
            className="w-full"
          >
            <Chrome className="w-4 h-4 mr-2" />
            Google
          </Button>
          
          <p className="text-xs text-gray-600 text-center">
            Only approved professionals can access the network. 
            <br />
            <a href="/apply" className="text-emerald-600 hover:underline">
              Apply for membership
            </a> if you haven&apos;t already.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}