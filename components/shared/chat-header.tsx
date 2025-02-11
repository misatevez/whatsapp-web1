"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MoreVertical, User } from "lucide-react"
import { AdminContactCard } from "./AdminContactCard"
import { StatusDialog } from "./StatusDialog"
import { ProfileSettings } from "./ProfileSettings"
import Image from "next/image"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { Message, AdminStatus } from "@/types/interfaces"

const DEFAULT_AVATAR = "https://firebasestorage.googleapis.com/v0/b/cargatusfichas2.firebasestorage.app/o/admin%2Favatar.png?alt=media&token=26f755ee-0f3d-4b4d-9d62-8d6eddea8421"

export interface ChatHeaderProps {
  name: string
  avatar?: string
  online?: string
  userProfile?: any
  adminProfile?: any
  statuses: AdminStatus[]
  onSearch: (query: string) => void
  searchQuery: string
  onUpdateProfile?: (name: string, avatar: string, about: string) => void
  handleSendMessage: (content: string, type: "text" | "image" | "document") => Promise<void>
}

export function ChatHeader({
  name,
  avatar = DEFAULT_AVATAR,
  online,
  userProfile,
  adminProfile,
  statuses = [],
  onSearch = () => {},
  searchQuery = "",
  onUpdateProfile = () => {},
  handleSendMessage,
}: ChatHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isAdminContactOpen, setIsAdminContactOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false)

  const handleStatusResponse = async (response: string, imageUrl: string) => {
    try {
      // First send the text response
      await handleSendMessage(response, "text")
      
      // Then send the image
      await handleSendMessage(imageUrl, "image")
    } catch (error) {
      console.error("Error sending status response:", error)
    }
  }

  const handleAvatarClick = () => {
    if (statuses.length > 0) {
      setIsStatusDialogOpen(true)
    } else {
      setIsAdminContactOpen(true)
    }
  }

  const hasActiveStatus = statuses.length > 0

  return (
    <header className="h-[60px] bg-[#202c33] flex items-center justify-between px-2 sm:px-4 relative z-50 pt-safe">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative">
          {/* Status Ring */}
          {hasActiveStatus && (
            <div className="absolute -inset-1 rounded-full bg-[#00a884]">
              <div className="absolute inset-[2px] rounded-full bg-[#202c33]" />
            </div>
          )}
          
          {/* Avatar */}
          <Avatar 
            className={cn(
              "h-10 w-10 cursor-pointer relative",
              hasActiveStatus && "ring-2 ring-[#00a884] ring-offset-2 ring-offset-[#202c33]"
            )}
            onClick={handleAvatarClick}
          >
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
        
        <div 
          className="flex-1 min-w-0 mr-4 cursor-pointer"
          onClick={() => setIsAdminContactOpen(true)}
        >
          <h2 className="text-[#e9edef] text-sm sm:text-base font-medium truncate">
            {name}
          </h2>
          {online && (
            <p className="text-xs text-[#8696a0] truncate">
              {online}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {isSearchOpen ? (
          <div className="flex items-center bg-[#2a3942] rounded-md">
            <Input
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Buscar mensajes"
              className="bg-transparent border-none text-[#d1d7db] placeholder:text-[#8696a0] focus-visible:ring-0 h-9 pl-10 pr-10"
            />
            <Button
              variant="ghost"
              size="icon"
              className="text-[#aebac1]"
              onClick={() => {
                setIsSearchOpen(false)
                onSearch("")
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="hidden sm:flex items-center gap-1">
              <Button variant="ghost" size="icon" className="text-[#aebac1] hover:text-[#e9edef]" onClick={() => setIsSearchOpen(true)}>
                <Search className="h-5 w-5" />
              </Button>
            </div>

            {/* WhatsApp Link */}
            <a 
              href="https://api.whatsapp.com/send/?phone=5493584877949"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-[#2a3942] transition-colors"
            >
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WhatsApp"
                width={20}
                height={20}
                className="opacity-60 hover:opacity-80 transition-opacity"
              />
            </a>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-[#aebac1] hover:text-[#e9edef]">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#233138] border-none text-[#d1d7db]">
                <DropdownMenuItem className="hover:bg-[#182229] focus:bg-[#182229] sm:hidden" onClick={() => setIsSearchOpen(true)}>
                  <Search className="h-4 w-4 mr-2" />
                  Buscar mensajes
                </DropdownMenuItem>
                {userProfile && (
                  <DropdownMenuItem 
                    className="hover:bg-[#182229] focus:bg-[#182229]" 
                    onClick={() => setIsProfileSettingsOpen(true)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Configuración de perfil
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>

      <AdminContactCard
        isOpen={isAdminContactOpen}
        onClose={() => setIsAdminContactOpen(false)}
        adminProfile={adminProfile}
        statuses={statuses}
        onViewStatus={() => {
          setIsAdminContactOpen(false)
          setIsStatusDialogOpen(true)
        }}
      />

      <StatusDialog
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        statuses={statuses}
        onStatusResponse={handleStatusResponse}
      />

      {userProfile && (
        <ProfileSettings
          isOpen={isProfileSettingsOpen}
          onClose={() => setIsProfileSettingsOpen(false)}
          profile={userProfile}
          onUpdate={onUpdateProfile}
        />
      )}
    </header>
  )
}