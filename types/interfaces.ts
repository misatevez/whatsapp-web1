
// Update the Chat interface to include userAvatar
export interface Chat {
  id: string
  name: string
  phoneNumber: string
  lastMessage: string
  timestamp: string
  online?: boolean
  avatar?: string
  photoURL?: string
  userAvatar?: string // Add this field
  messages?: Message[]
  categories?: string[]
  about?: string
  unreadCount: number
  isAgendado: boolean
  lastReadMessageId?: string
}
