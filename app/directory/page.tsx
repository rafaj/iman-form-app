import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/database"

async function getMembers() {
  const members = await prisma.member.findMany({
    select: {
      name: true,
      professionalQualification: true,
      interest: true,
      contribution: true,
    },
  })
  return members
}

export default async function DirectoryPage() {
  const members = await getMembers()

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Member Directory</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {members.map((member, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{member.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">{member.professionalQualification}</p>
              <div>
                <h4 className="font-semibold">Interest in joining:</h4>
                <p className="text-sm">{member.interest}</p>
              </div>
              <div className="mt-4">
                <h4 className="font-semibold">How they want to contribute:</h4>
                <p className="text-sm">{member.contribution}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
