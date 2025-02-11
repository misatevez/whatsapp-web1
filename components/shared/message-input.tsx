"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { EmojiPickerComponent } from "./emoji-picker"
import { AttachmentPicker } from "./attachment-picker"

interface MessageInputProps {
  chatId: string
  onSendMessage: (content: string, type: "text" | "image" | "document") => Promise<void>
}

export function MessageInput({ chatId, onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachmentPicker, setShowAttachmentPicker] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSendMessage = async () => {
    if (message.trim() && !isLoading) {
      setIsLoading(true)
      try {
        await onSendMessage(message.trim(), "text")
        setMessage("")
      } catch (error) {
        console.error("Error sending message:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const onEmojiSelect = (emojiData: any) => {
    setMessage((prevMessage) => prevMessage + emojiData.emoji)
    setShowEmojiPicker(false)
  }

  const handleFileSelect = async (content: string, type: "text" | "image" | "document") => {
    if (!isLoading) {
      setIsLoading(true)
      try {
        await onSendMessage(content, type)
      } catch (error) {
        console.error("Error sending file:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-[62px] bg-[#202c33] flex items-center px-2 sm:px-4 gap-1 sm:gap-4 relative z-10 pb-safe">
      <AttachmentPicker
        show={showAttachmentPicker}
        onToggle={() => setShowAttachmentPicker(!showAttachmentPicker)}
        onFileSelect={handleFileSelect}
        disabled={isLoading}
      />
      <EmojiPickerComponent
        showPicker={showEmojiPicker}
        onToggle={() => setShowEmojiPicker(!showEmojiPicker)}
        onEmojiSelect={onEmojiSelect}
        disabled={isLoading}
      />
      <Input
        className="flex-1 bg-[#2a3942] text-[#d1d7db] placeholder:text-[#8696a0] border-none focus-visible:ring-0 h-10 sm:h-12 text-sm sm:text-base"
        placeholder="Escribe un mensaje"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        disabled={isLoading}
      />
      <Button
        variant="ghost"
        size="icon"
        className="text-[#8696a0] hover:bg-[rgba(134,150,160,0.1)] h-10 w-10 sm:h-12 sm:w-12"
        onClick={handleSendMessage}
        disabled={isLoading || !message.trim()}
      >
        <Send className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>
    </div>
  )
}