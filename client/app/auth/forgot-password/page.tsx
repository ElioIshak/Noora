'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageTransition } from '@/components/animated-section'
import { ArrowLeft, Check, Copy, Loader2, RotateCcw } from 'lucide-react'
import { authAPI } from '@/lib/api'

export default function ForgotPasswordPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [requestMessage, setRequestMessage] = useState('')
  const [requestError, setRequestError] = useState('')
  const [requestLoading, setRequestLoading] = useState(false)

  const [resetMessage, setResetMessage] = useState('')
  const [resetError, setResetError] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const tokenFromUrl = new URLSearchParams(window.location.search).get('token')
    if (tokenFromUrl) {
      setResetToken(tokenFromUrl)
    }
  }, [])

  const handleRequestReset = async (event: React.FormEvent) => {
    event.preventDefault()
    setRequestError('')
    setRequestMessage('')
    setRequestLoading(true)

    try {
      const result = await authAPI.forgotPassword(email)
      setRequestMessage(result.message)
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Failed to request password reset.')
    } finally {
      setRequestLoading(false)
    }
  }

  const handleCopyToken = async () => {
    if (!resetToken) {
      return
    }

    try {
      await navigator.clipboard.writeText(resetToken)
      setRequestMessage('Reset token copied to clipboard.')
    } catch {
      setRequestError('Unable to copy token. Please copy it manually.')
    }
  }

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setResetError('')
    setResetMessage('')

    if (!resetToken.trim()) {
      setResetError('Reset token is required.')
      return
    }

    if (newPassword.length < 8) {
      setResetError('Password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match.')
      return
    }

    setResetLoading(true)

    if (!email.trim()) {
      setResetError('Email is required.')
      return
    }

    try {
      await authAPI.resetPassword(email, resetToken, newPassword)
      setResetMessage('Password has been reset. Redirecting to login...')
      setTimeout(() => router.push('/auth/login'), 1200)
    } catch (error) {
      setResetError(error instanceof Error ? error.message : 'Failed to reset password.')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero relative noise-overlay flex flex-col">

      <main className="flex-grow flex items-center justify-center px-4 py-32">
        <PageTransition className="w-full max-w-lg space-y-6">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/5">
            <CardHeader className="pb-4">
              <CardTitle className="font-serif text-2xl">Forgot your password?</CardTitle>
              <CardDescription>
                Enter your account email to generate a reset token.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRequestReset} className="space-y-4">
                {requestError && (
                  <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20">
                    {requestError}
                  </div>
                )}

                {requestMessage && (
                  <div className="p-4 rounded-xl bg-primary/10 text-primary text-sm border border-primary/20">
                    {requestMessage}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    className="h-11 rounded-xl bg-background/60"
                  />
                </div>

                <Button type="submit" className="w-full h-11 rounded-xl" disabled={requestLoading}>
                  {requestLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating token...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Generate Reset Token
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-xl shadow-primary/5">
            <CardHeader className="pb-4">
              <CardTitle className="font-serif text-xl">Reset Password</CardTitle>
              <CardDescription>
                Paste your reset token and set a new password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResetPassword} className="space-y-4">
                {resetError && (
                  <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20">
                    {resetError}
                  </div>
                )}

                {resetMessage && (
                  <div className="p-4 rounded-xl bg-primary/10 text-primary text-sm border border-primary/20">
                    {resetMessage}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reset-token" className="text-sm font-medium">Reset Token</Label>
                  <div className="flex gap-2">
                    <Input
                      id="reset-token"
                      value={resetToken}
                      onChange={(event) => setResetToken(event.target.value)}
                      placeholder="Paste your reset token"
                      className="h-11 rounded-xl bg-background/60"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-xl px-3"
                      onClick={() => void handleCopyToken()}
                      disabled={!resetToken}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-sm font-medium">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    className="h-11 rounded-xl bg-background/60"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Re-enter your new password"
                    className="h-11 rounded-xl bg-background/60"
                    required
                  />
                </div>

                <Button type="submit" className="w-full h-11 rounded-xl" disabled={resetLoading}>
                  {resetLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Resetting password...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Reset Password
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-5 text-center">
                <Link href="/auth/login" className="inline-flex items-center text-sm text-primary hover:text-primary/80">
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to login
                </Link>
              </div>
            </CardContent>
          </Card>
        </PageTransition>
      </main>

    </div>
  )
}
