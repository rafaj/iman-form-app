import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { prisma } from "@/lib/database"
import { auth } from "@/auth"

async function getMemberProfile(userId: string) {
  const member = await prisma.member.findUnique({
    where: { userId },
    select: {
      name: true,
      professionalQualification: true,
      interest: true,
      contribution: true,
      isMentor: true,
    },
  })
  return member
}

export default async function EditProfilePage() {
  const session = await auth()

  if (!session?.user?.id) {
    return <div>Not authenticated</div>
  }

  const member = await getMemberProfile(session.user.id)

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/api/profile" method="POST">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={member?.name || ''} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="professionalQualification">Professional Qualification</Label>
                <Textarea id="professionalQualification" name="professionalQualification" defaultValue={member?.professionalQualification || ''} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="interest">Interest in joining</Label>
                <Textarea id="interest" name="interest" defaultValue={member?.interest || ''} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="contribution">How they want to contribute</Label>
                <Textarea id="contribution" name="contribution" defaultValue={member?.contribution || ''} />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="isMentor" name="isMentor" defaultChecked={member?.isMentor} />
                <label
                  htmlFor="isMentor"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I want to be a mentor
                </label>
              </div>
            </div>
            <div className="mt-8">
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
