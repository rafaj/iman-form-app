"use client"

import { useState, useEffect } from "react"
import { Heart, Building2 } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

type Sponsor = {
  id: string
  name: string
  description: string
  website: string
  logo: string
  heartCount: number
  isHearted: boolean
  heartedByNames: string[]
}

export default function CommunitySpotlight() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [heartingSponsors, setHeartingSponsors] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  useEffect(() => {
    fetchSponsors()
  }, [])

  const fetchSponsors = async () => {
    try {
      const response = await fetch('/api/sponsors')
      const data = await response.json()
      
      if (data.success) {
        setSponsors(data.sponsors)
      }
    } catch (error) {
      console.error('Error fetching sponsors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleHeartToggle = async (sponsorId: string, currentlyHearted: boolean) => {
    if (heartingSponsors.has(sponsorId)) return

    setHeartingSponsors(prev => new Set([...prev, sponsorId]))

    try {
      const method = currentlyHearted ? 'DELETE' : 'POST'
      const response = await fetch(`/api/sponsors/${sponsorId}/heart`, { method })
      const data = await response.json()

      if (data.success) {
        // Update the local state immediately for better UX
        setSponsors(prev => prev.map(sponsor => 
          sponsor.id === sponsorId 
            ? { 
                ...sponsor, 
                isHearted: !currentlyHearted,
                heartCount: data.heartCount 
              }
            : sponsor
        ))

        toast({
          title: currentlyHearted ? "Heart removed" : "Hearted! ❤️",
          description: currentlyHearted 
            ? "You removed your heart from this sponsor" 
            : "Thank you for showing appreciation!",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update heart",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error toggling heart:', error)
      toast({
        title: "Error",
        description: "Failed to update heart. Please try again.",
        variant: "destructive"
      })
    } finally {
      setHeartingSponsors(prev => {
        const next = new Set(prev)
        next.delete(sponsorId)
        return next
      })
    }
  }

  if (loading) {
    return (
      <section className="py-8 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-emerald-800 mb-2">Community Spotlight</h3>
            <p className="text-emerald-700">
              Grateful to have these amazing individuals as part of our community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 border border-emerald-200 animate-pulse">
                <div className="flex items-center gap-6 mb-4">
                  <div className="h-24 w-24 bg-gray-300 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 bg-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-emerald-800 mb-2">Community Spotlight</h3>
          <p className="text-emerald-700">
            Grateful to have these amazing individuals as part of our community.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sponsors.map((sponsor) => (
            <div key={sponsor.id} className="bg-white rounded-lg p-6 border border-emerald-200 hover:shadow-lg transition-all duration-300 hover:border-emerald-300">
              {/* Main layout: Left picture, Right content */}
              <div className="flex items-start gap-6 mb-4">
                {/* Left: Large Picture */}
                <a 
                  href={sponsor.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                >
                  <Image 
                    src={sponsor.logo || '/globe.svg'} 
                    alt={sponsor.name}
                    width={160}
                    height={160}
                    className="h-40 w-40 object-contain rounded-lg border-2 border-emerald-100 shadow-md p-4 bg-white hover:shadow-lg transition-shadow"
                  />
                </a>

                {/* Right: Name and Hearts */}
                <div className="flex flex-col justify-center min-w-0 flex-1">
                  <a 
                    href={sponsor.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block mb-3"
                  >
                    <h4 className="text-xl font-semibold text-emerald-900 hover:text-emerald-700 transition-colors">{sponsor.name}</h4>
                  </a>
                  
                  {/* Hearts below name */}
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleHeartToggle(sponsor.id, sponsor.isHearted)
                    }}
                    disabled={heartingSponsors.has(sponsor.id)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 w-fit ${
                      sponsor.isHearted 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100' 
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
                    } ${heartingSponsors.has(sponsor.id) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}`}
                    title={sponsor.heartedByNames.length > 0 
                      ? `Hearted by: ${sponsor.heartedByNames.join(', ')}${sponsor.heartCount > sponsor.heartedByNames.length ? ` and ${sponsor.heartCount - sponsor.heartedByNames.length} more` : ''}`
                      : `${sponsor.heartCount} ${sponsor.heartCount === 1 ? 'heart' : 'hearts'}`
                    }
                  >
                    <Heart 
                      className={`w-4 h-4 transition-all duration-200 ${
                        sponsor.isHearted ? 'fill-current' : ''
                      } ${heartingSponsors.has(sponsor.id) ? 'animate-pulse' : ''}`} 
                    />
                    <span>{sponsor.heartCount}</span>
                  </button>
                </div>
              </div>

              {/* Bottom Row: Description */}
              {sponsor.description && (
                <div className="pt-4 border-t border-emerald-100">
                  <p className="text-sm text-emerald-600 line-clamp-3">{sponsor.description}</p>
                </div>
              )}
            </div>
          ))}
          {sponsors.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Building2 className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
              <p className="text-emerald-600">No community professionals in spotlight yet.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}