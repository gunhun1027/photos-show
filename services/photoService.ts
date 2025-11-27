import { Photo, PrivacyLevel } from '../types';
import * as localStore from './storageService';
import * as cloudStore from './supabaseService';
import { isCloudEnabled } from '../config';

const useCloud = isCloudEnabled();

export const savePhoto = async (photo: Photo) => {
  if (useCloud) {
    if (photo.file) {
      // Initial upload
      return await cloudStore.uploadPhotoToCloud(photo);
    } else {
      // Update metadata (AI results)
      return await cloudStore.updatePhotoInCloud(photo);
    }
  } else {
    return await localStore.savePhotoToDB(photo);
  }
};

export const getPhotos = async (): Promise<Photo[]> => {
  if (useCloud) {
    return await cloudStore.getPhotosFromCloud();
  } else {
    return await localStore.getPhotosFromDB();
  }
};

export const deletePhoto = async (id: string, url: string) => {
  if (useCloud) {
    return await cloudStore.deletePhotoFromCloud(id, url);
  } else {
    return await localStore.deletePhotoFromDB(id);
  }
};

export const updatePrivacy = async (id: string, privacy: PrivacyLevel) => {
    if (useCloud) {
        return await cloudStore.updateCloudPrivacy(id, privacy);
    } else {
        return await localStore.updatePhotoPrivacy(id, privacy);
    }
};

export const isCloudMode = () => useCloud;