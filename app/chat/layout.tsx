"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { validateSession, getSession } from "@/lib/auth"
import { InstallPWA } from "@/components/shared/InstallPWA"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const phoneNumber = getSession()
      console.log("[ChatLayout] Checking session:", { phoneNumber })
      
      if (!phoneNumber) {
        console.log("[ChatLayout] No session found, redirecting to home")
        router.push("/")
        return
      }

      const isValid = await validateSession(phoneNumber)
      console.log("[ChatLayout] Session validation result:", { isValid })
      
      if (!isValid) {
        console.log("[ChatLayout] Invalid session, redirecting to home")
        router.push("/")
      }
    }

    checkSession()
  }, [router])

  return (
    <div className="pwa-container bg-[#0b141a] text-[#e9edef] overflow-hidden relative">
      <InstallPWA />
      <div 
        className="absolute inset-0 z-[1] opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: 'url("https://static.whatsapp.net/rsrc.php/v4/yl/r/gi_DckOUM5a.png")',
          backgroundSize: '600px',
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center'
        }}
      />
      
      <div className="relative z-10 h-full flex flex-col mx-auto max-w-7xl">
        {children}
      </div>
    </div>
  )
}