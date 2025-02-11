import "./globals.css"
import { Inter } from "next/font/google"
import { AppProvider } from "@/contexts/AppContext"
import { AuthProvider } from "@/contexts/auth-context"
import { ToastProvider } from "@/contexts/ToastContext"
import type { Metadata, Viewport } from "next"
import type React from "react"
import dynamic from 'next/dynamic'

const inter = Inter({ subsets: ["latin"] })

const ICON_URL = "https://firebasestorage.googleapis.com/v0/b/cargatusfichas2.firebasestorage.app/o/admin%2Ffavicon.png?alt=media&token=b5607c23-a39a-409d-ba88-64969459e739"

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
  title: "Cargatusfichas.com",
  description: "Envía y recibe mensajes sin mantener tu teléfono conectado",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cargatusfichas.com",
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
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no" />
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