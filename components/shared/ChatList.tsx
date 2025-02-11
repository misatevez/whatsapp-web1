import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useAppContext } from "@/contexts/AppContext"
import { setSelectedChat, updateChat } from "@/contexts/appActions"
import type { Chat } from "@/types/interfaces"

const DEFAULT_AVATAR =
  "https://firebasestorage.googleapis.com/v0/b/cargatusfichas.firebasestorage.app/o/admin%2Favatar.png?alt=media&token=54132d01-d241-429a-b131-1be8951406b7"

function getDisplayTime(rawTimestamp: any): string {
  console.log("[ChatList] getDisplayTime input:", rawTimestamp)
  
  if (!rawTimestamp) {
    console.log("[ChatList] No timestamp provided")
    return ""
  }

  try {
    // Handle Firestore Timestamp
    if (typeof rawTimestamp === 'object' && rawTimestamp !== null && 'seconds' in rawTimestamp) {
      console.log("[ChatList] Processing Firestore timestamp:", rawTimestamp)
      const milliseconds = rawTimestamp.seconds * 1000 + (rawTimestamp.nanoseconds || 0) / 1000000
      const date = new Date(milliseconds)
      const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      console.log("[ChatList] Formatted Firestore time:", formattedTime)
      return formattedTime
    }

    // Handle ISO string
    if (typeof rawTimestamp === 'string') {
      console.log("[ChatList] Processing ISO string timestamp:", rawTimestamp)
      const date = new Date(rawTimestamp)
      if (!isNaN(date.getTime())) {
        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        console.log("[ChatList] Formatted ISO time:", formattedTime)
        return formattedTime
      }
    }

    console.log("[ChatList] Could not process timestamp:", rawTimestamp)
    return ""
  } catch (error) {
    console.error("[ChatList] Error formatting timestamp:", error, { rawTimestamp })
    return ""
  }
}

function parseTimestampToNumber(rawTimestamp: any): number {
  if (!rawTimestamp) return 0

  try {
    // Handle Firestore Timestamp
    if (typeof rawTimestamp === 'object' && rawTimestamp !== null && 'seconds' in rawTimestamp) {
      return rawTimestamp.seconds * 1000 + (rawTimestamp.nanoseconds || 0) / 1000000
    }

    // Handle ISO string
    if (typeof rawTimestamp === 'string') {
      const date = new Date(rawTimestamp)
      return isNaN(date.getTime()) ? 0 : date.getTime()
    }

    return 0
  } catch (error) {
    console.error("[ChatList] Error parsing timestamp:", error, { rawTimestamp })
    return 0
  }
}

interface ChatListProps {
  chats: Chat[]
  selectedChatId: string | null
}

export function ChatList({ chats, selectedChatId }: ChatListProps) {
  const { dispatch } = useAppContext()

  // Log the full chat objects to see all data
  console.log('[ChatList] Raw chat data:', chats)

  const sortedChats = [...chats].sort((a, b) => {
    // Sort by the latest message timestamp
    const aTime = parseTimestampToNumber(a.lastMessageUserTimestamp || a.lastMessageAdminTimestamp || a.timestamp)
    const bTime = parseTimestampToNumber(b.lastMessageUserTimestamp || b.lastMessageAdminTimestamp || b.timestamp)
    console.log('[ChatList] Comparing timestamps:', {
      chatA: { id: a.id, timestamp: aTime },
      chatB: { id: b.id, timestamp: bTime }
    })
    return bTime - aTime
  })

  const handleChatClick = (chatId: string) => {
    dispatch(
      updateChat({
        id: chatId,
        unreadCount: 0,
        lastReadByAdmin: new Date().toISOString(),
      }),
    )
    dispatch(setSelectedChat(chatId))
  }

  return (
    <div className="flex-1 overflow-y-auto relative z-20 bg-[#111b21]">
      {sortedChats.map((chat) => {
        const displayName = chat.name || chat.phoneNumber
        
        // Get timestamp and log it with more detail
        const timestamp = chat.lastMessageUserTimestamp || chat.lastMessageAdminTimestamp || chat.timestamp
        console.log(`[ChatList] Chat ${chat.id} data:`, {
          lastMessageUserTimestamp: chat.lastMessageUserTimestamp,
          lastMessageAdminTimestamp: chat.lastMessageAdminTimestamp,
          timestamp: chat.timestamp,
          selectedTimestamp: timestamp
        })
        
        const displayedTime = getDisplayTime(timestamp)
        console.log(`[ChatList] Chat ${chat.id} final displayed time:`, displayedTime)
        
        const badgeCount = chat.unreadCount ?? 0
        const nameClass = badgeCount > 0 ? "text-white font-bold" : "text-[#e9edef] font-medium"
        const lastMessageClass = badgeCount > 0 ? "text-[#e9edef] font-bold" : "text-[#8696a0]"
        
        // Use the available avatar
        const avatarUrl = chat.userAvatar || chat.photoURL || chat.avatar || DEFAULT_AVATAR

        // Get the latest message
        const lastMessage = chat.lastMessageUser || chat.lastMessageAdmin || chat.lastMessage || ""

        return (
          <div
            key={chat.id}
            onClick={() => handleChatClick(chat.id)}
            className={cn(
              "w-full flex items-center p-3 hover:bg-[#202c33] transition-colors cursor-pointer",
              selectedChatId === chat.id && "bg-[#202c33]",
            )}
          >
            <Avatar className="h-12 w-12 mr-3">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex justify-between items-baseline">
                <div className="flex items-center gap-1">
                  <h3 className={cn("truncate text-base", nameClass)}>{displayName}</h3>
                  {chat.isBlocked && (
                    <span className="text-red-500" title="Usuario bloqueado">🚫</span>
                  )}
                </div>
                <span className="text-xs text-[#8696a0]">{displayedTime}</span>
              </div>
              <div className="flex items-center gap-1">
                {chat.online && <div className="w-2 h-2 rounded-full bg-[#00a884]" />}
                <p className={cn("text-sm truncate", lastMessageClass)}>{lastMessage}</p>
                {badgeCount > 0 && (
                  <span className="ml-auto bg-[#00a884] text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
                    {badgeCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}