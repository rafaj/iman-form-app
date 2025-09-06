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
              <a 
                href={sponsor.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex-shrink-0">
                    <Image 
                      src={sponsor.logo || '/globe.svg'} 
                      alt={sponsor.name}
                      width={96}
                      height={96}
                      className="h-24 w-24 object-contain rounded-lg border-2 border-emerald-100 shadow-md p-3 bg-white"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xl font-semibold text-emerald-900">{sponsor.name}</h4>
                  </div>
                </div>
                {sponsor.description && (
                  <p className="text-sm text-emerald-600 line-clamp-3 mb-4">{sponsor.description}</p>
                )}
              </a>
              
              {/* Heart Button */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-emerald-100">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleHeartToggle(sponsor.id, sponsor.isHearted)
                  }}
                  disabled={heartingSponsors.has(sponsor.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    sponsor.isHearted 
                      ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                  } ${heartingSponsors.has(sponsor.id) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}`}
                >
                  <Heart 
                    className={`w-4 h-4 transition-all duration-200 ${
                      sponsor.isHearted ? 'fill-current' : ''
                    } ${heartingSponsors.has(sponsor.id) ? 'animate-pulse' : ''}`} 
                  />
                  <span>{sponsor.heartCount}</span>
                  <span className="hidden sm:inline">
                    {sponsor.isHearted ? 'Hearted' : 'Heart'}
                  </span>
                </button>
                
                <div className="text-xs text-gray-500">
                  {sponsor.heartCount} {sponsor.heartCount === 1 ? 'heart' : 'hearts'}
                </div>
              </div>
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