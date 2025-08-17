import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"

export async function GET() {
  try {
    const user = await requireAdmin()
    
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({
      authenticated: false
    }, { status: 401 })
  }
}
