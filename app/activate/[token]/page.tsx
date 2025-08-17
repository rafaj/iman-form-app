import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/database"
import { signIn } from "@/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Chrome } from "lucide-react"

interface ActivatePageProps {
  params: {
    token: string
  }
}

export default async function ActivatePage({ params }: ActivatePageProps) {
  // Find the application with this activation token
  const application = await prisma.application.findUnique({
    where: {
      activationToken: params.token,
      status: "APPROVED"
    }
  })

  if (!application) {
    notFound()
  }

  // Check if already activated
  if (application.activatedAt) {
    redirect("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-emerald-800">
            Welcome to IMAN!
          </CardTitle>
          <CardDescription>
            Your application has been approved. Create your account to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
            <p className="text-sm text-emerald-800">
              <strong>Approved Application:</strong> {application.applicantName}
            </p>
            <p className="text-sm text-emerald-600">
              Email: {application.applicantEmail}
            </p>
          </div>

          <p className="text-sm text-gray-600 text-center">
            Sign in with your Google account to activate your account:
          </p>

          <form
            action={async () => {
              "use server"
              await signIn("google", { 
                redirectTo: `/activate/${params.token}/complete` 
              })
            }}
          >
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Chrome className="w-4 h-4 mr-2" />
              Continue with Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}