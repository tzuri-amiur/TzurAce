import GlobalWrapper from '@/components/GlobalWrapper'
import './globals.css'

export const metadata = {
  title: 'TzurAce | Poker Pre-flop Trainer',
  description: 'Master the science of poker pre-flop decisions with professional ranges.',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
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