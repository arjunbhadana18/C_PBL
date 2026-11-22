import './globals.css'

export const metadata = {
  title: 'Skip List Lab',
  description: 'Interactive skip list visualizer: search, insert, delete, range queries, a leaderboard and a complexity graph.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
