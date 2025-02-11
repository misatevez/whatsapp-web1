"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { sendWelcomeMessage } from "@/lib/firestore/messages"

export default function HomePage() {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!phoneNumber.trim()) return

    try {
      setIsLoading(true)
      
      // Create or get chat document
      const chatRef = doc(db, "chats", phoneNumber)
      const chatDoc = await getDoc(chatRef)
      
      if (!chatDoc.exists()) {
        // Create new chat document if it doesn't exist
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

        // Send welcome message
        await sendWelcomeMessage(phoneNumber)
      }

      // Save phone to localStorage
      localStorage.setItem("whatsapp_phone", phoneNumber)
      
      // Redirect to chat
      router.push(`/chat?phone=${encodeURIComponent(phoneNumber)}`)
    } catch (error) {
      console.error("Error creating chat:", error)
      setIsLoading(false)
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Ingresa tu número"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full h-12 bg-[#2a3942] text-[#d1d7db] placeholder:text-[#8696a0]"
          />
          <Button 
            type="submit" 
            className="w-full h-12 bg-[#00a884] hover:bg-[#02906f] text-white font-semibold"
            disabled={isLoading || !phoneNumber.trim()}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Ir al chat"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}