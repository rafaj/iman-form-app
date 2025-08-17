"use client"

// Development auth provider that mocks authentication for testing
export default function DevAuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // In development, just render children without auth
  return <>{children}</>
}