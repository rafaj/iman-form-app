// WhatsApp group management utilities

export const WHATSAPP_GROUPS = {
  MAIN: {
    name: "IMAN Professional Network",
    inviteLink: "https://chat.whatsapp.com/YOUR_GROUP_INVITE_CODE_HERE",
    description: "Main community group for all IMAN members"
  },
  TECH: {
    name: "IMAN Tech Professionals",
    inviteLink: "https://chat.whatsapp.com/YOUR_TECH_GROUP_INVITE_CODE_HERE", 
    description: "For software engineers, developers, and tech professionals"
  },
  BUSINESS: {
    name: "IMAN Business Network",
    inviteLink: "https://chat.whatsapp.com/YOUR_BUSINESS_GROUP_INVITE_CODE_HERE",
    description: "For entrepreneurs, business owners, and executives"
  }
}

export function getRelevantGroups(professionalQualification: string, interest: string): typeof WHATSAPP_GROUPS[keyof typeof WHATSAPP_GROUPS][] {
  const groups = [WHATSAPP_GROUPS.MAIN] // Everyone gets added to main group
  
  // Add to tech group if they're in tech
  const techKeywords = ['engineer', 'developer', 'software', 'tech', 'programming', 'coding', 'data', 'ai', 'ml']
  const isTech = techKeywords.some(keyword => 
    professionalQualification.toLowerCase().includes(keyword) || 
    interest.toLowerCase().includes(keyword)
  )
  
  if (isTech) {
    groups.push(WHATSAPP_GROUPS.TECH)
  }
  
  // Add to business group if they're in business/leadership
  const businessKeywords = ['manager', 'director', 'ceo', 'founder', 'entrepreneur', 'business', 'executive', 'consultant']
  const isBusiness = businessKeywords.some(keyword => 
    professionalQualification.toLowerCase().includes(keyword) || 
    interest.toLowerCase().includes(keyword)
  )
  
  if (isBusiness) {
    groups.push(WHATSAPP_GROUPS.BUSINESS)
  }
  
  return groups
}

export function generateWhatsAppInviteMessage(memberName: string, groups: typeof WHATSAPP_GROUPS[keyof typeof WHATSAPP_GROUPS][]): string {
  const groupLinks = groups.map(group => 
    `• **${group.name}**: ${group.description}\n  ${group.inviteLink}`
  ).join('\n\n')
  
  return `
🎉 Welcome to IMAN Professional Network, ${memberName}!

You've been approved and are now part of our community. Please join our WhatsApp groups to connect with fellow members:

${groupLinks}

**Important Notes:**
• Please introduce yourself when you join
• Keep discussions professional and respectful
• Share opportunities and insights with the community
• Follow group guidelines posted in each group

Looking forward to having you in our community! 🤝
  `.trim()
}

// For future: WhatsApp Business API integration
export async function addToWhatsAppGroupViaAPI(phoneNumber: string, groupId: string) {
  // This would require WhatsApp Business API setup
  // For now, we'll use invite links which are more reliable
  console.log(`Would add ${phoneNumber} to WhatsApp group ${groupId} via API`)
  
  // Future implementation:
  // - Set up WhatsApp Business API
  // - Get group admin permissions
  // - Use API to add members directly
  
  return { success: false, message: "API integration not implemented yet" }
}
