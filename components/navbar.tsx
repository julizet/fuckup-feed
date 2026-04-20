'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Upload, LogOut, LogIn, Menu, X, LayoutList } from 'lucide-react'

interface NavbarProps {
  user: { email?: string } | null
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tighter text-primary">FUCKUP</span>
          <span className="rounded bg-primary px-1.5 py-0.5 text-xs font-bold uppercase text-primary-foreground">
            FEED
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                href="/my-posts"
                className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <LayoutList className="h-4 w-4" />
                My Posts
              </Link>
              <Link href="/submit">
                <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Upload className="h-4 w-4" />
                  Report a FuckUp
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSignOut}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </>
          ) : (
            <Link href="/auth/login">
              <Button size="sm" variant="outline" className="gap-2 border-border">
                <LogIn className="h-4 w-4" />
                Sign in to report
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-muted-foreground"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-3 pt-4">
            {user ? (
              <>
                <Link
                  href="/my-posts"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground"
                  onClick={() => setMenuOpen(false)}
                >
                  <LayoutList className="h-4 w-4" />
                  My Posts
                </Link>
                <Link href="/submit" onClick={() => setMenuOpen(false)}>
                  <Button size="sm" className="w-full gap-2 bg-primary text-primary-foreground">
                    <Upload className="h-4 w-4" />
                    Report a FuckUp
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSignOut}
                  className="w-full gap-2 text-muted-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                <Button size="sm" variant="outline" className="w-full gap-2 border-border">
                  <LogIn className="h-4 w-4" />
                  Sign in to report
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
