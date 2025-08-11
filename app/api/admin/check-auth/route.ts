import { NextRequest, NextResponse } from "next/server"
import { validateAdminRequest } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  try {
    const session = validateAdminRequest(request)
    
    if (session) {
      return NextResponse.json({
        authenticated: true,
        user: {
          username: session.username,
          loginTime: session.loginTime
        }
      })
    } else {
      return NextResponse.json({
        authenticated: false
      })
    }
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({
      authenticated: false
    })
  }
}
