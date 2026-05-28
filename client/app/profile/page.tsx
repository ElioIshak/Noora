'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header, Footer } from '@/components/layout/header-footer'
import { PageTransition, AnimatedSection } from '@/components/animated-section'
import {
  chatAPI,
  clearAuthToken,
  isAuthenticated,
  userAPI,
  type NotificationPreferences,
  type User as AppUser,
} from '@/lib/api'
import { 
  User, Bell, Shield, Palette, 
  Loader2, Check, ArrowLeft, ChevronRight, Leaf
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'

const settingsSections = [
  {
    id: 'account',
    label: 'Account',
    icon: User,
    description: 'Manage your personal information',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    description: 'Control how Noora reaches out',
  },
  {
    id: 'privacy',
    label: 'Privacy & Security',
    icon: Shield,
    description: 'Manage your data and security',
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: Palette,
    description: 'Customize your experience',
  },
]

export default function ProfilePage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('account')
  const [user, setUser] = useState<AppUser | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState('')
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true)
  const [isSavingNotifications, setIsSavingNotifications] = useState(false)
  const [notificationError, setNotificationError] = useState('')
  const [notificationSuccess, setNotificationSuccess] = useState('')
  const [privacyError, setPrivacyError] = useState('')
  const [privacySuccess, setPrivacySuccess] = useState('')
  const [isDownloadingData, setIsDownloadingData] = useState(false)
  const [isDeletingConversations, setIsDeletingConversations] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notifications: {
      email: true,
      dailyReminders: false,
      weeklyInsights: true,
    },
  })

  useEffect(() => {
    async function loadProfile() {
      if (!isAuthenticated()) {
        setIsLoadingProfile(false)
        setIsLoadingNotifications(false)
        router.replace('/auth/login')
        return
      }

      try {
        const [profile, notifications] = await Promise.all([
          userAPI.getProfile(),
          userAPI.getNotifications(),
        ])
        setUser(profile)
        setFormData((previous) => ({
          ...previous,
          name: profile.name,
          email: profile.email,
          notifications,
        }))
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : 'Failed to load profile.'

        if (message.toLowerCase().includes('not authenticated')) {
          router.replace('/auth/login')
          return
        }

        setError(message)
      } finally {
        setIsLoadingProfile(false)
        setIsLoadingNotifications(false)
      }
    }

    void loadProfile()
  }, [router])
  
  const handleSave = async () => {
    setError('')
    setIsSaving(true)

    try {
      const profile = await userAPI.updateProfile({
        name: formData.name,
        email: formData.email,
      })

      setUser(profile)
      setFormData((previous) => ({
        ...previous,
        name: profile.name,
        email: profile.email,
      }))
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to save profile.')
    } finally {
      setIsSaving(false)
    }
  }

  const applyNotificationState = (notifications: NotificationPreferences) => {
    setFormData((previous) => ({
      ...previous,
      notifications,
    }))
  }

  const handleNotificationToggle = async (
    key: keyof NotificationPreferences,
    checked: boolean
  ) => {
    const previousNotifications = formData.notifications
    const nextNotifications = {
      ...previousNotifications,
      [key]: checked,
    }

    setNotificationError('')
    setNotificationSuccess('')
    applyNotificationState(nextNotifications)
    setIsSavingNotifications(true)

    try {
      const updated = await userAPI.updateNotifications({
        [key]: checked,
      })
      applyNotificationState(updated)
      setNotificationSuccess('Notification preferences saved.')
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Failed to update notifications.'

      if (message.toLowerCase().includes('not authenticated')) {
        handleAuthFailure()
        return
      }

      applyNotificationState(previousNotifications)
      setNotificationError(message)
    } finally {
      setIsSavingNotifications(false)
    }
  }

  const handleAuthFailure = () => {
    clearAuthToken()
    router.replace('/auth/login')
  }

  const resetPrivacyFeedback = () => {
    setPrivacyError('')
    setPrivacySuccess('')
  }

  const handleDownloadMyData = async () => {
    resetPrivacyFeedback()
    setIsDownloadingData(true)

    try {
      const payload = await userAPI.exportMyData()
      const fileName = `noora-data-export-${new Date().toISOString().slice(0, 10)}.json`
      const fileData = JSON.stringify(payload, null, 2)
      const blob = new Blob([fileData], { type: 'application/json' })
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = fileName
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(objectUrl)
      setPrivacySuccess('Your data export is ready and has been downloaded.')
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Failed to export your data.'
      if (message.toLowerCase().includes('not authenticated')) {
        handleAuthFailure()
        return
      }
      setPrivacyError(message)
    } finally {
      setIsDownloadingData(false)
    }
  }

  const handleDeleteAllConversations = async () => {
    const confirmed = window.confirm('Delete all your conversations permanently? This cannot be undone.')
    if (!confirmed) {
      return
    }

    resetPrivacyFeedback()
    setIsDeletingConversations(true)

    try {
      const deletedCount = await chatAPI.deleteAllConversations()
      const conversationLabel = deletedCount === 1 ? 'conversation' : 'conversations'
      setPrivacySuccess(`Deleted ${deletedCount} ${conversationLabel}.`)
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Failed to delete conversations.'
      if (message.toLowerCase().includes('not authenticated')) {
        handleAuthFailure()
        return
      }
      setPrivacyError(message)
    } finally {
      setIsDeletingConversations(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Delete your account permanently? This will remove your profile and conversations and cannot be undone.'
    )
    if (!confirmed) {
      return
    }

    resetPrivacyFeedback()
    setIsDeletingAccount(true)

    try {
      await userAPI.deleteAccount()
      clearAuthToken()
      router.replace('/')
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Failed to delete account.'
      if (message.toLowerCase().includes('not authenticated')) {
        handleAuthFailure()
        return
      }
      setPrivacyError(message)
    } finally {
      setIsDeletingAccount(false)
    }
  }

  const displayName = user?.name || formData.name || 'User'
  const displayEmail = user?.email || formData.email || 'Loading...'
  const initials = displayName.charAt(0).toUpperCase()
  const notificationItems: Array<{ key: keyof NotificationPreferences; label: string; desc: string }> = [
    { key: 'email', label: 'Email Notifications', desc: 'Receive important updates via email' },
    {
      key: 'dailyReminders',
      label: 'Daily Check-in Reminders',
      desc: 'Get gentle reminders to check in with your feelings',
    },
    {
      key: 'weeklyInsights',
      label: 'Weekly Insights',
      desc: 'Receive a summary of your emotional journey',
    },
  ]
  
  return (
    <div className="min-h-screen bg-gradient-hero relative noise-overlay">
      <Header />
      
      <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <PageTransition>
          <div className="max-w-5xl mx-auto">
            {/* Back Button */}
            <AnimatedSection>
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="mb-6 -ml-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </AnimatedSection>
            
            {/* Header */}
            <AnimatedSection delay={50} className="mb-10">
              <div className="flex items-center gap-5">
                <div className="w-18 h-18 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                  <span className="text-primary-foreground font-serif text-2xl font-semibold">
                    {initials}
                  </span>
                </div>
                <div>
                  <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                    {displayName}
                  </h1>
                  <p className="text-muted-foreground">{displayEmail}</p>
                </div>
              </div>
            </AnimatedSection>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar Navigation */}
              <AnimatedSection delay={100} className="lg:col-span-1">
                <Card className="border-border/50 bg-card/70 backdrop-blur-sm shadow-lg shadow-primary/5">
                  <CardContent className="p-2">
                    <nav className="space-y-1">
                      {settingsSections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all ${
                            activeSection === section.id
                              ? 'bg-teal-100 text-teal-800 border border-teal-200 shadow-sm'
                              : 'text-muted-foreground hover:text-teal-700 hover:bg-teal-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <section.icon className="w-4 h-4" />
                            <span className="text-sm font-medium">{section.label}</span>
                          </div>
                          <ChevronRight className={`w-4 h-4 transition-transform ${
                            activeSection === section.id ? 'rotate-90' : ''
                          }`} />
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </AnimatedSection>
              
              {/* Main Content */}
              <AnimatedSection delay={150} className="lg:col-span-3">
                <Card className="border-border/50 bg-card/70 backdrop-blur-sm shadow-xl shadow-primary/5">
                  {activeSection === 'account' && (
                    <>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2.5">
                          <User className="w-5 h-5 text-primary" />
                          Account Settings
                        </CardTitle>
                        <CardDescription>
                          Update your personal information
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {isLoadingProfile && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Loading profile...
                          </div>
                        )}

                        {error && (
                          <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20">
                            {error}
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium">Display Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="h-11 rounded-xl bg-background/60"
                            disabled={isLoadingProfile}
                          />
                          <p className="text-xs text-muted-foreground">
                            This is how Noora will address you
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="h-11 rounded-xl bg-background/60"
                            disabled={isLoadingProfile}
                          />
                        </div>
                        
                        <Button onClick={handleSave} className="rounded-xl shadow-md" disabled={isLoadingProfile || isSaving}>
                          {isSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : isSaved ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Saved!
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </Button>
                      </CardContent>
                    </>
                  )}
                  
                  {activeSection === 'notifications' && (
                    <>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2.5">
                          <Bell className="w-5 h-5 text-primary" />
                          Notifications
                        </CardTitle>
                        <CardDescription>
                          Manage how Noora keeps in touch
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {isLoadingNotifications && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Loading notification preferences...
                          </div>
                        )}

                        {notificationError && (
                          <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20">
                            {notificationError}
                          </div>
                        )}

                        {notificationSuccess && (
                          <div className="p-4 rounded-xl bg-primary/10 text-primary text-sm border border-primary/20">
                            {notificationSuccess}
                          </div>
                        )}

                        {notificationItems.map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border/50">
                            <div>
                              <p className="font-medium text-foreground">{item.label}</p>
                              <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                            <Switch
                              checked={formData.notifications[item.key]}
                              onCheckedChange={(checked) => {
                                void handleNotificationToggle(item.key, checked)
                              }}
                              disabled={isLoadingNotifications || isSavingNotifications}
                            />
                          </div>
                        ))}
                      </CardContent>
                    </>
                  )}
                  
                  {activeSection === 'privacy' && (
                    <>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2.5">
                          <Shield className="w-5 h-5 text-primary" />
                          Privacy & Security
                        </CardTitle>
                        <CardDescription>
                          Manage your data and account security
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        <div className="p-5 rounded-xl bg-noora-sage/30 border border-primary/20">
                          <div className="flex items-start gap-3.5">
                            <Leaf className="w-5 h-5 text-primary mt-0.5" />
                            <div>
                              <h4 className="font-medium text-foreground">Your privacy matters</h4>
                              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                All your conversations with Noora are encrypted and private. 
                                We never share your data with third parties.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {(privacyError || privacySuccess) && (
                          <div
                            className={`p-4 rounded-xl text-sm border ${
                              privacyError
                                ? 'bg-destructive/10 text-destructive border-destructive/20'
                                : 'bg-primary/10 text-primary border-primary/20'
                            }`}
                          >
                            {privacyError || privacySuccess}
                          </div>
                        )}

                        <div className="space-y-3">
                          <Button
                            variant="outline"
                            className="w-full justify-start rounded-xl"
                            onClick={handleDownloadMyData}
                            disabled={isDownloadingData || isDeletingConversations || isDeletingAccount}
                          >
                            {isDownloadingData && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Download My Data
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start rounded-xl text-destructive hover:text-destructive"
                            onClick={handleDeleteAllConversations}
                            disabled={isDownloadingData || isDeletingConversations || isDeletingAccount}
                          >
                            {isDeletingConversations && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Delete All Conversations
                          </Button>
                          <Button
                            variant="destructive"
                            className="w-full justify-start rounded-xl"
                            onClick={handleDeleteAccount}
                            disabled={isDownloadingData || isDeletingConversations || isDeletingAccount}
                          >
                            {isDeletingAccount && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Delete Account
                          </Button>
                        </div>
                      </CardContent>
                    </>
                  )}
                  
                  {activeSection === 'appearance' && (
                    <>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2.5">
                          <Palette className="w-5 h-5 text-primary" />
                          Appearance
                        </CardTitle>
                        <CardDescription>
                          Customize your Noora experience
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-10">
                          <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                            <Palette className="w-7 h-7 text-muted-foreground/50" />
                          </div>
                          <p className="text-muted-foreground">
                            Theme customization coming soon!
                          </p>
                        </div>
                      </CardContent>
                    </>
                  )}
                </Card>
              </AnimatedSection>
            </div>
            
            {/* Back to Chat CTA */}
            <AnimatedSection delay={200} className="mt-10 text-center">
              <Link href="/chat">
                <Button variant="outline" className="rounded-full px-8">
                  <Leaf className="w-4 h-4 mr-2 text-primary" />
                  Return to Chat
                </Button>
              </Link>
            </AnimatedSection>
          </div>
        </PageTransition>
      </main>
      
      <Footer />
    </div>
  )
}
