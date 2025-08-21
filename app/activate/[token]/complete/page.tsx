import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/database"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CompleteActivationProps {
  params: Promise<{
    token: string
  }>
}

export default async function CompleteActivation({ params }: CompleteActivationProps) {
  const { token } = await params
  const session = await auth()
  
  if (!session?.user?.email) {
    redirect(`/activate/${token}`)
  }

  // Find the application
  const application = await prisma.application.findUnique({
    where: {
      activationToken: token,
      status: "APPROVED"
    }
  })

  if (!application) {
    notFound()
  }

  // Verify email matches
  if (application.applicantEmail !== session.user.email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-red-800">
              Email Mismatch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 text-center">
              The email address you signed in with ({session.user.email}) doesn&apos;t match 
              the email on this application ({application.applicantEmail}).
            </p>
            <p className="text-sm text-gray-600 text-center mt-4">
              Please sign in with the correct email address.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if already activated
  if (application.activatedAt) {
    redirect("/")
  }

  try {
    // Create or find the member record with professional information
    const member = await prisma.member.upsert({
      where: { email: application.applicantEmail },
      update: {
        name: application.applicantName,
        userId: session.user.id,
        // Copy professional information from application
        professionalQualification: application.professionalQualification,
        interest: application.interest,
        contribution: application.contribution,
        employer: application.employer,
        linkedin: application.linkedin,
        // Copy mentorship information from application
        availableAsMentor: application.availableAsMentor,
        mentorProfile: application.mentorProfile,
        seekingMentor: application.seekingMentor,
        menteeProfile: application.menteeProfile
      },
      create: {
        name: application.applicantName,
        email: application.applicantEmail,
        userId: session.user.id,
        // Copy professional information from application
        professionalQualification: application.professionalQualification,
        interest: application.interest,
        contribution: application.contribution,
        employer: application.employer,
        linkedin: application.linkedin,
        // Copy mentorship information from application
        availableAsMentor: application.availableAsMentor,
        mentorProfile: application.mentorProfile,
        seekingMentor: application.seekingMentor,
        menteeProfile: application.menteeProfile
      }
    })

    // Update the user role to MEMBER
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "MEMBER" }
    })

    // Mark application as activated
    await prisma.application.update({
      where: { id: application.id },
      data: { activatedAt: new Date() }
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        applicationId: application.id,
        event: "ACCOUNT_ACTIVATED",
        performedBy: session.user.email,
        metadata: {
          userId: session.user.id,
          memberId: member.id
        }
      }
    })

  } catch (error) {
    console.error("Account activation error:", error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold text-red-800">
              Activation Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 text-center">
              There was an error activating your account. Please try again or contact support.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success - redirect to homepage
  redirect("/")
}