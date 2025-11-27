import { createClient } from '@supabase/supabase-js';
import { Photo, PrivacyLevel } from '../types';
import { SUPABASE_URL, SUPABASE_KEY } from '../config';

// Initialize client only if keys are present
const supabase = (SUPABASE_URL && SUPABASE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

export const uploadPhotoToCloud = async (photo: Photo): Promise<Photo | null> => {
  if (!supabase || !photo.file) return null;

  try {
    const fileExt = photo.file.name.split('.').pop();
    const fileName = `${photo.id}.${fileExt}`;
    const filePath = `${fileName}`;

    // 1. Upload Image to Storage Bucket 'photos'
    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, photo.file);

    if (uploadError) throw uploadError;

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);

    // 3. Insert Metadata into Database Table 'photos'
    const { error: dbError } = await supabase
      .from('photos')
      .insert([
        {
          id: photo.id,
          url: publicUrl,
          timestamp: photo.timestamp,
          privacy: photo.privacy,
          // We will update analysis later
          title: photo.analysis?.title || '',
          description: photo.analysis?.description || '',
          mood: photo.analysis?.mood || '',
          tags: photo.analysis?.tags || []
        }
      ]);

    if (dbError) throw dbError;

    return { ...photo, url: publicUrl, file: undefined }; // Return photo without File object (cloud version)
  } catch (error) {
    console.error("Supabase Upload Error:", error);
    throw error;
  }
};

export const updatePhotoInCloud = async (photo: Photo) => {
  if (!supabase) return;
  
  // Mainly used to update AI analysis results
  const { error } = await supabase
    .from('photos')
    .update({
      title: photo.analysis?.title,
      description: photo.analysis?.description,
      mood: photo.analysis?.mood,
      tags: photo.analysis?.tags
    })
    .eq('id', photo.id);

  if (error) console.error("Update Cloud Error:", error);
};

export const updateCloudPrivacy = async (id: string, privacy: PrivacyLevel) => {
    if (!supabase) return;
    const { error } = await supabase
        .from('photos')
        .update({ privacy })
        .eq('id', id);
    if (error) throw error;
};

export const getPhotosFromCloud = async (): Promise<Photo[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error("Fetch Cloud Error:", error);
    return [];
  }

  return data.map((row: any) => ({
    id: row.id,
    url: row.url,
    timestamp: row.timestamp,
    privacy: row.privacy,
    isAnalyzing: false, // Assumed processed if fetched from DB
    analysis: row.title ? {
      title: row.title,
      description: row.description,
      mood: row.mood,
      tags: row.tags || []
    } : undefined
  }));
};

export const deletePhotoFromCloud = async (id: string, url: string) => {
  if (!supabase) return;

  try {
    // 1. Delete from DB
    const { error: dbError } = await supabase
      .from('photos')
      .delete()
      .eq('id', id);
    
    if (dbError) throw dbError;

    // 2. Delete from Storage
    // Extract filename from URL or reconstruct it if we followed strict naming
    // Assuming we can't easily guess the extension from just ID without storing it, 
    // but for this demo let's try to parse the URL or just skip strict storage cleanup if complex.
    // A better way is to store 'storage_path' in DB.
    // For now, let's just delete the DB record which hides it from the app.
    
    // To properly delete file:
    const path = url.split('/').pop(); // simplistic extraction
    if (path) {
        await supabase.storage.from('photos').remove([path]);
    }

  } catch (error) {
    console.error("Delete Cloud Error:", error);
  }
};