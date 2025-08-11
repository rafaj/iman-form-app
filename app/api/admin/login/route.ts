import { NextRequest, NextResponse } from "next/server"
import { validateAdminCredentials, createAdminSession } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username and password are required" },
        { status: 400 }
      )
    }

    // Validate credentials
    if (!validateAdminCredentials(username, password)) {
      // Add a small delay to prevent brute force attacks
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return NextResponse.json(
        { success: false, message: "Invalid username or password" },
        { status: 401 }
      )
    }

    // Create session
    const session = createAdminSession(username)
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        username: session.username,
        loginTime: session.loginTime
      }
    })

    // Set session cookie
    response.cookies.set('iman-admin-session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    })

    console.log(`Admin login successful: ${username} at ${new Date().toISOString()}`)

    return response

  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
