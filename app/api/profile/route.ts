import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { auth } from '@/auth'

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await request.formData()

  const profileData = {
    name: data.get('name') as string,
    linkedin: data.get('linkedin') as string,
    professionalQualification: data.get('professionalQualification') as string,
    interest: data.get('interest') as string,
    contribution: data.get('contribution') as string,
    isMentor: data.get('isMentor') === 'on',
  }

  try {
    await prisma.member.update({
      where: { userId: session.user.id },
      data: profileData,
    })

    return NextResponse.redirect('/profile/edit?success=true')
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
