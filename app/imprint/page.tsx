import { Navbar } from '@/components/navbar'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Imprint — FuckUp Feed',
  description: 'Legal information and contact details.',
}

export default async function ImprintPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <main className="mx-auto max-w-2xl px-4 py-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </Link>

        <h1 className="text-2xl font-black text-foreground mb-8">Imprint</h1>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-foreground mb-2">
              Information according to &sect; 5 TMG
            </h2>
            <p>
              This website is operated by a private individual.<br />
              Contact via email only.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-foreground mb-2">
              Contact
            </h2>
            <p>
              Email: contact [at] fuckupfeed [dot] com
            </p>
          </section>

          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-foreground mb-2">
              Liability for Content
            </h2>
            <p>
              The contents of our pages were created with great care. However, we cannot guarantee
              the accuracy, completeness, or timeliness of the content. As a service provider, we
              are responsible for our own content on these pages according to general laws.
              However, we are not obligated to monitor transmitted or stored third-party
              information or to investigate circumstances that indicate illegal activity.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-foreground mb-2">
              Liability for Links
            </h2>
            <p>
              Our website may contain links to external third-party websites over whose content we
              have no influence. Therefore, we cannot accept any liability for this external
              content. The respective provider or operator of the pages is always responsible for
              the content of the linked pages.
            </p>
          </section>

          <section>
            <h2 className="text-xs font-bold uppercase tracking-widest text-foreground mb-2">
              Data Protection
            </h2>
            <p>
              This platform does not collect personal data. No tracking cookies are used. User
              submissions are anonymous and cannot be traced back to individuals.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
