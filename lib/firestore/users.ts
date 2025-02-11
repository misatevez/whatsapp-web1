import { db, storage } from "../firebase"
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import type { UserProfile } from "@/types/interfaces"

export async function fetchUserProfile(phoneNumber: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, "users", phoneNumber)
    const userDoc = await getDoc(userRef)
    
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile
    }
    return null
  } catch (error) {
    console.error("Error fetching user profile:", error)
    throw error
  }
}

export async function updateUserProfile(
  phoneNumber: string, 
  updates: Partial<UserProfile>
): Promise<void> {
  try {
    // Validate phoneNumber
    if (!phoneNumber) {
      throw new Error("Phone number is required")
    }

    // Create references
    const userRef = doc(db, "users", phoneNumber)
    const chatRef = doc(db, "chats", phoneNumber)

    // Prepare updates with timestamps
    const timestamp = serverTimestamp()
    const userUpdates = {
      ...updates,
      updatedAt: timestamp
    }

    const chatUpdates = {
      ...(updates.name && { name: updates.name }),
      ...(updates.avatar && { userAvatar: updates.avatar }),
      updatedAt: timestamp
    }

    // Update both documents in a batch
    await Promise.all([
      setDoc(userRef, userUpdates, { merge: true }),
      updateDoc(chatRef, chatUpdates)
    ])
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

export async function uploadUserAvatar(
  phoneNumber: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    // Validate inputs
    if (!phoneNumber || !file) {
      throw new Error("Phone number and file are required")
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error("File must be an image")
    }

    // Create storage reference with proper path and file extension
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const storageRef = ref(storage, `users/${phoneNumber}/avatar.${fileExtension}`)
    
    // Create upload task
    const uploadTask = uploadBytesResumable(storageRef, file)
    
    // Return a promise that resolves with the download URL
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Handle progress updates
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          if (onProgress) {
            onProgress(progress)
          }
        },
        (error) => {
          // Handle upload errors
          console.error("Error uploading file:", error)
          reject(error)
        },
        async () => {
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            
            // Update profile with new avatar
            await updateUserProfile(phoneNumber, {
              avatar: downloadURL,
              updatedAt: new Date().toISOString()
            })
            
            resolve(downloadURL)
          } catch (error) {
            console.error("Error getting download URL:", error)
            reject(error)
          }
        }
      )
    })
  } catch (error) {
    console.error("Error initiating upload:", error)
    throw error
  }
}