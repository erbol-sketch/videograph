import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Old_Standard_TT, Special_Elite, UnifrakturCook } from 'next/font/google'
import './globals.css'

const display = Playfair_Display({ subsets: ['latin', 'cyrillic'], weight: ['400', '700', '900'], style: ['normal', 'italic'], variable: '--f-display' })
const body = Old_Standard_TT({ subsets: ['latin', 'cyrillic'], weight: ['400', '700'], style: ['normal', 'italic'], variable: '--f-body' })
const type = Special_Elite({ subsets: ['latin'], weight: '400', variable: '--f-type' })
const black = UnifrakturCook({ subsets: ['latin'], weight: '700', variable: '--f-black' })

export const metadata: Metadata = {
  title: 'Every Frame Tells a Story — Mobile Photographer',
  description: 'Portraits, weddings, events and video.',
}
export const viewport: Viewport = { themeColor: '#0b0705', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${type.variable} ${black.variable}`}>
      <body>
        {children}
        <div className="grain" aria-hidden />
      </body>
    </html>
  )
}