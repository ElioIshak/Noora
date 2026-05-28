import { Header, Footer } from '@/components/layout/header-footer'
import { PageTransition } from '@/components/animated-section'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-hero relative noise-overlay flex flex-col">
      <Header />
      <main className="flex-grow pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <PageTransition>
          <div className="max-w-3xl mx-auto rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-8 md:p-10">
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">Terms of Service</h1>
            <p className="text-muted-foreground mb-6">
              Effective date: May 20, 2026.
            </p>
            <div className="space-y-5 text-sm md:text-base text-foreground/90 leading-relaxed">
              <p>
                Noora is an AI emotional-support companion and not a substitute for medical care, psychiatric care, or
                licensed therapy.
              </p>
              <p>
                By using Noora, you agree to use the service lawfully and not attempt to abuse, disrupt, or reverse
                engineer the platform.
              </p>
              <p>
                You are responsible for keeping your account credentials secure. If you suspect unauthorized access,
                reset your password immediately.
              </p>
              <p>
                Noora may update these terms as the service evolves. Continued use after updates means you accept the
                revised terms.
              </p>
            </div>
          </div>
        </PageTransition>
      </main>
      <Footer />
    </div>
  )
}
