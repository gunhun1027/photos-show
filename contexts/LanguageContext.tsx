import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Language } from '../types';

interface Translations {
  appName: string;
  uploadTitle: string;
  dropTitle: string;
  uploadDesc: string;
  poweredBy: string;
  analyzing: string;
  analysisFailed: string;
  emptyGalleryTitle: string;
  emptyGalleryDesc: string;
  footer: string;
  untitled: string;
  noDescription: string;
  tags: string;
  geminiAnalyzing: string;
  delete: string;
  download: string;
  largeGrid: string;
  compactGrid: string;
  public: string;
  private: string;
  setPublic: string;
  setPrivate: string;
  tabMyGallery: string;
  tabCommunity: string;
  privacyPublicDesc: string;
  privacyPrivateDesc: string;
  communityEmptyTitle: string;
  communityEmptyDesc: string;
  simulatedServer: string;
  cloudEnabled: string;
}

const translations: Record<Language, Translations> = {
  en: {
    appName: "Lens & Story",
    uploadTitle: "Upload Photos",
    dropTitle: "Drop photos here",
    uploadDesc: "Drag & drop images here, or click to browse.",
    poweredBy: "Powered by Gemini AI for auto-captioning",
    analyzing: "Analyzing...",
    analysisFailed: "Analysis failed",
    emptyGalleryTitle: "Your gallery is empty.",
    emptyGalleryDesc: "Upload some photos to see the magic happen.",
    footer: "Lens & Story. Enhanced by Google Gemini.",
    untitled: "Untitled Moment",
    noDescription: "No description available.",
    tags: "Tags",
    geminiAnalyzing: "Gemini is analyzing this moment...",
    delete: "Delete",
    download: "Download",
    largeGrid: "Large Grid",
    compactGrid: "Compact Grid",
    public: "Public",
    private: "Private",
    setPublic: "Make Public",
    setPrivate: "Make Private",
    tabMyGallery: "My Gallery",
    tabCommunity: "Community",
    privacyPublicDesc: "Visible to everyone",
    privacyPrivateDesc: "Only visible to you",
    communityEmptyTitle: "No public photos yet",
    communityEmptyDesc: "Share your photos with the community by setting them to Public!",
    simulatedServer: "Local Mode: Photos saved in browser.",
    cloudEnabled: "Cloud Mode: Photos synced to server.",
  },
  zh: {
    appName: "镜头与故事",
    uploadTitle: "上传照片",
    dropTitle: "释放照片",
    uploadDesc: "将照片拖放到此处，或点击浏览。",
    poweredBy: "由 Gemini AI 提供智能配文",
    analyzing: "分析中...",
    analysisFailed: "分析失败",
    emptyGalleryTitle: "您的相册是空的。",
    emptyGalleryDesc: "上传一些照片，见证奇迹发生的时刻。",
    footer: "镜头与故事。由 Google Gemini 提供支持。",
    untitled: "无题瞬间",
    noDescription: "暂无描述。",
    tags: "标签",
    geminiAnalyzing: "Gemini 正在解读这个瞬间...",
    delete: "删除",
    download: "下载",
    largeGrid: "大图视图",
    compactGrid: "紧凑视图",
    public: "公开",
    private: "私密",
    setPublic: "设为公开",
    setPrivate: "设为私密",
    tabMyGallery: "我的相册",
    tabCommunity: "社区广场",
    privacyPublicDesc: "所有人可见",
    privacyPrivateDesc: "仅自己可见",
    communityEmptyTitle: "暂无公开照片",
    communityEmptyDesc: "将您的照片设为“公开”，与社区分享您的精彩瞬间！",
    simulatedServer: "本地模式：照片保存在浏览器中。",
    cloudEnabled: "云端模式：照片已同步至服务器。",
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh');

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};