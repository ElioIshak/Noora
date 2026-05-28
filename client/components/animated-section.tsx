'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  animation?: 'fade-up' | 'fade-in' | 'slide-right' | 'scale-in'
  threshold?: number
}

export function AnimatedSection({ 
  children, 
  className = '', 
  delay = 0,
  animation = 'fade-up',
  threshold = 0.1
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (prefersReducedMotion) {
      setIsVisible(true)
      return
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            requestAnimationFrame(() => {
              setTimeout(() => setIsVisible(true), delay)
            })
            observer.unobserve(element)
          }
        })
      },
      { threshold, rootMargin: '20px' }
    )
    
    observer.observe(element)
    
    return () => observer.disconnect()
  }, [delay, threshold])
  
  const transforms = {
    'fade-up': 'translate3d(0, 30px, 0)',
    'fade-in': 'translate3d(0, 0, 0)',
    'slide-right': 'translate3d(-20px, 0, 0)',
    'scale-in': 'scale3d(0.9, 0.9, 1)',
  }
  
  return (
    <div 
      ref={ref} 
      className={className}
      style={{ 
        opacity: isVisible ? 1 : 0, 
        transform: isVisible ? 'translate3d(0, 0, 0) scale3d(1, 1, 1)' : transforms[animation],
        transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)`,
        willChange: isVisible ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}

export function PageTransition({ children, className = '' }: { children: ReactNode; className?: string }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    const timer = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(timer)
  }, [])
  
  return (
    <div 
      className={className}
      style={{ 
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translate3d(0, 0, 0)' : 'translate3d(0, 16px, 0)',
        transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {children}
    </div>
  )
}

export function StaggerContainer({ 
  children, 
  className = '',
  staggerDelay = 50
}: { 
  children: ReactNode
  className?: string
  staggerDelay?: number
}) {
  return (
    <div className={className}>
      {Array.isArray(children) 
        ? children.map((child, index) => (
            <AnimatedSection key={index} delay={index * staggerDelay}>
              {child}
            </AnimatedSection>
          ))
        : children
      }
    </div>
  )
}
