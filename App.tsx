import React, { useState } from 'react';
import { generateJungleImage } from './services/geminiService';
import { STYLE_PRESETS } from './constants';
import { GenerationHistoryItem, StylePreset } from './types';
import { History } from './components/History';
import { 
  Wand2, 
  Download, 
  Leaf, 
  Type, 
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Share2,
  Check
} from 'lucide-react';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<StylePreset>(STYLE_PRESETS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  
  // Share state
  const [isSharing, setIsSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setCurrentImage(null);
    setShareStatus('idle');

    try {
      const imageData = await generateJungleImage(inputText, selectedStyle.promptTemplate);
      setCurrentImage(imageData);
      
      const newHistoryItem: GenerationHistoryItem = {
        id: Date.now().toString(),
        text: inputText,
        styleName: selectedStyle.name,
        imageUrl: imageData,
        timestamp: Date.now(),
      };
      
      setHistory(prev => [newHistoryItem, ...prev]);

    } catch (err: any) {
      // Display the actual error message from the service
      const errorMessage = err.message || "Failed to generate image. Please try again later or select a different style.";
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (currentImage) {
      const link = document.createElement('a');
      link.href = currentImage;
      link.download = `urban-jungle-${inputText.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = async () => {
    if (!currentImage) return;
    
    setIsSharing(true);
    setShareStatus('idle');

    try {
      // Convert base64 to Blob/File
      const res = await fetch(currentImage);
      const blob = await res.blob();
      const file = new File([blob], `urban-jungle-${Date.now()}.png`, { type: 'image/png' });

      // Try native sharing first (Mobile/Tablet preferred)
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Urban Jungle Typer',
          text: `Check out my "${inputText}" design created with Urban Jungle Typer!`,
          files: [file],
        });
        setShareStatus('success');
      } else {
        // Fallback: Upload to temporary storage (file.io) to generate a URL
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadResponse = await fetch('https://file.io/?expires=1w', {
          method: 'POST',
          body: formData
        });
        
        if (uploadResponse.ok) {
          const json = await uploadResponse.json();
          if (json.success && json.link) {
            await navigator.clipboard.writeText(json.link);
            setShareStatus('success');
            setTimeout(() => setShareStatus('idle'), 3000);
            return;
          }
        }
        
        // If upload fails, fallback to copying the image blob itself to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
        setShareStatus('success');
        setTimeout(() => setShareStatus('idle'), 3000);
      }
    } catch (error) {
      console.error("Share failed:", error);
      setShareStatus('error');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-jungle-500 selection:text-white pb-20">
      
      {/* Header Removed for WordPress Integration */}

      <main className="max-w-6xl mx-auto px-4 pt-8">
        
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Logo/Title for embedded context */}
            <div className="flex items-center gap-2 mb-2 lg:hidden">
                <Leaf className="w-6 h-6 text-jungle-500" />
                <span className="font-display text-xl font-bold tracking-wide text-zinc-900">URBAN<span className="text-jungle-600">JUNGLE</span></span>
            </div>
            
            {/* Text Input Section */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <Type className="w-4 h-4" />
                Your Text
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="ENTER NAME..."
                  maxLength={20}
                  className="w-full bg-white border-2 border-zinc-200 text-zinc-900 text-2xl font-display font-bold p-4 rounded-xl focus:outline-none focus:border-jungle-500 focus:ring-4 focus:ring-jungle-500/10 transition-all placeholder:text-zinc-300 shadow-sm"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-mono">
                  {inputText.length}/20
                </div>
              </div>
            </div>

            {/* Style Selection Section */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Select Aesthetic
              </label>
              <div className="grid grid-cols-1 gap-3">
                {STYLE_PRESETS.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style)}
                    className={`relative p-4 rounded-xl text-left transition-all border-2 overflow-hidden group shadow-sm ${
                      selectedStyle.id === style.id
                        ? 'border-jungle-500 bg-jungle-50'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${style.previewColor}`}></div>
                    <div className="pl-3">
                      <div className={`font-bold font-display text-lg transition-colors ${
                        selectedStyle.id === style.id ? 'text-jungle-900' : 'text-zinc-800'
                      }`}>
                        {style.name}
                      </div>
                      <div className="text-xs text-zinc-500 leading-relaxed mt-1">
                        {style.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !inputText.trim()}
              className="w-full py-4 bg-gradient-to-r from-jungle-600 to-emerald-600 hover:from-jungle-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold font-display text-lg tracking-wide rounded-xl shadow-lg shadow-jungle-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  GROWING JUNGLE...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  GENERATE
                </>
              )}
            </button>
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-800 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                {error}
              </div>
            )}
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-8">
            <div className="h-full flex flex-col">
               <div className="flex-1 min-h-[400px] lg:min-h-[600px] bg-zinc-100 rounded-2xl border-2 border-zinc-200 flex items-center justify-center relative overflow-hidden shadow-sm">
                 
                 {/* Background Pattern for Empty State */}
                 {!currentImage && !isGenerating && (
                   <div className="text-center p-8 opacity-60">
                     <div className="w-24 h-24 mx-auto mb-4 bg-white rounded-full flex items-center justify-center text-zinc-300 border-2 border-zinc-200">
                       <Leaf className="w-10 h-10" />
                     </div>
                     <h2 className="text-2xl font-display font-bold text-zinc-400 mb-2">Ready to Create</h2>
                     <p className="text-zinc-500 max-w-sm mx-auto">
                       Enter your text and choose a style to generate unique urban jungle typography art.
                     </p>
                   </div>
                 )}

                 {/* Loading State */}
                 {isGenerating && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                     <div className="relative w-20 h-20">
                        <div className="absolute inset-0 border-4 border-zinc-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-jungle-500 rounded-full border-t-transparent animate-spin"></div>
                     </div>
                     <p className="mt-4 text-jungle-600 font-mono text-sm animate-pulse">SYNTHESIZING FLORA...</p>
                   </div>
                 )}

                 {/* Result Image */}
                 {currentImage && (
                   <img 
                    src={currentImage} 
                    alt="Generated Jungle Text" 
                    className={`w-full h-full object-contain transition-opacity duration-700 ${isGenerating ? 'opacity-50' : 'opacity-100'}`}
                   />
                 )}
                 
                 {/* Action Bar (Overlay) */}
                 {currentImage && !isGenerating && (
                   <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                     <button 
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-6 py-3 bg-white text-zinc-900 font-bold rounded-full hover:bg-zinc-100 transition-colors shadow-xl shadow-black/20 ring-1 ring-zinc-200"
                     >
                       <Download className="w-4 h-4" />
                       Download
                     </button>
                     
                     <button 
                      onClick={handleShare}
                      disabled={isSharing}
                      className="flex items-center gap-2 px-6 py-3 bg-jungle-600 text-white font-bold rounded-full hover:bg-jungle-500 transition-colors shadow-xl shadow-jungle-900/20 disabled:opacity-75 disabled:cursor-wait"
                     >
                       {isSharing ? (
                         <Loader2 className="w-4 h-4 animate-spin" />
                       ) : shareStatus === 'success' ? (
                         <Check className="w-4 h-4" />
                       ) : shareStatus === 'error' ? (
                         <AlertCircle className="w-4 h-4" />
                       ) : (
                         <Share2 className="w-4 h-4" />
                       )}
                       {shareStatus === 'success' ? 'Copied Link!' : 'Share'}
                     </button>
                   </div>
                 )}
               </div>

               {/* History Section */}
               <History 
                items={history} 
                onSelect={(item) => {
                  setInputText(item.text);
                  setCurrentImage(item.imageUrl);
                  setShareStatus('idle');
                }} 
               />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;