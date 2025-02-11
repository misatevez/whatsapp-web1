import { db } from "../firebase"
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  doc,
  writeBatch,
  increment,
  Timestamp,
  onSnapshot,
  limit
} from "firebase/firestore"
import type { Message } from "@/types/interfaces"

// Helper function to create a valid Firestore message object
const createMessageObject = (
  content: string,
  isOutgoing: boolean,
  type: "text" | "image" | "document" = "text",
  filename?: string
): Record<string, any> => {
  const now = Timestamp.now()
  
  return {
    content: content.trim(),
    isOutgoing,
    type,
    timestamp: serverTimestamp(),
    status: "sent", // Initialize with "sent" status
    receipts: {
      sent: now.toDate().toISOString(),
      delivered: null,
      read: null
    },
    ...(filename && (type === "document" || type === "image") ? { filename } : {})
  }
}

export const sendMessage = async (
  chatId: string,
  content: string,
  isOutgoing: boolean,
  type: "text" | "image" | "document" = "text",
  filename?: string
): Promise<string> => {
  if (!chatId || !content.trim()) {
    console.error("[sendMessage] Invalid parameters:", { chatId, content })
    throw new Error("Invalid message parameters")
  }

  try {
    console.log("[sendMessage] Sending message:", { chatId, content, isOutgoing, type })
    
    // Create message object
    const messageData = createMessageObject(content, isOutgoing, type, filename)
    
    // Add message to messages subcollection
    const messagesRef = collection(db, `chats/${chatId}/messages`)
    const docRef = await addDoc(messagesRef, messageData)
    
    // Update chat metadata
    const chatRef = doc(db, "chats", chatId)
    await updateDoc(chatRef, {
      lastMessage: content.trim(),
      timestamp: serverTimestamp(),
      [`lastMessage${isOutgoing ? "Admin" : "User"}`]: content.trim(),
      [`lastMessage${isOutgoing ? "Admin" : "User"}Timestamp`]: serverTimestamp(),
      ...(isOutgoing ? {} : { unreadCount: increment(1) })
    })
    
    console.log("[sendMessage] Message sent successfully:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("[sendMessage] Error sending message:", error)
    throw error
  }
}

export const markMessageAsDelivered = async (chatId: string, messageId: string): Promise<void> => {
  try {
    const messageRef = doc(db, `chats/${chatId}/messages/${messageId}`)
    await updateDoc(messageRef, {
      status: "delivered",
      "receipts.delivered": Timestamp.now().toDate().toISOString()
    })
  } catch (error) {
    console.error("[markMessageAsDelivered] Error:", error)
    throw error
  }
}

export const markMessageAsRead = async (chatId: string, messageId: string): Promise<void> => {
  try {
    const messageRef = doc(db, `chats/${chatId}/messages/${messageId}`)
    await updateDoc(messageRef, {
      status: "read",
      "receipts.read": Timestamp.now().toDate().toISOString()
    })
  } catch (error) {
    console.error("[markMessageAsRead] Error:", error)
    throw error
  }
}

export const resetUnreadCount = async (chatId: string): Promise<void> => {
  try {
    const chatRef = doc(db, "chats", chatId)
    await updateDoc(chatRef, {
      unreadCount: 0,
      lastReadByAdmin: serverTimestamp()
    })

    // Also mark all unread messages as read
    const messagesRef = collection(db, `chats/${chatId}/messages`)
    const q = query(messagesRef, orderBy("timestamp", "desc"))
    const snapshot = await getDocs(q)

    const batch = writeBatch(db)
    snapshot.docs.forEach((doc) => {
      const messageData = doc.data()
      if (!messageData.isOutgoing && messageData.status !== "read") {
        batch.update(doc.ref, {
          status: "read",
          "receipts.read": Timestamp.now().toDate().toISOString()
        })
      }
    })
    await batch.commit()

  } catch (error) {
    console.error("[resetUnreadCount] Error:", error)
    throw error
  }
}

export const markMessagesAsRead = async (chatId: string, lastMessageId: string): Promise<void> => {
  try {
    const messagesRef = collection(db, `chats/${chatId}/messages`)
    const q = query(messagesRef, orderBy("timestamp"))
    const snapshot = await getDocs(q)

    const batch = writeBatch(db)
    snapshot.docs.forEach((doc) => {
      const messageData = doc.data()
      if (doc.id <= lastMessageId && !messageData.isOutgoing && messageData.status !== "read") {
        batch.update(doc.ref, {
          status: "read",
          "receipts.read": Timestamp.now().toDate().toISOString()
        })
      }
    })

    await batch.commit()
    
    const chatRef = doc(db, "chats", chatId)
    await updateDoc(chatRef, {
      unreadCount: 0,
      lastReadMessageId: lastMessageId,
      lastReadByAdmin: serverTimestamp()
    })
  } catch (error) {
    console.error("[markMessagesAsRead] Error:", error)
    throw error
  }
}

export const subscribeToMessages = (
  chatId: string, 
  callback: (messages: Message[]) => void
): () => void => {
  const messagesRef = collection(db, `chats/${chatId}/messages`)
  const q = query(messagesRef, orderBy("timestamp", "asc"))

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[]
    callback(messages)
  })
}

export const sendInitialMessage = async (chatId: string, dispatch: any): Promise<void> => {
  if (!chatId) {
    throw new Error("Chat ID is required")
  }

  try {
    // First check if there are any existing messages
    const messagesRef = collection(db, `chats/${chatId}/messages`)
    const q = query(messagesRef, orderBy("timestamp", "asc"), limit(1))
    const snapshot = await getDocs(q)

    // Only send welcome message if there are no messages
    if (snapshot.empty) {
      const messageId = await sendMessage(
        chatId,
        "¡Hola! ¿En qué puedo ayudarte?",
        true // isOutgoing true for admin messages
      )

      const now = Timestamp.now()
      
      const messageData = {
        id: messageId,
        content: "¡Hola! ¿En qué puedo ayudarte?",
        isOutgoing: true,
        type: "text" as const,
        timestamp: now.toDate().toISOString(),
        status: "sent" as const,
        receipts: {
          sent: now.toDate().toISOString(),
          delivered: null,
          read: null
        }
      }

      // Update chat metadata
      const chatRef = doc(db, "chats", chatId)
      await updateDoc(chatRef, {
        lastMessage: messageData.content,
        lastMessageAdmin: messageData.content,
        lastMessageAdminTimestamp: serverTimestamp(),
        timestamp: serverTimestamp()
      })

      // Update state
      dispatch({
        type: "ADD_MESSAGE",
        payload: { chatId, message: messageData }
      })
    }
  } catch (error) {
    console.error("[sendInitialMessage] Error:", error)
    throw error
  }
}