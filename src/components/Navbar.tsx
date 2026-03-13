import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sun, 
  Moon, 
  LogOut, 
  LogIn, 
  Settings, 
  ArrowLeft, 
  PlusCircle, 
  ChevronDown 
} from 'lucide-react';
import { UserIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'motion/react';
import { Language, translations } from '../translations';

const JOISST_PINK = '#d90168';

interface NavbarProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
];

export const Navbar = ({ isDarkMode, toggleTheme, language, setLanguage }: NavbarProps) => {
  const [isPwaActive, setIsPwaActive] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const t = translations[language];

  // Detect referrer for backlink logic
  const returnUrl = useMemo(() => {
    if (typeof document !== 'undefined' && document.referrer.includes('joisst.com')) {
      return document.referrer;
    }
    return 'https://joisst.com';
  }, []);

  // Listen for PWA install prompt
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setIsPwaActive(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 backdrop-blur-xl bg-opacity-90 
      ${isDarkMode ? 'bg-slate-900/90 border-b border-slate-800' : 'bg-white/90 border-b border-slate-100'}
      ${isPwaActive ? 'h-24 sm:h-40' : 'h-16 sm:h-28'}`}
    >
      <div className="max-w-7xl mx-auto h-full px-2 sm:px-6 flex flex-col justify-center">
        <div className="flex items-center justify-between">
          
          {/* Left Cluster: Identity & Context */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Identity Box (Logo) */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 cursor-pointer overflow-hidden"
            >
              <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <rect width="256" height="256" rx="48" fill="#d90168"/>
                <path d="m136.57 197.62c0 7.11-1.53 13.23-4.7 18.26a34.47 34.47 0 0 1 -11.81 11.7 28.57 28.57 0 0 1 -14.87 4.16 7.75 7.75 0 0 1 -5.8-2.3 7.89 7.89 0 0 1 -2.19-5.44v-1.42a6.29 6.29 0 0 1 2.08-5 12 12 0 0 1 5.25-2.73 23.87 23.87 0 0 0 8.2-3.94 18.62 18.62 0 0 0 5.27-6.91 24.16 24.16 0 0 0 1.86-10.17v-103.49a8.51 8.51 0 0 1 2.41-6.13 8.17 8.17 0 0 1 6-2.51 8.07 8.07 0 0 1 6.13 2.51 8.7 8.7 0 0 1 2.29 6.13v107.28zm-8.64-131.45c-3.5 0-6.12-.66-7.76-2.08a8.16 8.16 0 0 1 -2.52-6.45v-3c0-3 .88-5.14 2.74-6.45 1.86-1.53 4.37-2.19 7.76-2.19s5.91.66 7.55 2.08 2.51 3.61 2.51 6.45v3c0 2.95-.87 5.14-2.62 6.45-1.75 1.53-4.27 2.19-7.66 2.19z" fill="#fff"/>
              </svg>
            </motion.div>

            {/* Platform Backlink */}
            <div className="hidden md:flex flex-col">
              <a 
                href={returnUrl}
                className="flex items-center gap-3 group"
              >
                <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl border flex items-center justify-center transition-all duration-200 group-hover:border-[#d90168]
                  ${isDarkMode ? 'border-slate-700 bg-slate-400/10' : 'border-slate-200 bg-slate-400/5'}`}>
                  <ArrowLeft className="w-5 h-5 sm:w-7 sm:h-7 text-slate-500 transition-all duration-200 group-hover:text-[#d90168]" />
                </div>
                <div className="flex flex-col">
                  <span className={`font-black text-sm uppercase tracking-[0.15em] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {t.backToPlatform}
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* Right Cluster: Global Utilities */}
          <div className="flex items-center gap-1 sm:gap-3">
            
            {/* Currency: Hearts */}
            <div className={`hidden sm:flex items-center h-10 sm:h-14 px-5 rounded-xl border transition-all duration-200 hover:border-[#d90168] cursor-pointer
              ${isDarkMode ? 'border-slate-700 bg-slate-400/10' : 'border-slate-200 bg-slate-400/5'}`}>
              <span className="font-black uppercase tracking-tighter text-[#F43E5D] mr-2 text-sm sm:text-base">1,240</span>
              <div className="w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-[#F43E5D]">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.5 3c1.557 0 3.046.716 4 1.954C12.454 3.716 13.943 3 15.5 3c2.786 0 5.25 2.322 5.25 5.25 0 3.924-2.438 7.11-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              </div>
            </div>

            {/* Currency: Brains */}
            <div className={`hidden sm:flex items-center h-10 sm:h-14 px-5 rounded-xl border transition-all duration-200 hover:border-[#d90168] cursor-pointer
              ${isDarkMode ? 'border-slate-700 bg-slate-400/10' : 'border-slate-200 bg-slate-400/5'}`}>
              <span className="font-black uppercase tracking-tighter text-[#7C3AED] mr-2 text-sm sm:text-base">42</span>
              <div className="w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center">
                <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path d="m491.9 288.1c48.1-57 2.4-117.4-63.7-177.5-7.8 27.4-29.8 48.4-57.5 55-5.2-.1-9.4-4.3-9.4-9.6 0-4.1 2.7-7.7 6.6-8.9 23.1-7 40.2-26.4 44.3-50.1-25.6-22-55.3-38.6-87.4-49.1-27.7 24.3-58.2 61.8-31.9 113.3 2.4 4.6.7 10.3-4 12.8-4.5 2.4-10.1.7-12.6-3.7-28.9-56.1-2.7-97 26.8-128.2-60.8-11.6-123.8-1.4-177.9 28.7 22.4 1.2 43.5 11.1 58.8 27.5 3.8 3.6 3.9 9.6.2 13.4-3.6 3.8-9.6 3.9-13.4.2 0 0-.1-.1-.1-.1-37.7-40.2-94.2-20.6-117.1 24.2-30.5 54.7-5.9 84.6 33.9 91.8 5.2.7 8.8 5.5 8 10.7-.7 5.1-5.5 8.7-10.6 8-1.7-.2-41.6-6.1-57.6-37.4-1.4-2.7-2.6-5.5-3.5-8.4-33.4 42.3-31.2 75.3 5.5 113.8 10.2 11.4 25.8 16.3 40.6 12.6 29.8-7.5 70.1-24.2 78.4-45.7 7.6-18.9-8.8-20.8 3.6-31.5 16.2-7.3 21.3 20.4 14.2 38.1-6.5 18.3-31.7 36-53.9 44.6 5.1 16.1 15.9 29.7 30.3 38.5 30 18.6 70.1 14.8 87.1 10.2 4.6-1.3 9.6-.2 13.3 2.9 11.3 9.7 24.7 16.5 39.2 19.9 6.2 1.1 11.7 4.5 15.4 9.6l39.5 56.7c1.8 2.5 4.7 4.1 7.8 4.1h33.1c5.2 0 9.5-4.2 9.5-9.5v-38.6c79.3-18.8 131.1-56.1 102.8-127.2-1.8-3.7-1.1-8.1 1.7-11.1zm-91.9-64.5 38.6-8.8c5.1-1.1 10.2 2.2 11.2 7.3 1.1 5-2 9.9-7 11.2l-38.6 8.8c-.7.2-1.4.2-2.1.2-5.2-.1-9.4-4.3-9.4-9.6.1-4.4 3.1-8.1 7.3-9.1zm-73.5 49.4c10-18.4 19.8-58.1-10-70.6-4.7-2.3-6.7-8-4.4-12.7 11.8-17.8 39.8 16.5 41.2 28.4 6.7 23.3-3.1 49.5-9.6 62.8 21.3 14.7 36.8 36.2 44.2 60.9 1.8 4.9-.8 10.4-5.7 12.2s-10.4-.8-12.2-5.7v-.1c-24.7-74.3-84.8-67.3-122.4-44.7-4.5 2.7-10.3 1.3-13.1-3.2-2.6-4.3-1.3-10 2.8-12.8 2-1.1 45.9-28.6 89.2-14.5zm-169.6-75.4c-9.5-1-39.1-.9-34.7-17.5 1.7-4.9 7.1-7.5 12-5.8 24.3 11.3 53.1.7 64.4-23.6 1.1-2.5 2.1-5 2.8-7.7 1.7-5 7.1-7.7 12-6 4.8 1.6 7.5 6.6 6.2 11.5-3.4 10.1-8.8 19.4-15.7 27.5 2.1 9.2 7.1 17.4 14.3 23.4 8.3 5.6 18.5 7.6 28.2 5.3 5.2-.8 10 2.7 10.9 7.8.8 5.2-2.7 10-7.9 10.9-26.1 5.4-52.3-9.2-61.2-34.4-9.3 5.8-20.2 8.8-31.3 8.6z" fill="#7C3AED"/>
                </svg>
              </div>
            </div>

            {/* Theme Toggle */}
            <div 
              onClick={toggleTheme}
              className={`hidden sm:flex w-10 h-10 sm:w-14 sm:h-14 rounded-xl border items-center justify-center transition-all duration-200 hover:border-[#d90168] group cursor-pointer
                ${isDarkMode ? 'border-slate-700 bg-slate-400/10' : 'border-slate-200 bg-slate-400/5'}`}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 sm:w-7 sm:h-7 text-slate-500 transition-all duration-200 group-hover:text-[#d90168]" />
              ) : (
                <Moon className="w-5 h-5 sm:w-7 sm:h-7 text-slate-500 transition-all duration-200 group-hover:text-[#d90168]" />
              )}
            </div>

            {/* Language Selector */}
            <div className="relative">
              <div 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className={`flex items-center h-10 sm:h-14 px-2 sm:px-3 rounded-xl border transition-all duration-200 hover:border-[#d90168] group cursor-pointer
                  ${isDarkMode ? 'border-slate-700 bg-slate-400/10' : 'border-slate-200 bg-slate-400/5'}`}
              >
                <div className="w-6 h-4 sm:w-8 sm:h-6 rounded-sm overflow-hidden mr-2 shrink-0 flex items-center justify-center text-lg">
                  {currentLang.flag}
                </div>
                <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-500 transition-all duration-200 group-hover:text-[#d90168] ${isLangMenuOpen ? 'rotate-180' : ''}`} />
              </div>

              <AnimatePresence>
                {isLangMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`absolute top-full right-0 mt-2 w-48 rounded-2xl shadow-xl border overflow-hidden
                      ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as Language);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all
                          ${language === lang.code ? 'text-[#d90168]' : isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Settings (Admin) */}
            <div className={`hidden sm:flex w-10 h-10 sm:w-14 sm:h-14 rounded-xl border items-center justify-center transition-all duration-200 hover:border-[#d90168] group cursor-pointer
              ${isDarkMode ? 'border-slate-700 bg-slate-400/10' : 'border-slate-200 bg-slate-400/5'}`}>
              <Settings className="w-5 h-5 sm:w-7 sm:h-7 text-slate-500 transition-all duration-200 group-hover:text-[#d90168]" />
            </div>

            {/* Auth Toggle */}
            <div 
              onClick={() => setIsLoggedIn(!isLoggedIn)}
              className={`hidden sm:flex w-10 h-10 sm:w-14 sm:h-14 rounded-xl border items-center justify-center transition-all duration-200 hover:border-[#d90168] group cursor-pointer
                ${isDarkMode ? 'border-slate-700 bg-slate-400/10' : 'border-slate-200 bg-slate-400/5'}`}
            >
              {isLoggedIn ? (
                <LogOut className="w-5 h-5 sm:w-7 sm:h-7 text-slate-500 transition-all duration-200 group-hover:text-[#d90168]" />
              ) : (
                <LogIn className="w-5 h-5 sm:w-7 sm:h-7 text-slate-500 transition-all duration-200 group-hover:text-[#d90168]" />
              )}
            </div>

            {/* Profile Icon (The Identity Circle) */}
            <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full border flex items-center justify-center transition-all duration-200 hover:border-[#d90168] group cursor-pointer overflow-hidden
              ${isDarkMode ? 'border-slate-700 bg-slate-400/10' : 'border-slate-200 bg-slate-400/5'}`}>
              <UserIcon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-500 transition-all duration-200 group-hover:text-[#d90168]" />
            </div>
          </div>
        </div>

        {/* Row 2: PWA Install Prompt */}
        <AnimatePresence>
          {isPwaActive && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-center mt-3 sm:mt-5"
            >
              <button className={`flex items-center gap-2 px-6 py-2 rounded-full shadow-lg shadow-black/5 border transition-all hover:scale-105
                ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white/90 border-slate-100'}`}>
                <PlusCircle className="w-4 h-4 text-[#d90168]" />
                <span className={`text-[11px] sm:text-[13px] font-black uppercase tracking-[0.25em] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {t.installApp}
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};
