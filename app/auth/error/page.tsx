import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function AuthError({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-red-800">
            {error === "AccessDenied" ? "Access Denied" : "Authentication Error"}
          </CardTitle>
          <CardDescription>
            {error === "AccessDenied" ? "You need an approved membership application to sign in" : "There was a problem signing you in"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error === "AccessDenied" ? (
            <div className="text-center">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
                <p className="text-sm text-red-800 mb-3">
                  Only approved IMAN Professional Network members can sign in to this platform.
                </p>
                <p className="text-sm text-red-600">
                  If you believe this is an error, please contact your sponsor or submit a membership application.
                </p>
              </div>
              
              <div className="space-y-2">
                <Link href="/apply">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Apply for Membership
                  </Button>
                </Link>
                
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Return to Homepage
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                {error === "Configuration" && "There is a problem with the server configuration."}
                {error === "Verification" && "The verification token has expired or has already been used."}
                {!error && "An unknown error occurred."}
              </p>
              <Button asChild>
                <Link href="/auth/signin">
                  Try Again
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}