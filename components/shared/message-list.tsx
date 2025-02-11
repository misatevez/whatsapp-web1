"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, CheckCheck } from "lucide-react"
import { ThumbnailPreview } from "./thumbnail-preview"
import { formatTimestamp } from "@/lib/utils"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Message } from "@/types/interfaces"

interface MessageListProps {
  messages: Message[]
  currentUserId: string
  chatSearchQuery?: string
  chatId: string
  lastReadMessageId?: string
  invertOutgoing?: boolean
  lastMessageUserTimestamp?: string | null
  lastReadByAdmin?: any
}

export const MessageList = React.memo(({
  messages: initialMessages,
  currentUserId,
  chatSearchQuery,
  chatId,
  lastReadMessageId,
  invertOutgoing = false,
  lastMessageUserTimestamp,
  lastReadByAdmin,
}: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>(initialMessages)

  // Subscribe to real-time message updates
  useEffect(() => {
    if (!chatId) return

    console.log("Setting up real-time messages subscription for chat:", chatId)
    
    const messagesRef = collection(db, `chats/${chatId}/messages`)
    const q = query(messagesRef, orderBy("timestamp", "asc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[]
      
      setMessages(updatedMessages)
    })

    return () => unsubscribe()
  }, [chatId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Helper function to safely convert timestamp to milliseconds
  const getTimestampMillis = useCallback((timestamp: any): number => {
    if (!timestamp) return 0
    
    // Handle Firestore Timestamp object
    if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
      return timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000
    }
    
    // Handle ISO string
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp)
      return isNaN(date.getTime()) ? 0 : date.getTime()
    }
    
    // Handle Date object
    if (timestamp instanceof Date) {
      return timestamp.getTime()
    }
    
    return 0
  }, [])

  const filteredMessages = chatSearchQuery
    ? messages.filter((m) =>
        m.content.toLowerCase().includes(chatSearchQuery.toLowerCase())
      )
    : messages

  const renderMessageStatus = useCallback((message: Message, isRightSide: boolean) => {
    if (!isRightSide) return null

    try {
      const messageTimestamp = getTimestampMillis(message.timestamp)
      const userResponseTimestamp = getTimestampMillis(lastMessageUserTimestamp)
      const adminReadTimestamp = getTimestampMillis(lastReadByAdmin)

      const isAdmin = currentUserId === "admin"

      // For admin messages (isOutgoing = true)
      if (isAdmin && message.isOutgoing) {
        // Message is marked as read if there's a user response after it
        const hasUserResponse = userResponseTimestamp > messageTimestamp
        
        // Start with gray checkmarks, turn blue when read
        const checkmarkColor = message.status === "read" || hasUserResponse ? 'text-[#53bdeb]' : 'text-[#8696a0]'
        
        return (
          <CheckCheck 
            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${checkmarkColor}`} 
          />
        )
      }
      
      // For user messages (isOutgoing = false)
      if (!isAdmin && !message.isOutgoing) {
        // Message is marked as read if admin has read it after it was sent
        const hasBeenRead = adminReadTimestamp > messageTimestamp
        
        // Start with gray checkmarks, turn blue when read
        const checkmarkColor = message.status === "read" || hasBeenRead ? 'text-[#53bdeb]' : 'text-[#8696a0]'
        
        return (
          <CheckCheck 
            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${checkmarkColor}`} 
          />
        )
      }
    } catch (error) {
      console.error("Error processing message timestamp:", error)
    }
    
    return null
  }, [currentUserId, lastMessageUserTimestamp, lastReadByAdmin, getTimestampMillis])

  return (
    <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4">
      {filteredMessages.map((message) => {
        const isRightSide = invertOutgoing ? !message.isOutgoing : message.isOutgoing
        const alignmentClass = isRightSide ? "justify-end" : "justify-start"
        const bubbleColorClass = isRightSide ? "bg-[#005c4b]" : "bg-[#202c33]"

        return (
          <div key={message.id} className={`flex ${alignmentClass} mb-2 sm:mb-4`}>
            <div
              className={`max-w-[85%] sm:max-w-[65%] rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 ${bubbleColorClass} ${
                chatSearchQuery ? "bg-[#0b3d36]" : ""
              }`}
            >
              {message.type === "text" ? (
                <p className="text-sm sm:text-base text-[#e9edef] whitespace-pre-wrap">{message.content}</p>
              ) : (
                <ThumbnailPreview
                  content={message.content}
                  type={message.type}
                  filename={message.filename}
                />
              )}

              <div className="flex items-center justify-end gap-1 mt-0.5 sm:mt-1">
                <span className="text-[10px] sm:text-xs text-[#8696a0]">
                  {formatTimestamp(message.timestamp)}
                </span>
                {renderMessageStatus(message, isRightSide)}
              </div>
            </div>
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
})

MessageList.displayName = "MessageList"