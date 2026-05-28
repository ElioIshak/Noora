'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header, Footer } from '@/components/layout/header-footer'
import { PageTransition } from '@/components/animated-section'
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import { authAPI, setAuthToken } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      const result = await authAPI.login(formData.email, formData.password)
      setAuthToken(result.token)
      router.push('/chat')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Invalid email or password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-hero relative noise-overlay flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center px-4 py-32">
        <PageTransition className="w-full max-w-md">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/5">
            <CardHeader className="text-center pb-4">
              <Link href="/" className="inline-flex justify-center mb-5">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                  <span className="text-primary-foreground font-serif text-2xl font-semibold">N</span>
                </div>
              </Link>
              <CardTitle className="font-serif text-2xl md:text-3xl">Welcome back</CardTitle>
              <CardDescription className="text-base">
                Sign in to continue your conversations with Noora
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm text-center border border-destructive/20">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    autoComplete="email"
                    className="h-12 rounded-xl bg-background/60 border-border/60 focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <Link href="/auth/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      autoComplete="current-password"
                      className="h-12 rounded-xl bg-background/60 border-border/60 focus:border-primary pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl text-base group shadow-lg shadow-primary/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>
              
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Link href="/auth/signup" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                    Create one
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
          
          <p className="text-center text-xs text-muted-foreground mt-8 max-w-sm mx-auto">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </PageTransition>
      </main>
      
      <Footer />
    </div>
  )
}
