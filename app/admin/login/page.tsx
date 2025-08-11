"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "Login Successful",
          description: "Welcome to the admin dashboard.",
        })
        router.push('/admin')
        router.refresh()
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (_err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[100svh] bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <Card className="border-emerald-100 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-emerald-100 rounded-full">
                <Shield className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>
              Access the IMAN Professional Network admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  required
                  disabled={loading}
                  className="focus-visible:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                    disabled={loading}
                    className="focus-visible:ring-emerald-500 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Authorized administrators only
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
