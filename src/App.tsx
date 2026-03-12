/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { Download, Type, Settings, RefreshCw, Mail, User, Info, Globe, FileText, FileCode, MapPin, ExternalLink, Image as ImageIcon, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type ContentType = 'url' | 'text' | 'email' | 'contact' | 'location';

export default function App() {
  const [contentType, setContentType] = useState<ContentType>('url');
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
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">QRGO</h1>
            <p className="text-slate-500 mt-2 text-lg">Create professional QR codes for any purpose.</p>
          </div>
          <button 
            onClick={resetSettings}
            className="p-3 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-600 border border-transparent hover:border-slate-200"
            title="Reset All Settings"
          >
            <RefreshCw size={22} />
          </button>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Section */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Type Selector */}
            <div className="flex p-1 bg-slate-200/50 rounded-2xl gap-1">
              {[
                { id: 'url', icon: Globe, label: 'URL' },
                { id: 'text', icon: FileText, label: 'Text' },
                { id: 'email', icon: Mail, label: 'Email' },
                { id: 'contact', icon: User, label: 'vCard' },
                { id: 'location', icon: MapPin, label: 'Location' },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setContentType(type.id as ContentType)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-sm font-semibold transition-all ${
                    contentType === type.id 
                    ? 'bg-white text-[#22C55E] shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
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
              className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8"
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
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Website URL</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          type="url"
                          name="url"
                          value={formData.url}
                          onChange={handleInputChange}
                          placeholder="https://example.com"
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#22C55E] outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {contentType === 'text' && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Plain Text</label>
                      <textarea
                        name="text"
                        value={formData.text}
                        onChange={handleInputChange}
                        placeholder="Type your message here..."
                        className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#22C55E] outline-none transition-all resize-none"
                      />
                    </div>
                  )}

                  {contentType === 'email' && (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="hello@example.com"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#22C55E] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="Inquiry about..."
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#22C55E] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Your email body..."
                          className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#22C55E] outline-none resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {contentType === 'contact' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#22C55E] outline-none"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#22C55E] outline-none"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Mobile Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#22C55E] outline-none"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Work Phone</label>
                        <input
                          type="tel"
                          name="workPhone"
                          value={formData.workPhone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#22C55E] outline-none"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Organization</label>
                        <input
                          type="text"
                          name="org"
                          value={formData.org}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#22C55E] outline-none"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Position</label>
                        <input
                          type="text"
                          name="position"
                          value={formData.position}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#22C55E] outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Website</label>
                        <input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#22C55E] outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className="w-full h-20 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#22C55E] outline-none resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {contentType === 'location' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 mb-2">
                          <p className="text-xs text-green-700 font-medium leading-relaxed">
                            Enter coordinates below to generate a Google Maps link. Scanning the QR code will open the location and offer directions.
                          </p>
                          <a 
                            href="https://www.google.com/maps" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-[#22C55E] hover:text-green-800 transition-colors"
                          >
                            <ExternalLink size={14} />
                            Find coordinates on Google Maps
                          </a>
                        </div>
                      </div>

                      <div className="col-span-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Latitude</label>
                        <input
                          type="text"
                          name="latitude"
                          value={formData.latitude}
                          onChange={handleInputChange}
                          placeholder="e.g. 40.4168"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#22C55E] outline-none"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Longitude</label>
                        <input
                          type="text"
                          name="longitude"
                          value={formData.longitude}
                          onChange={handleInputChange}
                          placeholder="e.g. -3.7038"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#22C55E] outline-none"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Customization Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-2 mb-8">
                <Settings className="text-[#22C55E]" size={20} />
                <h3 className="font-bold text-slate-800">Design & Quality</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Colors</label>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-sm font-medium text-slate-600">Foreground</span>
                        <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <span className="text-sm font-medium text-slate-600">Background</span>
                        <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Logo Image (SVG)</label>
                    {!logo ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-[#22C55E] transition-all cursor-pointer group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-3 text-slate-400 group-hover:text-[#22C55E]" />
                          <p className="text-xs text-slate-500 font-medium">Click to upload SVG</p>
                        </div>
                        <input type="file" className="hidden" accept=".svg" onChange={handleLogoUpload} />
                      </label>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
                              <img src={logo} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                            </div>
                            <span className="text-xs font-bold text-slate-600">Logo Active</span>
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
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logo Size</label>
                            <span className="text-[10px] font-bold text-[#22C55E]">{logoSize}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="10" 
                            max="35" 
                            step="1"
                            value={logoSize} 
                            onChange={(e) => setLogoSize(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#22C55E]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Error Correction</label>
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
                        className="mb-4 p-3 bg-green-50 rounded-xl text-[11px] text-green-700 leading-relaxed border border-green-100"
                      >
                        Error correction allows the QR code to be read even if it's partially damaged or covered. 
                        <strong> L (7%)</strong> is smallest, <strong>H (30%)</strong> is most resilient but more complex.
                      </motion.div>
                    )}

                    <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
                      {['L', 'M', 'Q', 'H'].map((l) => (
                        <button
                          key={l}
                          onClick={() => setLevel(l as any)}
                          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                            level === l 
                            ? 'bg-white text-[#22C55E] shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-sm font-medium text-slate-600">Include Margin</span>
                    <button 
                      onClick={() => setIncludeMargin(!includeMargin)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${includeMargin ? 'bg-[#22C55E]' : 'bg-slate-300'}`}
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
              <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-200 p-10 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-8">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Live Preview</span>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {/* STRICT SQUARE PREVIEW CONTAINER */}
                <div className="w-full relative" style={{ paddingBottom: '100%' }}>
                  <div className="absolute inset-0 bg-slate-50 rounded-3xl border border-slate-100 shadow-inner overflow-hidden flex items-center justify-center p-8">
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
                        <div className="text-slate-300 flex flex-col items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                            <Type size={32} />
                          </div>
                          <p className="text-sm font-semibold">Enter details to generate</p>
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
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Output Size</label>
                    <span className="text-xs font-bold text-[#22C55E] bg-green-50 px-2 py-1 rounded-md">{size}px</span>
                  </div>
                  <input 
                    type="range" 
                    min="128" 
                    max="1024" 
                    step="32"
                    value={size} 
                    onChange={(e) => setSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#22C55E]"
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
                      className="py-4 bg-[#22C55E] hover:bg-green-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-200 active:scale-[0.98]"
                    >
                      <Download size={18} />
                      PNG
                    </button>
                    <button
                      onClick={downloadSVG}
                      disabled={!qrValue}
                      className="py-4 bg-white hover:bg-slate-50 border border-slate-200 disabled:bg-slate-50 disabled:text-slate-300 disabled:cursor-not-allowed text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]"
                    >
                      <FileCode size={18} />
                      SVG
                    </button>
                  </div>
                  <p className="text-center text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                    High-Resolution Vector-Ready Output
                  </p>
                </div>
              </div>
              
              {/* Pro Tip Card */}
              <div className="bg-[#22C55E] rounded-3xl p-6 text-white shadow-lg shadow-green-200">
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Info size={18} />
                  Pro Tip
                </h4>
                <p className="text-green-100 text-sm leading-relaxed">
                  SVG format is perfect for professional printing as it can be scaled to any size without losing quality.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
