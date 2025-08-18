"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, Settings } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default function ProfilePage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <main className="min-h-[100svh] bg-gradient-to-b from-emerald-50 to-white">
        <section className="mx-auto max-w-3xl px-4 py-10">
          <div className="text-center">Loading profile...</div>
        </section>
      </main>
    )
  }

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <main className="min-h-[100svh] bg-gradient-to-b from-emerald-50 to-white">
      <section className="mx-auto max-w-3xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-emerald-900">
            Profile
          </h1>
          <p className="mt-2 text-muted-foreground">
            View and manage your IMAN Professional Network profile
          </p>
        </header>

        <Card className="border-emerald-100">
          <CardHeader className="pb-6">
            <div className="flex items-center space-x-4">
              {session.user?.image && (
                <img 
                  src={session.user.image} 
                  alt={session.user.name || "User"} 
                  className="w-16 h-16 rounded-full border-2 border-emerald-200"
                />
              )}
              <div>
                <CardTitle className="text-2xl text-emerald-900">
                  {session.user?.name}
                </CardTitle>
                <CardDescription className="text-emerald-700">
                  IMAN Professional Network Member
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-emerald-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    Email
                  </div>
                  <p className="font-medium">{session.user?.email}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Settings className="w-4 h-4" />
                    Account Type
                  </div>
                  <Badge variant="secondary">
                    Member
                  </Badge>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-emerald-900 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Account Information
              </h3>
              
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <p className="text-sm text-emerald-800">
                  Your profile information is managed through your OAuth provider. 
                  To update your name or profile picture, please update it in your Google/GitHub/Apple account.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-emerald-200">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="outline">
                    Back to Home
                  </Button>
                </Link>
                
                <div className="text-sm text-muted-foreground">
                  Need to update your membership details? Contact an administrator.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}