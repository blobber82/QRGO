/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { Download, Type, Settings, RefreshCw, Mail, User, Info, Globe, FileText, FileCode, MapPin, ExternalLink, Image as ImageIcon, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './components/Logo';
import { Navbar } from './components/Navbar';
import { Language, translations } from './translations';

type ContentType = 'url' | 'text' | 'email' | 'contact' | 'location';

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('qrgo-language');
    return (saved as Language) || 'en';
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('qrgo-theme');
    return saved === 'dark';
  });
  const [contentType, setContentType] = useState<ContentType>('url');
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [user, setUser] = useState<any>(null);

  const t = translations[language];

  // Joisst Handshake
  useEffect(() => {
    const handshake = async () => {
      try {
        const res = await fetch('https://api.joisst.com/api/user', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          if (data.cookieConsent === false) {
            setShowCookieConsent(true);
          }
        }
      } catch (e) {
        console.error('Handshake failed', e);
      }
    };
    handshake();
  }, []);

  const acceptCookies = async () => {
    try {
      const res = await fetch('https://api.joisst.com/api/user?action=cookie_consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ consent: true })
      });
      if (res.ok) {
        setShowCookieConsent(false);
      }
    } catch (e) {
      console.error('Failed to accept cookies', e);
    }
  };

  // Save language preference
  useEffect(() => {
    localStorage.setItem('qrgo-language', language);
  }, [language]);

  // Save theme preference and apply dark mode class to html element
  useEffect(() => {
    localStorage.setItem('qrgo-theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  const [formData, setFormData] = useState({
    url: 'https://ai.studio/build',
    text: '',
    email: '',
    subject: '',
    message: '',
    firstName: '',
    lastName: '',
    phone: '',
    workPhone: '',
    org: '',
    position: '',
    website: '',
    address: '',
    latitude: '',
    longitude: '',
  });

  const [qrValue, setQrValue] = useState('');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState(256);
  const [includeMargin, setIncludeMargin] = useState(true);
  const [level, setLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [showInfo, setShowInfo] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(20);
  
  const qrCanvasRef = useRef<HTMLDivElement>(null);
  const qrSvgRef = useRef<HTMLDivElement>(null);

  // Update QR value whenever form data or content type changes
  useEffect(() => {
    let value = '';
    switch (contentType) {
      case 'url':
        value = formData.url;
        break;
      case 'text':
        value = formData.text;
        break;
      case 'email':
        // Use MATMSG format for better QR compatibility and readability (no %20 encoding)
        value = `MATMSG:TO:${formData.email};SUB:${formData.subject};BODY:${formData.message};;`;
        break;
      case 'contact':
        value = `BEGIN:VCARD\nVERSION:3.0\nN:${formData.lastName};${formData.firstName}\nFN:${formData.firstName} ${formData.lastName}\nORG:${formData.org}\nTITLE:${formData.position}\nTEL;TYPE=CELL:${formData.phone}\nTEL;TYPE=WORK:${formData.workPhone}\nURL:${formData.website}\nADR;TYPE=WORK:;;${formData.address}\nEND:VCARD`;
        break;
      case 'location':
        // Using Google Maps URL format for better compatibility and directions support
        if (formData.latitude && formData.longitude) {
          value = `https://www.google.com/maps/search/?api=1&query=${formData.latitude},${formData.longitude}`;
        }
        break;
    }
    setQrValue(value);
  }, [contentType, formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target?.result as string);
        // Force high error correction for logos
        if (level === 'L' || level === 'M') {
          setLevel('Q');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogo(null);
  };

  const imageSettings = logo ? {
    src: logo,
    height: (size * logoSize) / 100,
    width: (size * logoSize) / 100,
    excavate: true,
  } : undefined;

  const downloadPNG = () => {
    const canvas = qrCanvasRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `qrgo-${contentType}.png`;
      link.href = url;
      link.click();
    }
  };

  const downloadSVG = () => {
    const svg = qrSvgRef.current?.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.download = `qrgo-${contentType}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const resetSettings = () => {
    setFgColor('#000000');
    setBgColor('#ffffff');
    setSize(256);
    setIncludeMargin(true);
    setLevel('M');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Navbar 
        isDarkMode={isDarkMode} 
        toggleTheme={() => setIsDarkMode(!isDarkMode)} 
        language={language} 
        setLanguage={setLanguage} 
      />
      
      {/* Cookie Consent Banner */}
      <AnimatePresence>
        {showCookieConsent && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-6 right-6 z-[100] max-w-2xl mx-auto"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-black uppercase tracking-wider text-[#d90168] mb-2">{t.cookieTitle}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t.cookieContent}
                </p>
              </div>
              <button
                onClick={acceptCookies}
                className="whitespace-nowrap px-8 py-3 bg-[#d90168] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all shadow-lg shadow-pink-200 dark:shadow-none"
              >
                {t.cookieCool}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Header */}
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 shrink-0 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-2 flex items-center justify-center">
              <Logo />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-none">{t.appName}</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-lg">{t.tagline}</p>
            </div>
          </div>
          <button 
            onClick={resetSettings}
            className="p-3 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md rounded-xl transition-all text-slate-600 dark:text-slate-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            title={t.resetTitle}
          >
            <RefreshCw size={22} />
          </button>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Section */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Type Selector */}
            <div className="flex p-1 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl gap-1">
              {[
                { id: 'url', icon: Globe, label: t.url },
                { id: 'text', icon: FileText, label: t.text },
                { id: 'email', icon: Mail, label: t.email },
                { id: 'contact', icon: User, label: t.vCard },
                { id: 'location', icon: MapPin, label: t.location },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setContentType(type.id as ContentType)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-sm font-semibold transition-all ${
                    contentType === type.id 
                    ? 'bg-white dark:bg-slate-800 text-[#22C55E] shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <type.icon size={18} />
                  <span className="hidden sm:inline">{type.label}</span>
                </button>
              ))}
            </div>

            {/* Dynamic Form Card */}
            <motion.div 
              layout
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={contentType}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {contentType === 'url' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.websiteUrl}</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="url"
                          name="url"
                          value={formData.url}
                          onChange={handleInputChange}
                          placeholder={t.urlPlaceholder}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-[#22C55E] outline-none transition-all dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  {contentType === 'text' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.plainText}</label>
                      <textarea
                        name="text"
                        value={formData.text}
                        onChange={handleInputChange}
                        placeholder={t.typePlaceholder}
                        className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-[#22C55E] outline-none transition-all resize-none dark:text-white"
                      />
                    </div>
                  )}

                  {contentType === 'email' && (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.emailAddress}</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder={t.emailPlaceholder}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#22C55E] outline-none dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.subject}</label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder={t.subjectPlaceholder}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#22C55E] outline-none dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.message}</label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder={t.messagePlaceholder}
                          className="w-full h-24 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#22C55E] outline-none resize-none dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  {contentType === 'contact' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-1">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.firstName}</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#22C55E] outline-none dark:text-white"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.lastName}</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#22C55E] outline-none dark:text-white"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.mobilePhone}</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#22C55E] outline-none dark:text-white"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.workPhone}</label>
                        <input
                          type="tel"
                          name="workPhone"
                          value={formData.workPhone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#22C55E] outline-none dark:text-white"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.organization}</label>
                        <input
                          type="text"
                          name="org"
                          value={formData.org}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#22C55E] outline-none dark:text-white"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.position}</label>
                        <input
                          type="text"
                          name="position"
                          value={formData.position}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#22C55E] outline-none dark:text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.website}</label>
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#22C55E] outline-none dark:text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.address}</label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full h-20 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#22C55E] outline-none resize-none dark:text-white"
                        />
                      </div>
                    </div>
                  )}

                  {contentType === 'location' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-2xl p-4 mb-2">
                          <p className="text-xs text-green-700 dark:text-green-400 font-medium leading-relaxed">
                            {t.locationInfo}
                          </p>
                          <a 
                            href="https://www.google.com/maps" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[#22C55E] hover:text-green-800 dark:hover:text-green-300 transition-colors"
                          >
                            <ExternalLink size={14} />
                            {t.findOnMaps}
                          </a>
                        </div>
                      </div>

                      <div className="col-span-1">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.latitude}</label>
                        <input
                          type="text"
                          name="latitude"
                          value={formData.latitude}
                          onChange={handleInputChange}
                          placeholder={t.latPlaceholder}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#22C55E] outline-none dark:text-white"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.longitude}</label>
                        <input
                          type="text"
                          name="longitude"
                          value={formData.longitude}
                          onChange={handleInputChange}
                          placeholder={t.lngPlaceholder}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-[#22C55E] outline-none dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Customization Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
              <div className="flex items-center gap-2 mb-8">
                <Settings className="text-[#22C55E]" size={20} />
                <h3 className="font-bold text-slate-800 dark:text-white">{t.designQuality}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{t.colors}</label>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.foreground}</span>
                        <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.background}</span>
                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{t.logoImage}</label>
                    {!logo ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-[#22C55E] transition-all cursor-pointer group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-3 text-slate-400 group-hover:text-[#22C55E]" />
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.clickToUpload}</p>
                        </div>
                        <input type="file" className="hidden" accept=".svg" onChange={handleLogoUpload} />
                      </label>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
                              <img src={logo} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                            </div>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{t.logoActive}</span>
                          </div>
                          <button 
                            onClick={removeLogo}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <X size={18} />
                          </button>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.logoSize}</label>
                            <span className="text-[10px] font-bold text-[#22C55E]">{logoSize}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="10" 
                            max="35" 
                            step="1"
                            value={logoSize} 
                            onChange={(e) => setLogoSize(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#22C55E]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">{t.errorCorrection}</label>
                      <button 
                        onClick={() => setShowInfo(!showInfo)}
                        className="text-slate-400 hover:text-[#22C55E] transition-colors"
                      >
                        <Info size={16} />
                      </button>
                    </div>
                    
                    {showInfo && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-[11px] text-green-700 dark:text-green-400 leading-relaxed border border-green-100 dark:border-green-800"
                      >
                        {t.errorCorrectionInfo}
                      </motion.div>
                    )}

                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1">
                      {['L', 'M', 'Q', 'H'].map((l) => (
                        <button
                          key={l}
                          onClick={() => setLevel(l as any)}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                            level === l 
                            ? 'bg-white dark:bg-slate-700 text-[#22C55E] shadow-sm' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.includeMargin}</span>
                    <button 
                      onClick={() => setIncludeMargin(!includeMargin)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${includeMargin ? 'bg-[#22C55E]' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${includeMargin ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-5">
            <div className="sticky top-8 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-10 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-8">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{t.livePreview}</span>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {/* STRICT SQUARE PREVIEW CONTAINER */}
                <div className="w-full relative" style={{ paddingBottom: '100%' }}>
                  <div className="absolute inset-0 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-inner overflow-hidden flex items-center justify-center p-8">
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                      {qrValue ? (
                        <motion.div 
                          ref={qrCanvasRef} 
                          className="flex items-center justify-center aspect-square shadow-xl rounded-lg overflow-hidden"
                          animate={{ width: size, height: size }}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          style={{ maxWidth: '100%', maxHeight: '100%' }}
                        >
                          <QRCodeCanvas
                            value={qrValue}
                            size={Math.max(size, 512)} // Ensure high quality for preview
                            fgColor={fgColor}
                            bgColor={bgColor}
                            level={level}
                            includeMargin={includeMargin}
                            imageSettings={imageSettings}
                            style={{ width: '100%', height: '100%' }}
                          />
                        </motion.div>
                      ) : (
                        <div className="text-slate-300 dark:text-slate-600 flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            <Type size={32} />
                          </div>
                          <p className="text-sm font-semibold">{t.enterDetails}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Hidden SVG for download */}
                    <div ref={qrSvgRef} className="hidden">
                      {qrValue && (
                        <QRCodeSVG
                          value={qrValue}
                          size={size}
                          fgColor={fgColor}
                          bgColor={bgColor}
                          level={level}
                          includeMargin={includeMargin}
                          imageSettings={imageSettings}
                        />
                      )}
                    </div>
                    
                    {/* Decorative background pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#22C55E 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                  </div>
                </div>

                <div className="w-full mt-8 px-2">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.outputSize}</label>
                    <span className="text-xs font-bold text-[#22C55E] bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-md">{size}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="128" 
                    max="1024" 
                    step="32"
                    value={size} 
                    onChange={(e) => setSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#22C55E]"
                  />
                  <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400">
                    <span>128px</span>
                    <span>1024px</span>
                  </div>
                </div>

                <div className="w-full mt-8 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={downloadPNG}
                      disabled={!qrValue}
                      className="py-4 bg-[#22C55E] hover:bg-green-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-200 dark:shadow-none active:scale-[0.98]"
                    >
                      <Download size={18} />
                      PNG
                    </button>
                    <button
                      onClick={downloadSVG}
                      disabled={!qrValue}
                      className="py-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-300 dark:disabled:text-slate-700 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]"
                    >
                      <FileCode size={18} />
                      SVG
                    </button>
                  </div>
                  <p className="text-center text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                    {t.highRes}
                  </p>
                </div>
              </div>
              
              {/* Pro Tip Card */}
              <div className="bg-[#22C55E] rounded-3xl p-6 text-white shadow-lg shadow-green-200 dark:shadow-none">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Info size={18} />
                  {t.proTip}
                </h4>
                <p className="text-green-100 text-sm leading-relaxed">
                  {t.proTipText}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
