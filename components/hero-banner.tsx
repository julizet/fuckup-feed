import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Upload, ShieldAlert } from 'lucide-react'

interface HeroBannerProps {
  isLoggedIn: boolean
  totalPosts: number
  totalVotes: number
}

export function HeroBanner({ isLoggedIn, totalPosts, totalVotes }: HeroBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-10 md:px-10 md:py-14">
      {/* Background texture */}
      <div className="pointer-events-none absolute inset-0 opacity-5">
        <div className="absolute -top-10 -right-10 h-64 w-64 rounded-full bg-primary" />
        <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-accent" />
      </div>

      <div className="relative">
        <div className="mb-4 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            100% anonymous — no tracking — no bullshit
          </span>
        </div>

        <h1 className="mb-3 text-balance text-4xl font-black leading-none tracking-tight text-foreground md:text-6xl">
          Give the world a voice.<br />
          <span className="text-primary">Report the fuck-up.</span>
        </h1>

        <p className="mb-6 max-w-xl text-pretty leading-relaxed text-muted-foreground">
          An anonymous platform for minorities, victims, and everyday people to report
          discrimination, racism, homophobia, and political misconduct — and have the
          world vote on what matters most.
        </p>

        <div className="flex flex-wrap items-center gap-4">
          {isLoggedIn ? (
            <Link href="/submit">
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Upload className="h-4 w-4" />
                Report a Fuck-Up
              </Button>
            </Link>
          ) : (
            <Link href="/auth/login">
              <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Upload className="h-4 w-4" />
                Sign in to Report
              </Button>
            </Link>
          )}

          <div className="flex items-center gap-6">
            <div>
              <p className="text-xl font-black text-foreground">{totalPosts.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Reports filed</p>
            </div>
            <div>
              <p className="text-xl font-black text-foreground">{totalVotes.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Votes cast</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
