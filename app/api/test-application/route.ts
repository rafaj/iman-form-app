import { NextResponse } from "next/server"
import { findMemberByEmail, createApplication } from "@/lib/database"

export async function POST(req: Request) {
  try {
    console.log("Testing application creation...")
    
    // Test 1: Parse request
    const body = await req.json()
    console.log("✅ Request parsed:", Object.keys(body))
    
    // Test 2: Find sponsor
    const sponsor = await findMemberByEmail(body.sponsorEmail)
    console.log("✅ Sponsor lookup result:", sponsor ? `Found: ${sponsor.name}` : "Not found")
    
    if (!sponsor || !sponsor.active) {
      return NextResponse.json({ 
        success: false,
        error: "Sponsor not found or inactive",
        sponsorEmail: body.sponsorEmail,
        sponsorFound: !!sponsor,
        sponsorActive: sponsor?.active || false
      }, { status: 400 })
    }
    
    // Test 3: Create application (simplified)
    const testApp = {
      applicantName: body.applicantName || "Test User",
      applicantEmail: body.applicantEmail || "test@example.com",
      sponsorEmail: body.sponsorEmail,
      sponsorMemberId: sponsor.id,
      streetAddress: body.streetAddress,
      city: body.city,
      state: body.state,
      zip: body.zip,
      professionalQualification: body.professionalQualification,
      interest: body.interest,
      contribution: body.contribution,
      employer: body.employer,
      linkedin: body.linkedin,
    }
    
    console.log("✅ About to create application with data:", Object.keys(testApp))
    
    const app = await createApplication(testApp)
    console.log("✅ Application created successfully:", app.id)
    
    return NextResponse.json({
      success: true,
      applicationId: app.id,
      token: app.token,
      message: "Test application created successfully"
    })
    
  } catch (error) {
    console.error("❌ Test application creation failed:", error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      message: "Test failed"
    }, { status: 500 })
  }
}
