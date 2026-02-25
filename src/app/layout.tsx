import GlobalWrapper from '@/components/GlobalWrapper'
import './globals.css'

export const metadata = {
  title: 'TzurAce - Poker Academy',
  description: 'Master the Science of Poker',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <GlobalWrapper>
          {children}
        </GlobalWrapper>
      </body>
    </html>
  )
}