import React from 'react';
import { Photo } from '../types';
import { Sparkles, Trash2, Maximize2, Download, Globe, Lock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PhotoCardProps {
  photo: Photo;
  onDelete: (id: string) => void;
  onClick: (photo: Photo) => void;
  onTogglePrivacy: (id: string) => void;
  showPrivacyControls?: boolean;
}

const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onDelete, onClick, onTogglePrivacy, showPrivacyControls = true }) => {
  const { t } = useLanguage();

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = photo.url;
    // Use the title for filename if available, otherwise default ID
    const safeTitle = photo.analysis?.title ? photo.analysis.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'image';
    link.download = `lens-story-${safeTitle}-${photo.id.substr(0,4)}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrivacyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTogglePrivacy(photo.id);
  };

  return (
    <div 
      className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Image Container */}
      <div 
        className="relative aspect-[3/4] overflow-hidden cursor-pointer"
        onClick={() => onClick(photo)}
      >
        <img
          src={photo.url}
          alt={photo.analysis?.title || "Uploaded content"}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Privacy Indicator (Always visible on hover or if private) */}
        {showPrivacyControls && (
            <div className={`absolute top-2 left-2 transition-all duration-300 ${photo.privacy === 'private' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                <button
                    onClick={handlePrivacyClick}
                    className={`p-1.5 backdrop-blur-md rounded-full flex items-center gap-1.5 px-2.5 text-xs font-medium transition-colors ${
                        photo.privacy === 'public' 
                        ? 'bg-indigo-600/90 text-white hover:bg-indigo-700' 
                        : 'bg-slate-800/90 text-white hover:bg-slate-900'
                    }`}
                    title={photo.privacy === 'public' ? t.setPrivate : t.setPublic}
                >
                    {photo.privacy === 'public' ? <Globe size={12} /> : <Lock size={12} />}
                    <span>{photo.privacy === 'public' ? t.public : t.private}</span>
                </button>
            </div>
        )}
        
        {/* Hover Actions */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleDownload}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            title={t.download}
          >
            <Download size={16} />
          </button>
          {showPrivacyControls && (
            <button
                onClick={(e) => {
                e.stopPropagation();
                onDelete(photo.id);
                }}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 transition-colors"
                title={t.delete}
            >
                <Trash2 size={16} />
            </button>
          )}
        </div>
        
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
             <div className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
                <Maximize2 size={16} />
             </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4">
        {photo.isAnalyzing ? (
          <div className="flex items-center space-x-2 text-indigo-600 animate-pulse">
            <Sparkles size={16} className="animate-spin" />
            <span className="text-xs font-semibold uppercase tracking-wider">{t.analyzing}</span>
          </div>
        ) : photo.error ? (
           <p className="text-xs text-red-400">{t.analysisFailed}</p>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-start">
                <h3 className="font-bold text-slate-800 line-clamp-1">{photo.analysis?.title}</h3>
                {photo.analysis?.mood && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
                        {photo.analysis.mood}
                    </span>
                )}
            </div>
            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {photo.analysis?.description}
            </p>
            {photo.analysis?.tags && (
              <div className="flex flex-wrap gap-1 pt-1">
                {photo.analysis.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="text-xs text-indigo-500 font-medium">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoCard;