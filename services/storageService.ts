import { Photo, PrivacyLevel } from '../types';

const DB_NAME = 'LensStoryDB';
const STORE_NAME = 'photos';
const DB_VERSION = 1;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const savePhotoToDB = async (photo: Photo) => {
  try {
    const db = await initDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      
      // Clone the object and remove the ephemeral URL before saving
      // We rely on the 'file' property (File/Blob) which is storable in IndexedDB
      const { url, ...photoData } = photo;
      
      const request = store.put(photoData);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Error saving to DB", err);
  }
};

export const getPhotosFromDB = async (): Promise<Photo[]> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const storedPhotos = request.result;
        // Rehydrate URLs from the stored Files/Blobs
        const photos = storedPhotos.map((p: any) => ({
          ...p,
          url: URL.createObjectURL(p.file),
          // Backwards compatibility for old photos without privacy field
          privacy: p.privacy || 'private'
        }));
        // Sort by timestamp desc (newest first)
        photos.sort((a: Photo, b: Photo) => b.timestamp - a.timestamp);
        resolve(photos);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Error loading from DB", err);
    return [];
  }
};

export const deletePhotoFromDB = async (id: string) => {
  try {
    const db = await initDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error("Error deleting from DB", err);
  }
};

export const updatePhotoPrivacy = async (id: string, privacy: PrivacyLevel) => {
    try {
      const db = await initDB();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        
        const getRequest = store.get(id);
        
        getRequest.onsuccess = () => {
            const data = getRequest.result;
            if (data) {
                data.privacy = privacy;
                store.put(data);
                resolve();
            } else {
                reject(new Error("Photo not found"));
            }
        };
        getRequest.onerror = () => reject(getRequest.error);
      });
    } catch (err) {
      console.error("Error updating privacy", err);
    }
  };