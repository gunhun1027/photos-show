import React, { useEffect } from 'react';
import { Photo } from '../types';
import { X, Calendar, Tag, Sparkles, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PhotoModalProps {
  photo: Photo | null;
  onClose: () => void;
}

const PhotoModal: React.FC<PhotoModalProps> = ({ photo, onClose }) => {
  const { t } = useLanguage();

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!photo) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photo.url;
    const safeTitle = photo.analysis?.title ? photo.analysis.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'image';
    link.download = `lens-story-${safeTitle}-${photo.id.substr(0,4)}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/90 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col md:flex-row animate-[fadeIn_0.3s_ease-out]">
        
        {/* Close Button Mobile */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white md:hidden"
        >
          <X size={20} />
        </button>

        {/* Image Section */}
        <div className="flex-1 bg-black flex items-center justify-center min-h-[300px] md:min-h-full">
          <img 
            src={photo.url} 
            alt={photo.analysis?.title || 'Detail view'} 
            className="max-h-[85vh] max-w-full object-contain"
          />
        </div>

        {/* Details Section */}
        <div className="w-full md:w-[400px] bg-white p-6 md:p-8 overflow-y-auto flex flex-col">
           <div className="hidden md:flex justify-end mb-4 gap-2">
             <button
               onClick={handleDownload}
               className="p-2 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-full transition-colors"
               title={t.download}
             >
               <Download size={24} />
             </button>
             <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition-colors"
             >
               <X size={24} />
             </button>
           </div>

           <div className="flex-1">
             {photo.isAnalyzing ? (
                <div className="flex flex-col items-center justify-center h-40 space-y-4 text-slate-400">
                    <Sparkles className="w-8 h-8 animate-spin text-indigo-500" />
                    <p className="text-sm font-medium">{t.geminiAnalyzing}</p>
                </div>
             ) : (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">
                            {photo.analysis?.title || t.untitled}
                        </h2>
                        <div className="flex items-center text-sm text-slate-500 space-x-2">
                            <Calendar size={14} />
                            <span>{new Date(photo.timestamp).toLocaleDateString()}</span>
                            {photo.analysis?.mood && (
                                <>
                                    <span>•</span>
                                    <span className="font-medium text-indigo-600">{photo.analysis.mood}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="prose prose-slate">
                        <p className="text-slate-600 leading-relaxed text-lg">
                            {photo.analysis?.description || t.noDescription}
                        </p>
                    </div>

                    {photo.analysis?.tags && (
                        <div className="border-t border-slate-100 pt-6">
                            <div className="flex items-center gap-2 mb-3 text-slate-400">
                                <Tag size={16} />
                                <span className="text-sm font-medium uppercase tracking-wider">{t.tags}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {photo.analysis.tags.map((tag, i) => (
                                    <span 
                                        key={i} 
                                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-sm transition-colors cursor-default"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Mobile Download Button */}
                    <div className="md:hidden pt-6">
                        <button
                          onClick={handleDownload}
                          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 active:bg-indigo-700"
                        >
                          <Download size={18} />
                          {t.download}
                        </button>
                    </div>
                </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoModal;
