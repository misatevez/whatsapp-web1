"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useToast } from "@/contexts/ToastContext"
import { useAppContext } from "@/contexts/AppContext"
import { ChatHeader } from "@/components/shared/chat-header"
import { MessageList } from "@/components/shared/message-list"
import { MessageInput } from "@/components/shared/message-input"
import { InstallPWA } from "@/components/shared/InstallPWA"
import { IOSInstallPrompt } from "@/components/shared/IOSInstallPrompt"
import { BlockedUserMessage } from "@/components/shared/BlockedUserMessage"
import { sendMessage } from "@/lib/firestore/messages"
import { fetchAdminProfile } from "@/lib/firestore/adminProfile"
import { fetchUserProfile, updateUserProfile } from "@/lib/firestore/users"
import { DEFAULT_AVATAR } from "@/constants/constants"
import { doc, onSnapshot, collection, query, orderBy, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Chat, Message, AdminProfile, UserProfile, AdminStatus } from "@/types/interfaces"

function ChatContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const phoneNumber = searchParams.get("phone")
  const { addToast } = useToast()
  
  const [chat, setChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [adminStatuses, setAdminStatuses] = useState<AdminStatus[]>([])
  const [isBlocked, setIsBlocked] = useState(false)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  // Check if it's a new user
  useEffect(() => {
    const isNewUser = !localStorage.getItem("returning_user")
    if (isNewUser) {
      setShowInstallPrompt(true)
      localStorage.setItem("returning_user", "true")
    }
  }, [])

  // Rest of your existing useEffects...

  return (
    <>
      {showInstallPrompt && <IOSInstallPrompt />}
      <InstallPWA />
      <div className="h-[100dvh] w-full bg-[#0b141a] text-[#e9edef] overflow-hidden relative">
        <div className="flex flex-col h-full">
          {/* Rest of your existing JSX... */}
        </div>
      </div>
    </>
  )
}

export default function ChatPage() {
  return <ChatContent />
}