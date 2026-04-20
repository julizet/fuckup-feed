import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FuckUp Feed — Voice the injustice',
  description:
    'An anonymous platform to report, rate, and amplify daily experiences of discrimination, racism, homophobia, and political misconduct. Give a voice to those who need it most.',
  generator: 'v0.app',
  icons: {
    icon: '/fuckupFeed_fav.png',
    apple: '/fuckupFeed_fav.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${spaceGrotesk.className} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
