import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Globe, Lock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { PrivacyLevel } from '../types';

interface UploadZoneProps {
  onFilesSelected: (files: File[], privacy: PrivacyLevel) => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [privacy, setPrivacy] = useState<PrivacyLevel>('public');
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = (Array.from(e.dataTransfer.files) as File[]).filter(file => 
        file.type.startsWith('image/')
      );
      if (validFiles.length > 0) {
        onFilesSelected(validFiles, privacy);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = (Array.from(e.target.files) as File[]).filter(file => 
        file.type.startsWith('image/')
      );
      if (validFiles.length > 0) {
        onFilesSelected(validFiles, privacy);
      }
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const togglePrivacy = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPrivacy(prev => prev === 'public' ? 'private' : 'public');
  };

  return (
    <div className="space-y-4">
       {/* Privacy Selector */}
       <div className="flex justify-center">
            <div className="bg-white p-1 rounded-full border border-slate-200 inline-flex shadow-sm">
                <button
                    onClick={() => setPrivacy('public')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        privacy === 'public' 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <Globe size={16} />
                    <span>{t.public}</span>
                </button>
                <button
                    onClick={() => setPrivacy('private')}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        privacy === 'private' 
                        ? 'bg-slate-700 text-white shadow-md' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    <Lock size={16} />
                    <span>{t.private}</span>
                </button>
            </div>
       </div>

        <div
            onClick={() => inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
                relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed
                transition-all duration-300 ease-in-out
                ${isDragging 
                ? 'border-indigo-500 bg-indigo-50 scale-[1.02]' 
                : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
                }
                h-48 md:h-64 flex flex-col items-center justify-center text-center p-6
            `}
        >
        <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
        />
        
        <div className={`
            mb-4 p-4 rounded-full bg-slate-100 text-slate-400
            group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors
        `}>
            {isDragging ? (
            <Upload className="w-8 h-8 animate-bounce" />
            ) : (
            <ImageIcon className="w-8 h-8" />
            )}
        </div>
        
        <h3 className="text-lg font-semibold text-slate-700 mb-1">
            {isDragging ? t.dropTitle : t.uploadTitle}
        </h3>
        <p className="text-sm text-slate-500 max-w-xs mx-auto mb-2">
            {t.uploadDesc}
        </p>
        <div className="flex items-center gap-1.5 justify-center text-xs font-medium text-slate-400 bg-slate-100 py-1 px-3 rounded-full">
            {privacy === 'public' ? <Globe size={12} className="text-indigo-500" /> : <Lock size={12} className="text-slate-600" />}
            <span>
                {privacy === 'public' ? t.privacyPublicDesc : t.privacyPrivateDesc}
            </span>
        </div>
        </div>
    </div>
  );
};

export default UploadZone;