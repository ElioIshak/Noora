'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  const isAuthPage = pathname?.startsWith('/auth')
  const isChatPage = pathname?.startsWith('/chat')
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  if (isChatPage) return null
  
  const navLinks = [
    { href: '/#features', label: 'Features' },
    { href: '/#testimonials', label: 'Stories' },
    { href: '/contact', label: 'Contact' },
  ]
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-xl border-b border-teal-100 shadow-sm' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-teal-600 to-cyan-500 flex items-center justify-center transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-teal-500/30">
              <span className="text-white font-serif text-lg md:text-xl font-semibold">N</span>
            </div>
            <span className="font-serif text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">Noora</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10" aria-label="Main navigation">
            {!isAuthPage && navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                className="relative text-slate-600 hover:text-teal-600 transition-colors duration-300 text-sm font-medium tracking-wide group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-600 rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full" />
              </Link>
            ))}
          </nav>
          
          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthPage ? (
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-teal-600 transition-all duration-300">
                  Back to Home
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-teal-600 transition-all duration-300 font-medium">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="rounded-full px-6 bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-700 hover:to-cyan-600 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5 font-medium border-0">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 -mr-2 text-slate-700 transition-transform duration-300 active:scale-95"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            <div className="relative w-6 h-6">
              <Menu className={`w-6 h-6 absolute transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'}`} />
              <X className={`w-6 h-6 absolute transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}`} />
            </div>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          mobileMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white/95 backdrop-blur-xl border-t border-teal-100">
          <nav className="px-4 py-4 space-y-1" aria-label="Mobile navigation">
            {!isAuthPage && navLinks.map((link, index) => (
              <Link 
                key={link.href}
                href={link.href}
                className="block py-3 px-3 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
                style={{ 
                  transitionDelay: mobileMenuOpen ? `${index * 50}ms` : '0ms',
                  opacity: mobileMenuOpen ? 1 : 0,
                  transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-8px)'
                }}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-teal-100 space-y-2">
              {isAuthPage ? (
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-slate-600 transition-all duration-300">
                    Back to Home
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-slate-600 transition-all duration-300">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full rounded-full bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-700 hover:to-cyan-600 transition-all duration-300 border-0">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

export function Footer() {
  const pathname = usePathname()
  const isChatPage = pathname?.startsWith('/chat')
  
  if (isChatPage) return null
  
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-gradient-to-b from-teal-50/50 to-cyan-100/30 border-t border-teal-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-600 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-serif text-lg font-semibold">N</span>
              </div>
              <span className="font-serif text-xl font-semibold text-slate-900 tracking-tight">Noora</span>
            </Link>
            <p className="text-slate-600 text-sm max-w-md leading-relaxed">
              A safe, warm space for meaningful conversations. Noora is here to listen, 
              support, and help you navigate life&apos;s emotional landscape with compassion.
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-5 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-3">
              <li><Link href="/#features" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">Features</Link></li>
              <li><Link href="/#testimonials" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">Stories</Link></li>
              <li><Link href="/chat" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">Start Chatting</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 mb-5 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-3">
              <li><Link href="/contact" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="text-sm text-slate-600 hover:text-teal-600 transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-14 pt-8 border-t border-teal-200/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-600">
            {currentYear} Noora. Made with care for your wellbeing.
          </p>
          <p className="text-xs text-slate-500">
            Noora is an AI companion and is not a replacement for professional mental health support.
          </p>
        </div>
      </div>
    </footer>
  )
}




