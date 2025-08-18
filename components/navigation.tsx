"use client"

import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function Navigation() {
  const { data: session, status } = useSession()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (session?.user?.email) {
      // Check if user is admin
      fetch('/api/auth/check-admin')
        .then(res => res.json())
        .then(data => setIsAdmin(data.isAdmin))
        .catch(() => setIsAdmin(false))
    }
  }, [session])

  if (status === "loading") {
    return (
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-emerald-800">
              IMAN Professional Network
            </Link>
            <div className="h-9 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </nav>
    )
  }

  if (!session) {
    return null
  }

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-xl font-bold text-emerald-800">
              IMAN Professional Network
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link href="/" className="text-gray-600 hover:text-emerald-700 transition-colors">
                Home
              </Link>
              {!session && (
                <Link href="/apply" className="text-gray-600 hover:text-emerald-700 transition-colors">
                  Apply
                </Link>
              )}
              <Link href="/directory" className="text-gray-600 hover:text-emerald-700 transition-colors">
                Directory
              </Link>
              {isAdmin && (
                <Link href="/admin" className="text-gray-600 hover:text-emerald-700 transition-colors">
                  Admin
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {session.user?.image && (
                <img 
                  src={session.user.image} 
                  alt={session.user.name || "User"} 
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div className="hidden md:block">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    {session.user?.name}
                  </span>
                  <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs">
                    {isAdmin ? "Admin" : "Member"}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">
                  {session.user?.email}
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              className="flex items-center space-x-1"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}