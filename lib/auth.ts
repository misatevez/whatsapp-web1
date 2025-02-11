import { db } from './firebase'
import { doc, getDoc } from 'firebase/firestore'

export async function validateSession(phoneNumber: string): Promise<boolean> {
  try {
    console.log("[validateSession] Checking:", { phoneNumber })
    const chatRef = doc(db, "chats", phoneNumber)
    const chatDoc = await getDoc(chatRef)
    const exists = chatDoc.exists()
    console.log("[validateSession] Result:", { exists })
    return exists
  } catch (error) {
    console.error("[validateSession] Error:", error)
    return false
  }
}

export function setSession(phoneNumber: string) {
  console.log("[setSession] Setting session:", { phoneNumber })
  localStorage.setItem("whatsapp_phone", phoneNumber)
  document.cookie = `whatsapp_phone=${phoneNumber}; path=/; max-age=31536000`
  console.log("[setSession] Session stored:", {
    localStorage: localStorage.getItem("whatsapp_phone"),
    cookie: document.cookie
  })
}

export function clearSession() {
  console.log("[clearSession] Clearing session")
  localStorage.removeItem("whatsapp_phone")
  document.cookie = "whatsapp_phone=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
}

export function getSession(): string | null {
  const session = localStorage.getItem("whatsapp_phone")
  console.log("[getSession] Current session:", { session })
  return session
}