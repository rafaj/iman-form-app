"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Linkedin, Building2 } from "lucide-react"

type Member = {
  id: string
  displayName: string
  image: string | null
  employer: string | null
  professionalQualification: string | null
  interest: string | null
  contribution: string | null
  linkedin: string | null
  createdAt: string
  initials: string
}

interface WelcomeProfessionalsProps {
  newMembers: Member[]
}

export default function WelcomeProfessionals({ newMembers }: WelcomeProfessionalsProps) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)

  if (newMembers.length === 0) return null

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-emerald-800 mb-2">Welcome New Professionals at IMAN</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {newMembers.slice(0, 6).map((member) => (
            <div 
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className="bg-emerald-50 rounded-lg p-3 border border-emerald-200 hover:shadow-md hover:bg-emerald-100 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {member.image ? (
                      <Image
                        src={member.image}
                        alt={member.displayName}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full border-2 border-emerald-300"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-sm">
                        {member.initials}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold text-emerald-900 truncate">
                      {member.displayName}
                    </h4>
                    {member.employer && (
                      <p className="text-xs text-emerald-700 truncate">
                        {member.employer}
                      </p>
                    )}
                    <p className="text-xs text-emerald-600">
                      Joined {new Date(member.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="ml-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    NEW
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {newMembers.length > 6 && (
          <div className="text-center">
            <Link href="/directory?view=recent" className="text-sm text-emerald-600 hover:text-emerald-800 hover:underline">
              + {newMembers.length - 6} more professionals joined this month
            </Link>
          </div>
        )}
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-emerald-900">
                Professional Profile
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center space-x-4 pb-4 border-b border-emerald-200">
                {selectedMember.image ? (
                  <Image
                    src={selectedMember.image}
                    alt={selectedMember.displayName}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full border-2 border-emerald-200"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-xl">
                    {selectedMember.initials}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-semibold text-emerald-900">
                    {selectedMember.displayName}
                  </h2>
                  {selectedMember.employer && (
                    <p className="text-emerald-700 font-medium flex items-center mt-1">
                      <Building2 className="w-4 h-4 mr-1" />
                      {selectedMember.employer}
                    </p>
                  )}
                  <p className="text-emerald-600 text-sm flex items-center mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    Joined {new Date(selectedMember.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                {selectedMember.professionalQualification && (
                  <div>
                    <h4 className="font-medium text-emerald-900 mb-2">Professional Qualification</h4>
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedMember.professionalQualification}
                      </p>
                    </div>
                  </div>
                )}

                {selectedMember.interest && (
                  <div>
                    <h4 className="font-medium text-emerald-900 mb-2">Professional Interests</h4>
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedMember.interest}
                      </p>
                    </div>
                  </div>
                )}

                {selectedMember.contribution && (
                  <div>
                    <h4 className="font-medium text-emerald-900 mb-2">How I can help IMAN</h4>
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedMember.contribution}
                      </p>
                    </div>
                  </div>
                )}

                {selectedMember.linkedin && (
                  <div>
                    <h4 className="font-medium text-emerald-900 mb-2">Professional Network</h4>
                    <a
                      href={selectedMember.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:underline"
                    >
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn Profile
                    </a>
                  </div>
                )}

                {!selectedMember.professionalQualification && !selectedMember.interest && !selectedMember.contribution && !selectedMember.linkedin && (
                  <div className="text-center py-6">
                    <p className="text-gray-500">Professional information not yet provided.</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  )
}