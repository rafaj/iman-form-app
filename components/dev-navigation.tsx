"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut, User } from "lucide-react"
import Link from "next/link"

export default function DevNavigation() {
  // Mock user for development
  const mockUser = {
    name: "Test User",
    email: "test@example.com",
    image: null,
    role: "ADMIN"
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
              <Link href="/apply" className="text-gray-600 hover:text-emerald-700 transition-colors">
                Apply
              </Link>
              <Link href="/events" className="text-gray-600 hover:text-emerald-700 transition-colors">
                Events
              </Link>
              <Link href="/admin" className="text-gray-600 hover:text-emerald-700 transition-colors">
                Admin
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:block">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    {mockUser.name}
                  </span>
                  <Badge variant="default" className="text-xs">
                    {mockUser.role}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">
                  {mockUser.email}
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sign Out (Dev)</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}