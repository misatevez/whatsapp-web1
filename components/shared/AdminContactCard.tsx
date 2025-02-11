
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface AdminContactCardProps {
  isOpen: boolean
  onClose: () => void
  adminProfile: {
    name: string
    avatar: string
    about?: string
  }
}

export function AdminContactCard({ isOpen, onClose, adminProfile }: AdminContactCardProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#222e35] border-none text-[#e9edef] max-w-md p-0">
        <DialogHeader className="bg-[#202c33] px-4 py-3 flex-row items-center justify-between">
          <DialogTitle className="text-[#e9edef]">Información del Administrador</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-[#aebac1] hover:text-[#e9edef]">
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
        
        <div className="p-4 space-y-6">
          <div className="bg-[#111b21] p-6 -mx-4 -mt-4 flex flex-col items-center gap-3">
            <Avatar className="h-32 w-32 border-2 border-[#00a884]">
              <AvatarImage src={adminProfile.avatar} className="object-cover" />
              <AvatarFallback className="bg-[#202c33] text-2xl">
                {adminProfile.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-normal text-[#e9edef]">{adminProfile.name}</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-[#111b21] rounded-lg p-4">
              <h4 className="text-[#8696a0] text-sm uppercase font-medium mb-2">Info</h4>
              <p className="text-[#e9edef]">{adminProfile.about || "Hey there! I am using WhatsApp"}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
