import "./globals.css"
import { Inter } from "next/font/google"
import { AppProvider } from "@/contexts/AppContext"
import { AuthProvider } from "@/contexts/auth-context"
import type { Metadata, Viewport } from "next"
import type React from "react"
import dynamic from 'next/dynamic'

const inter = Inter({ subsets: ["latin"] })

const ICON_URL = "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#111b21",
  viewportFit: "cover",
  minimumScale: 1
}

export const metadata: Metadata = {
  title: "WhatsApp Web",
  description: "Envía y recibe mensajes sin mantener tu teléfono conectado",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WhatsApp Web",
    startupImage: [ICON_URL]
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: ICON_URL,
    shortcut: ICON_URL,
    apple: ICON_URL,
    other: {
      rel: "apple-touch-icon-precomposed",
      url: ICON_URL
    }
  }
}

// Dynamically import providers to avoid hydration issues
const Providers = dynamic(() => import('@/components/Providers'), {
  ssr: false
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#111b21" />
        <link rel="apple-touch-icon" href={ICON_URL} />
        <link rel="apple-touch-icon-precomposed" href={ICON_URL} />
        <link rel="icon" type="image/png" href={ICON_URL} />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} overscroll-none`} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}