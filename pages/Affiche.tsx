import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wand2, Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import { generateAffiche } from '../services/geminiService';
import { UserProfile } from '../types';
import { supabase } from '../services/supabaseClient';

export const Affiche: React.FC<{ profile: UserProfile | null; onAction: () => void }> = ({ profile, onAction }) => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{ imageUrl: string; enhancedPrompt: string } | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    if (profile && profile.tokens < 5) {
      alert("Jetons insuffisants ! La génération d'affiche coûte 5 jetons.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await generateAffiche(prompt);
      if (res) {
        setResult(res);
        if (profile) {
          await supabase.from('profiles').update({ tokens: profile.tokens - 5 }).eq('id', profile.id);
          onAction();
        }
      } else {
        alert("Erreur lors de la génération de l'image.");
      }
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!result?.imageUrl) return;
    const link = document.createElement('a');
    link.href = result.imageUrl;
    link.download = `affiche-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto px-4 py-6">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 glass rounded-full hover:neon-border transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold prestige-text text-[#00f2ff]">Affiche Pro</h1>
            <p className="text-xs text-gray-400 tracking-widest uppercase">Générateur d'affiches publicitaires</p>
          </div>
        </div>
        <div className="glass px-4 py-2 rounded-full border border-[#00f2ff]/20">
          <span className="text-sm font-medium">Coût: <span className="text-[#00f2ff]">5 Jetons</span></span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
        {/* Left Column: Input */}
        <div className="flex flex-col gap-6">
          <div className="glass p-6 rounded-3xl border border-[#00f2ff]/10 flex-1 flex flex-col">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Wand2 size={20} className="text-[#00f2ff]" />
              Votre idée
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Décrivez simplement ce que vous souhaitez pour votre affiche. Notre IA (GPT-Image1) transformera votre idée en un prompt professionnel ultra-précis avant de générer l'image.
            </p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Une affiche pour un parfum de luxe pour homme, ambiance nocturne, néons bleus, élégant et mystérieux..."
              className="w-full flex-1 bg-black/40 border border-[#00f2ff]/20 focus:border-[#00f2ff] rounded-2xl p-4 outline-none transition-all resize-none mb-4"
            />
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full py-4 bg-[#00f2ff] text-black font-bold rounded-2xl hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Wand2 size={20} />
                  Générer l'affiche
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Result */}
        <div className="glass p-6 rounded-3xl border border-[#00f2ff]/10 flex flex-col items-center justify-center relative overflow-hidden group">
          {result ? (
            <div className="w-full h-full flex flex-col">
              <div className="flex-1 relative rounded-xl overflow-hidden mb-4 bg-black/50 flex items-center justify-center">
                <img 
                  src={result.imageUrl} 
                  alt="Affiche générée" 
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 mb-4 max-h-32 overflow-y-auto scrollbar-hide">
                <p className="text-xs text-[#00f2ff] font-bold mb-1 uppercase tracking-wider">Prompt optimisé généré :</p>
                <p className="text-sm text-gray-300 italic">{result.enhancedPrompt}</p>
              </div>
              <button
                onClick={handleDownload}
                className="w-full py-3 glass border border-[#00f2ff]/30 text-[#00f2ff] font-bold rounded-xl hover:bg-[#00f2ff]/10 transition-all flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Télécharger l'affiche
              </button>
            </div>
          ) : (
            <div className="text-center opacity-40 flex flex-col items-center">
              <ImageIcon size={64} className="mb-4 text-[#00f2ff]" />
              <p className="text-lg font-medium">Votre affiche apparaîtra ici</p>
              <p className="text-sm mt-2 max-w-xs">L'image générée sera de haute qualité, prête pour vos campagnes publicitaires.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
