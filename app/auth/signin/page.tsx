import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chrome } from "lucide-react"

export default function SignIn() {
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
        <CardContent className="space-y-4">
          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: "/" })
            }}
          >
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Chrome className="w-4 h-4 mr-2" />
              Continue with Google
            </Button>
          </form>
          
          <p className="text-sm text-gray-600 text-center">
            Sign in with your Google account to access your account.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}