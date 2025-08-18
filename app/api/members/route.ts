import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const members = await prisma.member.findMany({
      select: {
        name: true,
        linkedin: true,
        professionalQualification: true,
        interest: true,
        contribution: true,
      },
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
