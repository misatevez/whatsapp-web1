"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already installed
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone
      || document.referrer.includes('android-app://')
    
    setIsStandalone(isInStandaloneMode)

    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }

  if (isStandalone || !showInstallPrompt) return null

  return (
    <Dialog open={showInstallPrompt} onOpenChange={setShowInstallPrompt}>
      <DialogContent className="bg-[#111b21] border-none text-[#e9edef]">
        <DialogHeader>
          <DialogTitle>Instalar WhatsApp Web</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Instala WhatsApp Web para una mejor experiencia:</p>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Acceso rápido desde tu pantalla de inicio</li>
            <li>Experiencia de pantalla completa</li>
            <li>Mejor rendimiento</li>
          </ul>
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowInstallPrompt(false)}
            >
              Más tarde
            </Button>
            <Button
              onClick={handleInstall}
              className="bg-[#00a884] hover:bg-[#02906f]"
            >
              Instalar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}