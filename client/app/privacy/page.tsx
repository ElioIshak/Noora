import { Header, Footer } from '@/components/layout/header-footer'
import { PageTransition } from '@/components/animated-section'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-hero relative noise-overlay flex flex-col">
      <Header />
      <main className="flex-grow pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <PageTransition>
          <div className="max-w-3xl mx-auto rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-8 md:p-10">
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground mb-6">
              Effective date: May 20, 2026.
            </p>
            <div className="space-y-5 text-sm md:text-base text-foreground/90 leading-relaxed">
              <p>
                Noora stores account information, conversation content, and preference settings so the app can provide
                secure access and personalized emotional-support conversations.
              </p>
              <p>
                Your conversation data is not sold to third parties. Access to your data is limited to systems required
                to operate Noora, including model and infrastructure services.
              </p>
              <p>
                You can export your data and delete your account from the profile privacy section. Account deletion
                permanently removes your profile and conversation history from Noora databases.
              </p>
              <p>
                If you need help with privacy questions, contact us through the in-app contact form.
              </p>
            </div>
          </div>
        </PageTransition>
      </main>
      <Footer />
    </div>
  )
}
