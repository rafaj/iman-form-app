import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Adding fake member and application data...')

  // First, check if we have any existing members to use as sponsors
  const existingMembers = await prisma.member.findMany()
  console.log('Existing members:', existingMembers.length)

  let sponsorId = null
  if (existingMembers.length > 0) {
    sponsorId = existingMembers[0].id
    console.log('Using existing member as sponsor:', sponsorId)
  } else {
    // Create a sponsor member first
    const sponsor = await prisma.member.create({
      data: {
        name: 'Jafar Sponsor',
        email: 'jafar@jafar.com',
        active: true
      }
    })
    sponsorId = sponsor.id
    console.log('Created sponsor member:', sponsorId)
  }

  // Now create fake members and their applications
  const fakeMember = await prisma.member.upsert({
    where: { email: 'sarah.johnson@example.com' },
    update: {},
    create: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      active: true,
      approvalsInWindow: 3,
      lastApprovalAt: new Date('2024-12-15T10:30:00Z'),
      createdAt: new Date('2024-11-01T09:00:00Z')
    }
  })

  // Create their approved application with all details
  const fakeApplication = await prisma.application.upsert({
    where: { token: 'fake-approved-token-123' },
    update: {},
    create: {
      token: 'fake-approved-token-123',
      applicantName: 'Sarah Johnson',
      applicantEmail: 'sarah.johnson@example.com',
      sponsorEmail: 'jafar@jafar.com',
      sponsorMemberId: sponsorId,
      streetAddress: '1234 Innovation Drive',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      professionalQualification: 'Senior Software Engineer with 8+ years experience in full-stack development, specializing in React, Node.js, and cloud architecture. MS in Computer Science from Stanford University.',
      interest: 'I am deeply interested in joining IMAN to connect with like-minded Muslim professionals who are making a positive impact in the tech industry. I believe in the power of community and mentorship, and I would love to contribute to initiatives that support Muslim entrepreneurs and technologists. Having worked at several startups, I understand the challenges of building inclusive teams and would like to share my experiences while learning from others in the network.',
      contribution: 'I can contribute to IMAN in several ways: 1) Technical mentorship for early-career Muslim engineers, 2) Organizing coding workshops and tech talks for the community, 3) Connecting startups with talented Muslim developers from my network, 4) Sharing insights on building inclusive engineering cultures, and 5) Contributing to open-source projects that benefit the Muslim tech community. I am also passionate about supporting Muslim women in tech and would love to help with initiatives focused on increasing representation.',
      employer: 'TechCorp Solutions',
      linkedin: 'https://linkedin.com/in/sarah-johnson-dev',
      status: 'APPROVED',
      createdAt: new Date('2024-11-01T08:00:00Z'),
      expiresAt: new Date('2024-11-08T08:00:00Z'),
      approvedAt: new Date('2024-11-02T14:30:00Z'),
      verificationCode: 'DEMO123'
    }
  })

  // Add another fake member
  const fakeMember2 = await prisma.member.upsert({
    where: { email: 'ahmed.hassan@example.com' },
    update: {},
    create: {
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@example.com',
      active: true,
      approvalsInWindow: 1,
      lastApprovalAt: new Date('2024-12-20T16:45:00Z'),
      createdAt: new Date('2024-10-15T11:20:00Z')
    }
  })

  const fakeApplication2 = await prisma.application.upsert({
    where: { token: 'fake-approved-token-456' },
    update: {},
    create: {
      token: 'fake-approved-token-456',
      applicantName: 'Ahmed Hassan',
      applicantEmail: 'ahmed.hassan@example.com',
      sponsorEmail: 'jafar@jafar.com',
      sponsorMemberId: sponsorId,
      streetAddress: '567 Business Boulevard, Suite 200',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      professionalQualification: 'Product Manager with 6 years experience leading cross-functional teams in fintech and healthcare. MBA from Wharton, BS in Engineering from UT Austin. Expertise in product strategy, user research, and agile development.',
      interest: 'As a product manager who has worked on products serving diverse communities, I am excited about joining IMAN to help build products and services that better serve the Muslim community. I believe technology should be inclusive and accessible, and I want to work with other Muslim professionals to create solutions that address our unique needs and challenges.',
      contribution: 'I can contribute through: 1) Product strategy consulting for Muslim-owned startups, 2) Conducting user research to better understand Muslim consumer needs, 3) Mentoring aspiring product managers in the community, 4) Organizing product management workshops and networking events, and 5) Advocating for inclusive product design practices in my current role and beyond.',
      employer: 'FinanceFlow Inc',
      linkedin: 'https://linkedin.com/in/ahmed-hassan-pm',
      status: 'APPROVED',
      createdAt: new Date('2024-10-15T10:00:00Z'),
      expiresAt: new Date('2024-10-22T10:00:00Z'),
      approvedAt: new Date('2024-10-16T09:15:00Z'),
      verificationCode: 'DEMO456'
    }
  })

  console.log('✅ Fake data created successfully!')
  console.log('Members created:', fakeMember.name, fakeMember2.name)
  console.log('Applications created:', fakeApplication.token, fakeApplication2.token)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
