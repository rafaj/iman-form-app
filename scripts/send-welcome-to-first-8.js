// Send welcome emails to the first 8 members from the production list

const membersToEmail = [
  { name: "Ali Mansoor Naqvi", email: "alimansoornaqvi@gmail.com", type: "activation" },
  { name: "Abe Sharma", email: "asharma.tx@gmail.com", type: "activation" },
  { name: "Najaf Zaidi", email: "najaf.zaidi@gmail.com", type: "approval" }, // Has account already
  { name: "Aamer Abbas", email: "aamer@aamerabbas.com", type: "activation" },
  { name: "Mehboob Ali Khaki", email: "khakiali@hotmail.com", type: "activation" },
  { name: "Abulfazl Jalaly", email: "jalaly950@gmail.com", type: "approval" }, // Has account already  
  { name: "Adel shubber", email: "adelshubber@yahoo.com", type: "activation" },
  { name: "Mustafa Hassoun", email: "mustafa.a.hassoun@gmail.com", type: "activation" }
]

async function sendWelcomeEmailsToFirst8() {
  console.log('📧 Sending Welcome Emails to First 8 Production Members')
  console.log('====================================================')
  console.log('Target: http://localhost:3000/api/send-welcome-email')
  console.log('')
  
  let successCount = 0
  let failureCount = 0
  
  for (let i = 0; i < membersToEmail.length; i++) {
    const member = membersToEmail[i]
    const emailType = member.type === 'activation' ? 'Welcome (Sign-in)' : 'Approval Notification'
    
    try {
      console.log(`\n${i + 1}/8 📨 ${member.name} (${member.email})`)
      console.log(`      Type: ${emailType}`)
      console.log(`      Sending...`)
      
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
        console.log(`      ✅ SUCCESS: ${result.message}`)
        successCount++
      } else {
        const error = await response.text()
        console.log(`      ❌ FAILED: ${error}`)
        failureCount++
      }
      
      // Small delay between emails to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.log(`      ❌ ERROR: ${error.message}`)
      failureCount++
    }
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('📊 SUMMARY:')
  console.log(`✅ Successful: ${successCount}`)
  console.log(`❌ Failed: ${failureCount}`)
  console.log(`📧 Total: ${membersToEmail.length}`)
  
  if (successCount === membersToEmail.length) {
    console.log('\n🎉 All welcome emails sent successfully!')
  } else if (successCount > 0) {
    console.log('\n⚠️  Some emails sent, but there were failures.')
  } else {
    console.log('\n💥 No emails were sent successfully.')
  }
}

// Run if called directly
if (require.main === module) {
  sendWelcomeEmailsToFirst8()
}

module.exports = { sendWelcomeEmailsToFirst8, membersToEmail }