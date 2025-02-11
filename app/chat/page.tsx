"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { ChatHeader } from "@/components/shared/chat-header"
import { MessageList } from "@/components/shared/message-list"
import { MessageInput } from "@/components/shared/message-input"
import { BlockedUserMessage } from "@/components/shared/BlockedUserMessage"
import { InstallPWA } from "@/components/shared/InstallPWA"
import type { Chat } from "@/types/interfaces"

const DEFAULT_AVATAR = "https://firebasestorage.googleapis.com/v0/b/cargatusfichas.firebasestorage.apps/o/admin%2Favatar.png?..."

function ChatContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const phoneNumber = searchParams.get("phone")
  
  const [chat, setChat] = useState<Chat | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadChat = async () => {
      if (!phoneNumber) {
        router.push("/")
        return
      }

      try {
        const chatRef = doc(db, "chats", phoneNumber)
        const chatDoc = await getDoc(chatRef)

        if (!chatDoc.exists()) {
          router.push("/")
          return
        }

        setChat({ id: chatDoc.id, ...chatDoc.data() } as Chat)
      } catch (error) {
        console.error("Error loading chat:", error)
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    loadChat()
  }, [phoneNumber, router])

  const handleSendMessage = async (content: string, type: "text" | "image" | "document") => {
    if (!chat) return
    
    // Implement your message sending logic here
    console.log("Sending message:", { content, type })
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!chat) {
    return null
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        name={chat.name || chat.phoneNumber}
        avatar={chat.avatar || DEFAULT_AVATAR}
        online="en línea"
        userProfile={{
          name: chat.name || chat.phoneNumber,
          avatar: chat.avatar || DEFAULT_AVATAR,
          phoneNumber: chat.phoneNumber
        }}
        isUserChat
        adminProfile={{ name: "Admin", avatar: DEFAULT_AVATAR, online: true }}
        statuses={[]}
        onSearch={() => {}}
        searchQuery=""
        onUpdateProfile={() => {}}
        handleSendMessage={handleSendMessage}
      />

      <div className="flex-1 overflow-y-auto relative">
        <MessageList
          messages={chat.messages || []}
          currentUserId="user"
          chatId={chat.id}
          invertOutgoing={true}
          chatSearchQuery=""
        />
      </div>

      <MessageInput onSendMessage={handleSendMessage} chatId={chat.id} />
    </div>
  )
}

export default function ChatPage() {
  return (
    <>
      <InstallPWA />
      <ChatContent />
    </>
  )
}