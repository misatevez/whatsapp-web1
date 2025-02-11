"use client"

import type React from "react"
import { InstallPWA } from "@/components/shared/InstallPWA"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
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