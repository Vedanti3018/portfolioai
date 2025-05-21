// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import Navbar from '../components/Navbar'

export const metadata: Metadata = {
  title: 'PortfolioAI',
  description: 'Instant Personal Brand & Job-Readiness Suite',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans bg-zinc-950 text-gray-100">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
