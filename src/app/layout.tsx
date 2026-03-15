import GlobalWrapper from '@/components/GlobalWrapper'
import Header from '@/components/Header'
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
      <body style={{ margin: 0, padding: 0, backgroundColor: '#0a0a0a', color: 'white' }}>
        <GlobalWrapper>
          <div className="flex flex-col min-h-screen overflow-hidden" style={{ display: 'flex', flexDirection: 'column', height: '100dvh', width: '100vw', overflow: 'hidden' }}>
            <Header />
            <main className="flex-1 relative overflow-hidden" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
              {children}
            </main>
          </div>
        </GlobalWrapper>
      </body>
    </html>
  )
}