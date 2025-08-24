"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { signOut } from "next-auth/react"

interface MobileNavigationProps {
  session: {
    user?: {
      name?: string | null
      image?: string | null
      role?: string
    }
  } | null
  isProfessional: boolean
}

export default function MobileNavigation({ session, isProfessional }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMenu}
          className="text-emerald-700"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={toggleMenu} />
          <div className="fixed top-0 right-0 w-64 h-full bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold text-emerald-900">Menu</span>
              <Button variant="ghost" size="sm" onClick={toggleMenu}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="p-4 space-y-4">
              {session ? (
                <>
                  {/* Welcome message for mobile */}
                  {isProfessional && (
                    <div className="pb-4 border-b border-gray-200">
                      <p className="text-sm font-medium text-emerald-900">Welcome back!</p>
                      <p className="text-xs text-emerald-700">{session.user?.name}</p>
                    </div>
                  )}
                  
                  <Link 
                    href="/" 
                    className="block text-emerald-700 hover:text-emerald-900 font-medium py-2"
                    onClick={toggleMenu}
                  >
                    Home
                  </Link>
                  {isProfessional && (
                    <>
                      <Link 
                        href="/directory" 
                        className="block text-emerald-700 hover:text-emerald-900 font-medium py-2"
                        onClick={toggleMenu}
                      >
                        Directory
                      </Link>
                      <Link 
                        href="/events" 
                        className="block text-emerald-700 hover:text-emerald-900 font-medium py-2"
                        onClick={toggleMenu}
                      >
                        Events
                      </Link>
                      <Link 
                        href="/forum" 
                        className="block text-emerald-700 hover:text-emerald-900 font-medium py-2"
                        onClick={toggleMenu}
                      >
                        Forum
                      </Link>
                      <Link 
                        href="/mentorship" 
                        className="block text-emerald-700 hover:text-emerald-900 font-medium py-2"
                        onClick={toggleMenu}
                      >
                        Mentorship
                      </Link>
                    </>
                  )}
                  <Link 
                    href="/profile" 
                    className="block text-emerald-700 hover:text-emerald-900 font-medium py-2"
                    onClick={toggleMenu}
                  >
                    Profile
                  </Link>
                  {session.user?.role === 'ADMIN' && (
                    <Link 
                      href="/admin" 
                      className="block text-emerald-700 hover:text-emerald-900 font-medium py-2"
                      onClick={toggleMenu}
                    >
                      Admin
                    </Link>
                  )}
                  <div className="pt-4 border-t border-gray-200">
                    <Button 
                      onClick={() => signOut()}
                      variant="outline" 
                      size="sm" 
                      className="w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                    >
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <a 
                    href="#about" 
                    className="block text-emerald-700 hover:text-emerald-900 font-medium py-2"
                    onClick={toggleMenu}
                  >
                    About
                  </a>
                  <Link 
                    href="/auth/signin" 
                    className="block text-emerald-700 hover:text-emerald-900 font-medium py-2"
                    onClick={toggleMenu}
                  >
                    Professional Sign In
                  </Link>
                  <Link 
                    href="/apply" 
                    onClick={toggleMenu}
                  >
                    <Button 
                      variant="outline" 
                      className="w-full border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                    >
                      Become a Professional
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}