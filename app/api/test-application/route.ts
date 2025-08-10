import { NextResponse } from "next/server"
import { findMemberByEmail, createApplication } from "@/lib/database"

export async function GET() {
  // Test with hardcoded data for easier testing
  const testData = {
    applicantName: "Test User",
    applicantEmail: "test@example.com",
    sponsorEmail: "john.doe@example.com", // We'll need to use a real sponsor email
    streetAddress: "123 Main St",
    city: "Test City",
    state: "CA", 
    zip: "12345",
    professionalQualification: "Software Engineer",
    interest: "I am interested in joining this organization",
    contribution: "I can contribute my technical skills"
  }
  
  return await testApplicationCreation(testData)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    return await testApplicationCreation(body)
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Failed to parse request body",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 400 })
  }
}

async function testApplicationCreation(body: any) {
  try {
    console.log("Testing application creation...")
    
    // Test 1: Parse request
    console.log("✅ Request data:", Object.keys(body))
    
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
