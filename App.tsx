import React, { useState, useCallback, useEffect } from 'react';
import { Photo, ViewMode, PrivacyLevel } from './types';
import { analyzeImageWithGemini } from './services/geminiService';
import { savePhoto, getPhotos, deletePhoto, updatePrivacy, isCloudMode } from './services/photoService';
import UploadZone from './components/UploadZone';
import PhotoCard from './components/PhotoCard';
import PhotoModal from './components/PhotoModal';
import { LayoutGrid, Grid, Camera, Globe, Lock, Users, ShieldCheck, Cloud } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';

// Use a simple ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

type Tab = 'my_gallery' | 'community';

const App: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.GRID);
  const [activeTab, setActiveTab] = useState<Tab>('community');
  
  const { language, setLanguage, t } = useLanguage();

  // Load photos from DB on mount
  useEffect(() => {
    const loadPhotos = async () => {
      const storedPhotos = await getPhotos();
      setPhotos(storedPhotos);
    };
    loadPhotos();
  }, []);

  const processFile = useCallback(async (photoId: string, file: File) => {
    try {
      const analysis = await analyzeImageWithGemini(file, language);
      
      setPhotos(prev => {
        const updatedPhotos = prev.map(p => {
          if (p.id === photoId) {
            const updatedPhoto = { ...p, analysis, isAnalyzing: false };
            savePhoto(updatedPhoto); // Update DB with analysis
            return updatedPhoto;
          }
          return p;
        });
        return updatedPhotos;
      });
    } catch (error) {
      console.error("Failed to analyze photo", error);
      setPhotos(prev => {
        const updatedPhotos = prev.map(p => {
          if (p.id === photoId) {
            const updatedPhoto = { ...p, isAnalyzing: false, error: "Analysis failed" };
            savePhoto(updatedPhoto);
            return updatedPhoto;
          }
          return p;
        });
        return updatedPhotos;
      });
    }
  }, [language]);

  const handleFilesSelected = async (files: File[], privacy: PrivacyLevel) => {
    // If uploading, switch to "My Gallery" so user sees their upload
    setActiveTab('my_gallery');

    const newPhotos: Photo[] = files.map(file => ({
      id: generateId(),
      url: URL.createObjectURL(file),
      file, // Keep file for upload
      timestamp: Date.now(),
      isAnalyzing: true,
      privacy: privacy
    }));

    // Optimistic UI update
    setPhotos(prev => [...newPhotos, ...prev]);

    // Process uploads
    for (const photo of newPhotos) {
        if (photo.file) {
            // Upload to storage (Local or Cloud)
            await savePhoto(photo); 
            // Start analysis
            processFile(photo.id, photo.file);
        }
    }
  };

  const handleDelete = async (id: string) => {
    const photo = photos.find(p => p.id === id);
    if (photo) {
        await deletePhoto(id, photo.url);
        setPhotos(prev => prev.filter(p => p.id !== id));
        if (selectedPhoto?.id === id) setSelectedPhoto(null);
    }
  };

  const handleTogglePrivacy = async (id: string) => {
     const photo = photos.find(p => p.id === id);
     if (photo) {
        const newPrivacy = photo.privacy === 'public' ? 'private' : 'public';
        await updatePrivacy(id, newPrivacy);
        setPhotos(prev => prev.map(p => p.id === id ? { ...p, privacy: newPrivacy } : p));
     }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  // Filter photos based on active tab
  const displayedPhotos = activeTab === 'community' 
    ? photos.filter(p => p.privacy === 'public')
    : photos;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('community')}>
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2 rounded-lg text-white shadow-md">
              <Camera size={20} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 hidden sm:block">
              {t.appName}
            </h1>
          </div>

          {/* Tab Navigation (Center) */}
          <div className="flex bg-slate-100 p-1 rounded-full absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
             <button 
                onClick={() => setActiveTab('community')}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeTab === 'community' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
             >
                <Users size={16} />
                <span className="hidden sm:inline">{t.tabCommunity}</span>
             </button>
             <button 
                onClick={() => setActiveTab('my_gallery')}
                className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeTab === 'my_gallery' 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
             >
                <Lock size={16} />
                <span className="hidden sm:inline">{t.tabMyGallery}</span>
             </button>
          </div>
          
          <div className="flex items-center space-x-3">
             {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors"
            >
              <Globe size={14} />
              <span>{language === 'en' ? 'EN' : '中文'}</span>
            </button>

            <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1 hidden md:flex">
              <button 
                onClick={() => setViewMode(ViewMode.GRID)}
                className={`p-1.5 rounded-md transition-colors ${viewMode === ViewMode.GRID ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title={t.largeGrid}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode(ViewMode.MASONRY)}
                className={`p-1.5 rounded-md transition-colors ${viewMode === ViewMode.MASONRY ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                title={t.compactGrid}
              >
                <Grid size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 w-full">
        
        {/* Upload Section */}
        {activeTab === 'my_gallery' && (
             <section className="max-w-3xl mx-auto animate-[fadeIn_0.5s_ease-out]">
                <UploadZone onFilesSelected={handleFilesSelected} />
            </section>
        )}

        {/* Gallery Section */}
        <section className="animate-[fadeIn_0.5s_ease-out]">
           {/* Section Title */}
           <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                    {activeTab === 'community' ? t.tabCommunity : t.tabMyGallery}
                </h2>
                <span className="text-sm text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">
                    {displayedPhotos.length} photos
                </span>
           </div>

          {displayedPhotos.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  {activeTab === 'community' ? <Globe size={32} /> : <Camera size={32} />}
              </div>
              <p className="text-xl text-slate-500 font-medium">
                  {activeTab === 'community' ? t.communityEmptyTitle : t.emptyGalleryTitle}
              </p>
              <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                  {activeTab === 'community' ? t.communityEmptyDesc : t.emptyGalleryDesc}
              </p>
              {activeTab === 'community' && (
                  <button 
                    onClick={() => setActiveTab('my_gallery')} 
                    className="mt-6 text-indigo-600 font-medium hover:underline"
                  >
                      {language === 'zh' ? '前往我的相册分享照片' : 'Go to My Gallery to share photos'}
                  </button>
              )}
            </div>
          ) : (
            <div className={`
              grid gap-6
              ${viewMode === ViewMode.GRID 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
              }
            `}>
              {displayedPhotos.map(photo => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  onDelete={handleDelete}
                  onClick={setSelectedPhoto}
                  onTogglePrivacy={handleTogglePrivacy}
                  showPrivacyControls={activeTab === 'my_gallery'} // Only show privacy toggle in My Gallery
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-200 mt-auto bg-white">
        <div className="flex flex-col items-center gap-2">
            <p className="flex items-center justify-center gap-2">
                <span>© {new Date().getFullYear()} {t.footer}</span>
            </p>
            <p className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full ${isCloudMode() ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                {isCloudMode() ? <Cloud size={12} /> : <ShieldCheck size={12} />}
                {isCloudMode() ? t.cloudEnabled : t.simulatedServer}
            </p>
        </div>
      </footer>

      {/* Modal */}
      <PhotoModal 
        photo={selectedPhoto} 
        onClose={() => setSelectedPhoto(null)} 
      />
    </div>
  );
};

export default App;