import React, { useEffect, useState } from 'react';
import { Key, ExternalLink } from 'lucide-react';

interface ApiKeySelectorProps {
  onKeySelected: () => void;
}

export const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ onKeySelected }) => {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkKey = async () => {
      try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (hasKey) {
          onKeySelected();
        }
      } catch (e) {
        console.error("Error checking for API key", e);
      } finally {
        setChecking(false);
      }
    };
    checkKey();
  }, [onKeySelected]);

  const handleSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      // Assume success as per instructions and proceed
      onKeySelected();
    } catch (error) {
      console.error("Failed to select key", error);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-jungle-500 rounded-full mb-4"></div>
          <p className="text-zinc-400">Initializing Environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2948&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md p-8 bg-zinc-900/90 border border-zinc-700 rounded-2xl shadow-2xl text-center">
        <div className="mx-auto w-16 h-16 bg-jungle-900/50 rounded-full flex items-center justify-center mb-6 border border-jungle-500/30">
          <Key className="w-8 h-8 text-jungle-400" />
        </div>
        
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Urban Jungle Typer
        </h1>
        <p className="text-zinc-400 mb-8">
          To generate high-quality typography art using Gemini 3 Pro, please connect your Google Cloud project.
        </p>

        <button
          onClick={handleSelectKey}
          className="w-full py-4 px-6 bg-gradient-to-r from-jungle-600 to-emerald-600 hover:from-jungle-500 hover:to-emerald-500 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-jungle-900/50 flex items-center justify-center gap-2"
        >
          <span>Select API Key</span>
        </button>

        <div className="mt-6 text-xs text-zinc-500">
           <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center gap-1 hover:text-jungle-400 transition-colors"
           >
             Billing Information <ExternalLink size={10} />
           </a>
        </div>
      </div>
    </div>
  );
};
