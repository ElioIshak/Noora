import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Header, Footer } from '@/components/layout/header-footer'
import { AnimatedSection, PageTransition } from '@/components/animated-section'
import { Heart, Shield, MessageCircle, Sparkles, ArrowRight, Quote, Star, Brain, CheckCircle } from 'lucide-react'

const features = [
  {
    icon: Heart,
    title: 'Compassionate Listening',
    description: 'Noora provides a judgment-free space where you can express your feelings openly and authentically.',
  },
  {
    icon: Shield,
    title: 'Private & Secure',
    description: 'Your conversations stay between you and Noora. We prioritize your privacy and emotional safety.',
  },
  {
    icon: MessageCircle,
    title: 'Always Available',
    description: "Whether it's 3 AM or midday, Noora is here to support you through life's ups and downs.",
  },
  {
    icon: Sparkles,
    title: 'Personalized Support',
    description: 'Noora learns your communication style and adapts to provide the most helpful responses for you.',
  },
]

const testimonials = [
  {
    quote: "Noora helped me understand that it's okay to feel overwhelmed. Having someone to talk to at any hour has been a game-changer for my mental health.",
    author: 'Maya T.',
    role: 'Teacher',
    rating: 5,
  },
  {
    quote: "I was skeptical at first, but Noora's responses feel genuinely caring. It's like talking to a friend who really listens without judgment.",
    author: 'James L.',
    role: 'Software Engineer',
    rating: 5,
  },
  {
    quote: "As someone who struggles to open up, Noora created a safe space where I could finally express my thoughts. It's been transformative.",
    author: 'Priya S.',
    role: 'Graduate Student',
    rating: 5,
  },
]

const emotionChips = [
  'feeling anxious', 'work stress', 'self-care', 'relationships', 
  'sleep better', 'gratitude', 'setting boundaries', 'mindfulness'
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-cyan-50/30 relative">
      <Header />
      
      <main>
        <PageTransition>
          {/* Hero Section */}
          <section className="relative pt-32 pb-24 md:pt-44 md:pb-36 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Decorative blue gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-teal-400/20 via-cyan-300/10 to-transparent rounded-full blur-3xl" aria-hidden="true" />
            <div className="absolute top-40 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" aria-hidden="true" />
            <div className="absolute bottom-0 left-10 w-72 h-72 bg-teal-400/15 rounded-full blur-3xl" aria-hidden="true" />
            <div className="absolute top-1/3 left-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl" aria-hidden="true" />
            
            <div className="max-w-5xl mx-auto text-center relative">
              <AnimatedSection delay={0}>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-teal-100 text-teal-700 text-sm mb-8 border border-teal-200">
                  <Brain className="w-4 h-4" />
                  <span className="font-medium">Your emotional wellbeing matters</span>
                </div>
              </AnimatedSection>
              
              <AnimatedSection delay={100}>
                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-slate-900 leading-[1.1] text-balance mb-7">
                  A safe space for your{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-cyan-500 to-cyan-600">
                    feelings
                  </span>
                </h1>
              </AnimatedSection>
              
              <AnimatedSection delay={200}>
                <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-12 text-pretty">
                  Noora is your compassionate AI companion, here to listen without judgment 
                  and support you through life&apos;s emotional moments.
                </p>
              </AnimatedSection>
              
              <AnimatedSection delay={300}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href="/chat">
                    <Button size="lg" className="rounded-full px-8 py-6 text-base group bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-700 hover:to-cyan-600 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 transition-all border-0">
                      Start a Conversation
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="#features">
                    <Button variant="outline" size="lg" className="rounded-full px-8 py-6 text-base border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </AnimatedSection>
              
              {/* Emotion chips */}
              <AnimatedSection delay={400}>
                <div className="mt-14 flex flex-wrap justify-center gap-2.5 max-w-2xl mx-auto">
                  {emotionChips.map((chip, index) => (
                    <span 
                      key={chip}
                      className="px-4 py-2 rounded-full bg-white/80 text-slate-600 text-sm border border-teal-100 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 transition-all duration-300 cursor-default backdrop-blur-sm shadow-sm"
                      style={{ animationDelay: `${400 + index * 50}ms` }}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </AnimatedSection>
            </div>
          </section>
          
          {/* Trust Banner */}
          <AnimatedSection>
            <section className="py-10 border-y border-teal-100 bg-gradient-to-r from-teal-50/50 via-white to-cyan-50/50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center text-slate-600 text-sm tracking-wide">
                  Trusted by over <span className="font-semibold text-teal-700">50,000</span> people 
                  seeking emotional support and self-understanding
                </p>
              </div>
            </section>
          </AnimatedSection>
          
          {/* Features Section */}
          <section id="features" className="py-24 md:py-36 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-teal-50/50">
            <div className="max-w-7xl mx-auto">
              <AnimatedSection className="text-center mb-20">
                <span className="inline-block text-teal-600 font-semibold text-sm uppercase tracking-widest mb-4">Why Noora</span>
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-slate-900 mb-5 text-balance">
                  Designed for your wellbeing
                </h2>
                <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed">
                  We&apos;ve thoughtfully designed every aspect of Noora to provide 
                  the most supportive experience for your emotional wellbeing.
                </p>
              </AnimatedSection>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {features.map((feature, index) => (
                  <AnimatedSection key={feature.title} delay={index * 100}>
                    <Card className="h-full border-teal-100/80 bg-white/70 backdrop-blur-sm hover:shadow-2xl hover:shadow-teal-500/10 hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group overflow-hidden">
                      <CardContent className="p-7 md:p-9 relative">
                        {/* Gradient background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${feature} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        <div className="relative">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-6 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 shadow-lg shadow-teal-500/25">
                            <feature.icon className="w-7 h-7 text-white" />
                          </div>
                          <h3 className="font-semibold text-xl text-slate-900 mb-3">
                            {feature.title}
                          </h3>
                          <p className="text-slate-600 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>
          
          {/* How It Works */}
          <section className="py-24 md:py-36 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-700 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl" aria-hidden="true" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl" aria-hidden="true" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl" aria-hidden="true" />
            
            <div className="max-w-5xl mx-auto relative">
              <AnimatedSection className="text-center mb-20">
                <span className="inline-block text-teal-200 font-semibold text-sm uppercase tracking-widest mb-4">How It Works</span>
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-5">
                  Simple. Supportive. Safe.
                </h2>
                <p className="text-teal-100 text-lg max-w-2xl mx-auto">
                  Getting started with Noora takes just a moment.
                </p>
              </AnimatedSection>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16">
                {[
                  { step: '01', title: 'Share your feelings', desc: 'Start typing whatever is on your mind. There are no wrong feelings here.' },
                  { step: '02', title: 'Receive support', desc: 'Noora responds with empathy, helping you process and understand your emotions.' },
                  { step: '03', title: 'Grow together', desc: 'Over time, build emotional awareness and develop healthy coping strategies.' },
                ].map((item, index) => (
                  <AnimatedSection key={item.step} delay={index * 150}>
                    <div className="text-center">
                      <div className="inline-block text-6xl md:text-7xl font-serif font-bold text-white/20 mb-5">
                        {item.step}
                      </div>
                      <h3 className="font-semibold text-lg text-white mb-3">{item.title}</h3>
                      <p className="text-teal-100 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>
          
          {/* Testimonials Section */}
          <section id="testimonials" className="py-24 md:py-36 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-teal-50/50 to-white">
            <div className="max-w-7xl mx-auto">
              <AnimatedSection className="text-center mb-20">
                <span className="inline-block text-teal-600 font-semibold text-sm uppercase tracking-widest mb-4">Testimonials</span>
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-slate-900 mb-5 text-balance">
                  Stories of healing
                </h2>
                <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                  Hear from people who have found comfort and growth with Noora.
                </p>
              </AnimatedSection>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                {testimonials.map((testimonial, index) => (
                  <AnimatedSection key={testimonial.author} delay={index * 100}>
                    <Card className="h-full border-teal-100 bg-white hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-500">
                      <CardContent className="p-7 md:p-8 flex flex-col h-full">
                        <Quote className="w-10 h-10 text-teal-200 mb-5" />
                        <p className="text-slate-700 leading-relaxed mb-7 flex-grow text-[15px]">
                          &ldquo;{testimonial.quote}&rdquo;
                        </p>
                        <div className="flex items-center justify-between pt-5 border-t border-teal-50">
                          <div>
                            <p className="font-semibold text-slate-900">{testimonial.author}</p>
                            <p className="text-sm text-slate-500">{testimonial.role}</p>
                          </div>
                          <div className="flex gap-0.5">
                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-teal-500 text-teal-500" />
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>
          
          {/* Stats Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { value: '50K+', label: 'Active Users' },
                  { value: '1M+', label: 'Conversations' },
                  { value: '4.9', label: 'User Rating' },
                  { value: '24/7', label: 'Availability' },
                ].map((stat, index) => (
                  <AnimatedSection key={stat.label} delay={index * 100}>
                    <div className="text-center">
                      <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 mb-2">
                        {stat.value}
                      </div>
                      <div className="text-slate-600 text-sm">{stat.label}</div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </section>
          
          {/* CTA Section */}
          <section className="py-24 md:py-36 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-teal-50">
            <AnimatedSection>
              <div className="max-w-4xl mx-auto">
                <Card className="border-0 bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-700 overflow-hidden relative shadow-2xl shadow-teal-500/25">
                  {/* Decorative */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" aria-hidden="true" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" aria-hidden="true" />
                  
                  <CardContent className="p-10 md:p-14 lg:p-20 text-center relative">
                    <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-5 text-balance">
                      Ready to feel heard?
                    </h2>
                    <p className="text-teal-100 text-lg max-w-xl mx-auto mb-10">
                      Take the first step towards emotional wellbeing. 
                      Noora is here whenever you need a compassionate ear.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Link href="/auth/signup">
                        <Button size="lg" className="rounded-full px-10 py-6 text-base group bg-white text-teal-700 hover:bg-teal-50 shadow-lg">
                          Begin Your Journey
                          <Heart className="ml-2 w-4 h-4 transition-transform group-hover:scale-110" />
                        </Button>
                      </Link>
                    </div>
                    <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-teal-200">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Free to start
                      </span>
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        No credit card
                      </span>
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Cancel anytime
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </AnimatedSection>
          </section>
        </PageTransition>
      </main>
      
      <Footer />
    </div>
  )
}





