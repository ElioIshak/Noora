'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header, Footer } from '@/components/layout/header-footer'
import { PageTransition, AnimatedSection } from '@/components/animated-section'
import { 
  Mail, MessageSquare, Loader2, Check, Leaf,
  Clock, Shield, Sparkles
} from 'lucide-react'
import { contactAPI } from '@/lib/api'

const contactReasons = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'support', label: 'Technical Support' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'partnership', label: 'Partnership' },
]

const faqs = [
  {
    question: 'Is Noora a replacement for therapy?',
    answer: 'No, Noora is an AI companion designed to provide emotional support and a safe space to express your feelings. For clinical mental health needs, we always recommend working with a licensed professional.',
  },
  {
    question: 'How is my data protected?',
    answer: 'Your privacy is our priority. All conversations are encrypted, and we never share your personal data with third parties. You can delete your data at any time.',
  },
  {
    question: 'Can I use Noora for free?',
    answer: 'Yes! Noora offers a free tier with generous usage limits. Premium plans are available for those who want unlimited conversations and additional features.',
  },
]

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'general',
    message: '',
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await contactAPI.submit(formData)
      setIsSubmitted(true)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to send your message.')
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-hero relative noise-overlay">
        <Header />
        
        <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
          <PageTransition>
            <div className="max-w-md mx-auto text-center">
              <div className="w-20 h-20 rounded-full bg-primary mx-auto mb-7 flex items-center justify-center shadow-lg shadow-primary/25">
                <Check className="w-9 h-9 text-primary-foreground" />
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-4">
                Message Received
              </h1>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Thank you for reaching out. We&apos;ll get back to you within 24-48 hours.
              </p>
              <Button 
                onClick={() => setIsSubmitted(false)}
                variant="outline"
                className="rounded-full px-6"
              >
                Send Another Message
              </Button>
            </div>
          </PageTransition>
        </main>
        
        <Footer />
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-hero relative noise-overlay">
      <Header />
      
      <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <PageTransition>
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <AnimatedSection className="text-center mb-14">
              <span className="inline-block text-primary font-medium text-sm uppercase tracking-widest mb-4">Contact Us</span>
              <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-5 text-balance">
                Get in Touch
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Have questions or feedback? We&apos;d love to hear from you. 
                Our team is here to help.
              </p>
            </AnimatedSection>
            
            {/* Features */}
            <AnimatedSection delay={100} className="mb-14">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: Clock, label: 'Quick Response', desc: 'Within 24-48 hours' },
                  { icon: Shield, label: 'Privacy First', desc: 'Your info stays safe' },
                  { icon: Sparkles, label: 'Helpful Team', desc: 'Real humans, real care' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4 p-5 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-sm">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedSection>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Contact Form */}
              <AnimatedSection delay={200} className="lg:col-span-3">
                <Card className="border-border/50 bg-card/70 backdrop-blur-sm shadow-xl shadow-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2.5">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      Send us a Message
                    </CardTitle>
                    <CardDescription>
                      Fill out the form below and we&apos;ll respond as soon as possible.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {error && (
                        <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm text-center border border-destructive/20">
                          {error}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                          <Input
                            id="name"
                            placeholder="Your name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="h-11 rounded-xl bg-background/60"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="h-11 rounded-xl bg-background/60"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                        <select
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="w-full h-11 px-4 rounded-xl border border-input bg-background/60 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          {contactReasons.map((reason) => (
                            <option key={reason.value} value={reason.value}>
                              {reason.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-sm font-medium">Message</Label>
                        <Textarea
                          id="message"
                          placeholder="How can we help?"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          required
                          rows={5}
                          className="rounded-xl resize-none bg-background/60"
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full h-12 rounded-xl text-base shadow-lg shadow-primary/20"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </AnimatedSection>
              
              {/* FAQs Sidebar */}
              <AnimatedSection delay={300} className="lg:col-span-2">
                <Card className="border-border/50 bg-card/70 backdrop-blur-sm sticky top-24 shadow-xl shadow-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2.5">
                      <Leaf className="w-5 h-5 text-primary" />
                      Frequently Asked
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-7">
                    {faqs.map((faq, index) => (
                      <div key={index}>
                        <h4 className="font-semibold text-foreground mb-2 text-sm">
                          {faq.question}
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </PageTransition>
      </main>
      
      <Footer />
    </div>
  )
}
