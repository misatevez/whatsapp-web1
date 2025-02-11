"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Share, Plus } from "lucide-react"

export function IOSInstallPrompt() {
  const [isOpen, setIsOpen] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if device is iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    
    // Check if already installed
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone
    
    setIsIOS(isIOSDevice)
    setIsStandalone(isInStandaloneMode)

    // Show prompt after a short delay
    if (isIOSDevice && !isInStandaloneMode) {
      const timer = setTimeout(() => setIsOpen(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  if (!isIOS || isStandalone) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-[#111b21] border-none text-[#e9edef]">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              alt="WhatsApp Logo"
              width={64}
              height={64}
            />
          </div>
          <DialogTitle className="text-center text-xl">
            Instalar WhatsApp Web
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-center text-[#8696a0]">
            Para instalar WhatsApp Web en tu iPhone:
          </p>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-center gap-3 p-3 bg-[#2a3942] rounded-lg">
              <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-[#00a884] rounded-full">
                <span className="text-white font-medium">1</span>
              </div>
              <div className="flex items-center gap-2">
                <Share className="h-5 w-5 text-[#00a884]" />
                <p className="text-sm">Toca el botón "Compartir"</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3 p-3 bg-[#2a3942] rounded-lg">
              <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-[#00a884] rounded-full">
                <span className="text-white font-medium">2</span>
              </div>
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#00a884]" />
                <p className="text-sm">Selecciona "Agregar a Pantalla de inicio"</p>
              </div>
            </div>

            {/* Preview */}
            <div className="relative aspect-[9/16] max-w-[200px] mx-auto">
              <Image
                src="https://firebasestorage.googleapis.com/v0/b/cargatusfichas2.firebasestorage.app/o/admin%2Fios-install.png?alt=media"
                alt="iOS Install Steps"
                fill
                className="object-contain rounded-2xl"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setIsOpen(false)}
              className="bg-[#00a884] hover:bg-[#02906f] text-white"
            >
              Entendido
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}