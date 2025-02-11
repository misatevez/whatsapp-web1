import { db, storage } from "../firebase"
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"
import type { AdminStatus } from "@/types/interfaces"

export async function fetchAdminStatuses(): Promise<AdminStatus[]> {
  console.log("fetchAdminStatuses called")
  const statusesRef = collection(db, "adminStatuses")
  try {
    const querySnapshot = await getDocs(statusesRef)
    const statuses = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AdminStatus[]
    console.log("fetchAdminStatuses successful:", statuses)
    return statuses
  } catch (error) {
    console.error("Error in fetchAdminStatuses:", error)
    throw error
  }
}

export async function addAdminStatus(status: Omit<AdminStatus, "id">): Promise<string> {
  console.log("addAdminStatus called with:", status)
  const statusesRef = collection(db, "adminStatuses")
  try {
    const docRef = await addDoc(statusesRef, {
      ...status,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    console.log("addAdminStatus successful, new ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error in addAdminStatus:", error)
    throw error
  }
}

export async function updateAdminStatus(statusId: string, updates: Partial<AdminStatus>): Promise<void> {
  console.log("updateAdminStatus called with:", { statusId, updates })
  const statusRef = doc(db, "adminStatuses", statusId)
  try {
    await updateDoc(statusRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
    console.log("updateAdminStatus successful")
  } catch (error) {
    console.error("Error in updateAdminStatus:", error)
    throw error
  }
}

export async function deleteAdminStatus(statusId: string): Promise<void> {
  console.log("deleteAdminStatus called with:", statusId)
  const statusRef = doc(db, "adminStatuses", statusId)
  try {
    await deleteDoc(statusRef)
    console.log("deleteAdminStatus successful")
  } catch (error) {
    console.error("Error in deleteAdminStatus:", error)
    throw error
  }
}

export async function uploadStatusImage(file: File, onProgress?: (progress: number) => void): Promise<string> {
  console.log("uploadStatusImage called with file:", file.name)
  
  // Create a unique filename using timestamp and original name
  const filename = `adminStatuses/${Date.now()}_${file.name}`
  const storageRef = ref(storage, filename)
  
  try {
    // Create upload task with uploadBytesResumable
    const uploadTask = uploadBytesResumable(storageRef, file)
    
    // Return a promise that resolves with the download URL
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Handle progress updates
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          console.log("Upload progress:", progress)
          if (onProgress) {
            onProgress(progress)
          }
        },
        (error) => {
          // Handle errors
          console.error("Error during upload:", error)
          reject(error)
        },
        async () => {
          try {
            // Get download URL when upload completes
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            console.log("Upload successful, URL:", downloadURL)
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

export async function deleteStatusImage(imageUrl: string): Promise<void> {
  console.log("deleteStatusImage called with:", imageUrl)
  
  try {
    // Extract the path from the URL
    const decodedUrl = decodeURIComponent(imageUrl)
    const path = decodedUrl.split('/o/')[1]?.split('?')[0]
    
    if (!path) {
      throw new Error("Invalid image URL")
    }
    
    const imageRef = ref(storage, path)
    await deleteObject(imageRef)
    console.log("deleteStatusImage successful")
  } catch (error) {
    console.error("Error in deleteStatusImage:", error)
    throw error
  }
}