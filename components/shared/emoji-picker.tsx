"use client"

import { Button } from "@/components/ui/button"
import { Smile } from "lucide-react"
import EmojiPicker from "emoji-picker-react"
import type { EmojiPickerProps } from "@/types/interfaces"

export function EmojiPickerComponent({ showPicker, onToggle, onEmojiSelect, disabled }: EmojiPickerProps) {
  return (
    <div className="relative">
      <Button 
        type="button" 
        variant="ghost" 
        size="icon" 
        onClick={onToggle} 
        disabled={disabled}
        className="text-[#8696a0] hover:bg-[rgba(134,150,160,0.1)]"
      >
        <Smile className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>
      {showPicker && (
        <div className="absolute bottom-full left-0 z-50 mb-2">
          <EmojiPicker
            onEmojiClick={onEmojiSelect}
            width={300}
            height={400}
            searchPlaceholder="Buscar emoji"
            previewConfig={{
              showPreview: false
            }}
          />
        </div>
      )}
    </div>
  )
}