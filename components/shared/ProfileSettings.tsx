"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/contexts/ToastContext"

interface ProfileSettingsProps {
  isOpen: boolean
  onClose: () => void
  profile: {
    name: string
    avatar: string
    phoneNumber: string
    about?: string
  }
  onUpdate: (name: string, avatar: string, about: string) => void
}

export function ProfileSettings({ isOpen, onClose, profile, onUpdate }: ProfileSettingsProps) {
  const [name, setName] = useState(profile?.name || "")
  const [avatar, setAvatar] = useState(profile?.avatar || "")
  const [about, setAbout] = useState(profile?.about || "")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { addToast } = useToast()

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      addToast({
        title: "Error",
        description: "Por favor selecciona una imagen válida",
        variant: "destructive"
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast({
        title: "Error",
        description: "La imagen no debe superar los 5MB",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      setUploadProgress(0)
      const downloadURL = await onUpdate(name, file as any, about)
      setAvatar(downloadURL)
      setUploadProgress(100)
      
      addToast({
        title: "Éxito",
        description: "Foto de perfil actualizada correctamente",
      })
    } catch (error) {
      console.error("Error al subir la foto de perfil:", error)
      addToast({
        title: "Error",
        description: "No se pudo actualizar la foto de perfil",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!name.trim() || isLoading) return
    
    setIsLoading(true)
    try {
      await onUpdate(name, avatar, about)
      onClose()
      
      addToast({
        title: "Éxito",
        description: "Perfil actualizado correctamente",
      })
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      addToast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#222e35] border-none text-[#e9edef] max-w-md p-0">
        <DialogHeader className="bg-[#202c33] px-4 py-3 flex-row items-center justify-between">
          <DialogTitle className="text-[#e9edef]">Configuración de Perfil</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-[#aebac1] hover:text-[#e9edef]">
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex justify-center">
            <div className="relative group">
              <Avatar className="h-32 w-32 border-2 border-[#00a884] transition-transform group-hover:scale-105">
                <AvatarImage src={avatar} className="object-cover" />
                <AvatarFallback className="bg-[#202c33] text-2xl">
                  {name?.slice(0, 2)?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-[#00a884] rounded-full p-2.5 cursor-pointer hover:bg-[#017561] transition-colors shadow-lg"
              >
                <Camera className="h-5 w-5 text-white" />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isLoading}
                />
              </label>
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="text-sm text-[#8696a0] text-center">Subiendo imagen...</div>
              <Progress value={uploadProgress} className="h-1 bg-[#2a3942]">
                <div 
                  className="h-full bg-[#00a884] transition-all" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </Progress>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-[#8696a0] uppercase font-medium">Nombre</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-[#2a3942] border-none text-[#d1d7db] placeholder:text-[#8696a0] focus-visible:ring-1 focus-visible:ring-[#00a884] h-11"
                placeholder="Tu nombre"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#8696a0] uppercase font-medium">Teléfono</label>
              <Input
                value={profile?.phoneNumber || ""}
                readOnly
                className="bg-[#2a3942] border-none text-[#8696a0] focus-visible:ring-1 focus-visible:ring-[#00a884] h-11"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#8696a0] uppercase font-medium">Info</label>
              <Input
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="bg-[#2a3942] border-none text-[#d1d7db] placeholder:text-[#8696a0] focus-visible:ring-1 focus-visible:ring-[#00a884] h-11"
                placeholder="Info de perfil"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className="w-full bg-[#00a884] hover:bg-[#017561] text-white font-medium h-11 transition-colors"
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}