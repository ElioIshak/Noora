import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Noora - Your Compassionate AI Companion',
    template: '%s | Noora',
  },
  description: 'Noora is an AI emotional support platform that provides a safe, warm space for meaningful conversations about your feelings and wellbeing.',
  keywords: ['emotional support', 'AI companion', 'mental wellness', 'self-care', 'mindfulness'],
  authors: [{ name: 'Noora' }],
  creator: 'Noora',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Noora',
    title: 'Noora - Your Compassionate AI Companion',
    description: 'A safe, warm space for meaningful conversations about your feelings and wellbeing.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Noora - Your Compassionate AI Companion',
    description: 'A safe, warm space for meaningful conversations about your feelings and wellbeing.',
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3f8ff' },
    { media: '(prefers-color-scheme: dark)', color: '#111a2b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className="font-sans antialiased min-h-screen">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
