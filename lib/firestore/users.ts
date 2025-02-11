
import { db, storage } from "../firebase"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
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
    const userRef = doc(db, "users", phoneNumber)
    await setDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    }, { merge: true })
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
    // Create storage reference with a unique filename
    const storageRef = ref(storage, `users/${phoneNumber}/avatar_${Date.now()}_${file.name}`)
    
    // Create upload task with uploadBytesResumable
    const uploadTask = uploadBytesResumable(storageRef, file)
    
    // Return a promise that resolves with the download URL
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Handle progress
          if (onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            onProgress(progress)
          }
        },
        (error) => {
          // Handle error
          console.error("Error uploading avatar:", error)
          reject(error)
        },
        async () => {
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            
            // Update user profile with new avatar
            await updateUserProfile(phoneNumber, {
              avatar: downloadURL,
              updatedAt: serverTimestamp()
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
    console.error("Error starting upload:", error)
    throw error
  }
}
