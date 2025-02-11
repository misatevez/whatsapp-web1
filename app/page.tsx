"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { sendWelcomeMessage } from "@/lib/firestore/messages"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function HomePage() {
  const [phoneNumber, setPhoneNumber] = useState("+54")
  const [verificationCode, setVerificationCode] = useState("")
  const [sentCode, setSentCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [step, setStep] = useState<"phone" | "code">("phone")
  const [codeState, setCodeState] = useState<"idle" | "error" | "success">("idle")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const savedPhone = localStorage.getItem("whatsapp_phone")
    console.log("[HomePage] Initial session check:", { savedPhone })
    
    if (savedPhone) {
      console.log("[HomePage] Existing session found, redirecting to chat")
      router.push(`/chat?phone=${encodeURIComponent(savedPhone)}`)
    }
  }, [router])

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value

    // Always keep the +54 prefix
    if (!value.startsWith("+54")) {
      value = "+54"
    }

    // Remove any non-digit characters after +54
    const digits = value.slice(3).replace(/\D/g, '')
    
    // Reconstruct the phone number with +54 prefix
    setPhoneNumber("+54" + digits)
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!phoneNumber.trim() || phoneNumber.length < 14) { // +54 + 9 digits
      toast({
        title: "Error",
        description: "Por favor ingresa un número de teléfono válido",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      
      const response = await fetch("/api/sendWhatsApp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phoneNumber.trim() }),
      })

      const data = await response.json()
      
      if (data.success) {
        setSentCode(data.verificationCode.toString())
        setStep("code")
        toast({
          title: "Código enviado",
          description: "Revisa tu WhatsApp para ver el código de verificación"
        })
      } else {
        throw new Error(data.error || "Error al enviar el código")
      }
    } catch (error: any) {
      console.error("Error sending code:", error)
      toast({
        title: "Error",
        description: error.message || "Error al enviar el código de verificación",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log("[handleVerifyCode] Starting verification:", {
      verificationCode,
      sentCode,
      phoneNumber
    })

    if (!verificationCode.trim() || !sentCode) {
      console.log("[handleVerifyCode] Missing code or sentCode")
      toast({
        title: "Error",
        description: "Por favor ingresa el código de verificación",
        variant: "destructive"
      })
      return
    }

    setIsVerifying(true)

    if (verificationCode === sentCode) {
      try {
        console.log("[handleVerifyCode] Code matches, setting up session")
        setCodeState("success")
        
        // Create or get chat document
        const chatRef = doc(db, "chats", phoneNumber)
        const chatDoc = await getDoc(chatRef)
        
        if (!chatDoc.exists()) {
          console.log("[handleVerifyCode] Creating new chat document")
          await setDoc(chatRef, {
            id: phoneNumber,
            phoneNumber: phoneNumber,
            name: "",
            lastMessage: "",
            timestamp: serverTimestamp(),
            unreadCount: 0,
            isAgendado: false,
            createdAt: serverTimestamp()
          })

          await sendWelcomeMessage(phoneNumber)
        }

        // Set both localStorage and cookie
        localStorage.setItem("whatsapp_phone", phoneNumber)
        document.cookie = `whatsapp_phone=${phoneNumber}; path=/; max-age=31536000`
        
        console.log("[handleVerifyCode] Session stored:", {
          localStorage: localStorage.getItem("whatsapp_phone"),
          cookie: document.cookie
        })

        toast({
          title: "¡Verificación exitosa!",
          description: "Redirigiendo al chat..."
        })

        // Short delay to show success state
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        console.log("[handleVerifyCode] Redirecting to chat")
        router.push(`/chat?phone=${encodeURIComponent(phoneNumber)}`)
      } catch (error: any) {
        console.error("[handleVerifyCode] Error:", error)
        setCodeState("idle")
        toast({
          title: "Error",
          description: "Error al crear el chat",
          variant: "destructive"
        })
        setIsVerifying(false)
      }
    } else {
      console.log("[handleVerifyCode] Code mismatch")
      setCodeState("error")
      toast({
        title: "Error",
        description: "Código incorrecto",
        variant: "destructive"
      })
      setIsVerifying(false)
      setTimeout(() => {
        setVerificationCode("")
        setCodeState("idle")
      }, 1500)
    }
  }

  return (
    <div className="min-h-screen bg-[#111b21] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#202c33] rounded-2xl p-8 shadow-lg">
        <div className="flex justify-center mb-6">
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            alt="WhatsApp Logo"
            width={80}
            height={80}
          />
        </div>
        
        {step === "phone" ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <Input
              type="tel"
              placeholder="+54 9 11 XXXX XXXX"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className="w-full h-12 bg-[#2a3942] text-[#d1d7db] placeholder:text-[#8696a0]"
              maxLength={14}
              disabled={isLoading}
              autoFocus
            />
            <Button 
              type="submit" 
              className="w-full h-12 bg-[#00a884] hover:bg-[#02906f] text-white font-semibold transition-all"
              disabled={isLoading || phoneNumber.length < 13}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Verificar número"
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <Input
              type="text"
              placeholder="Ingresa el código de 6 dígitos"
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                setCodeState("idle")
              }}
              className={cn(
                "w-full h-12 text-center text-2xl tracking-[0.5em] font-mono transition-all duration-200",
                "bg-[#2a3942] text-[#d1d7db] placeholder:text-[#8696a0]",
                codeState === "error" && "border-red-500",
                codeState === "success" && "border-green-500",
                isVerifying && "opacity-50"
              )}
              maxLength={6}
              disabled={isVerifying}
              autoFocus
            />

            {codeState === "error" && (
              <Alert variant="destructive" className="border border-red-500/50 bg-red-900/10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Código incorrecto, intenta nuevamente
                </AlertDescription>
              </Alert>
            )}

            {codeState === "success" && (
              <Alert className="border border-green-500/50 bg-green-900/10">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-500">
                  ¡Código verificado correctamente!
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              type="submit" 
              className={cn(
                "w-full h-12 font-semibold transition-all",
                codeState === "success" 
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-[#00a884] hover:bg-[#02906f]",
                "text-white"
              )}
              disabled={isVerifying || !verificationCode.trim() || verificationCode.length < 6}
            >
              {isVerifying ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verificando...</span>
                </div>
              ) : (
                "Verificar código"
              )}
            </Button>
            
            {!isVerifying && codeState !== "success" && (
              <Button
                type="button"
                variant="ghost"
                className="w-full text-[#00a884] hover:text-[#02906f] transition-colors"
                onClick={() => {
                  setStep("phone")
                  setCodeState("idle")
                  setVerificationCode("")
                }}
              >
                Cambiar número
              </Button>
            )}
          </form>
        )}
      </div>
    </div>
  )
}