// Script to send welcome emails to specific members by name/email
// This bypasses database queries and sends directly

const membersToEmail = [
  { name: "Abe Sharma", email: "abe.sharma@email.com", type: "activation" },
  { name: "Ali Mansoor Naqvi", email: "ali.naqvi@email.com", type: "activation" },
  { name: "Al Jalaly", email: "al.jalaly@email.com", type: "activation" }
  // Add more members as needed
]

async function sendWelcomeEmails() {
  console.log('📧 Sending Welcome Emails to Specific Members')
  console.log('==============================================')
  
  for (const member of membersToEmail) {
    try {
      console.log(`\n📨 Sending welcome email to ${member.name} (${member.email})...`)
      
      const response = await fetch('http://localhost:3000/api/send-welcome-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicantName: member.name,
          applicantEmail: member.email,
          type: member.type
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log(`✅ ${member.name}: Welcome email sent successfully`)
      } else {
        const error = await response.text()
        console.log(`❌ ${member.name}: Failed to send welcome email - ${error}`)
      }
    } catch (error) {
      console.log(`❌ ${member.name}: Error sending welcome email - ${error.message}`)
    }
  }
  
  console.log('\n✨ Welcome email sending completed!')
}

// Run if called directly
if (require.main === module) {
  sendWelcomeEmails()
}

module.exports = { sendWelcomeEmails, membersToEmail }