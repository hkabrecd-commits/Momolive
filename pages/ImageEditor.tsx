
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Download, Sparkles, X, Plus } from 'lucide-react';
import { generateImage } from '../services/geminiService';
import { UserProfile } from '../types';
import { supabase } from '../services/supabaseClient';

export const ImageEditor: React.FC<{ profile: UserProfile | null; onAction: () => void }> = ({ profile, onAction }) => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && images.length < 2) {
      const reader = new FileReader();
      reader.onload = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    if (profile && profile.tokens < 1) {
      alert("Jetons insuffisants !");
      return;
    }

    setIsLoading(true);
    try {
      // Use the first image if available for editing
      const base64 = images[0]?.split(',')[1];
      const result = await generateImage(prompt, base64);
      if (result) {
        setGeneratedImage(result);
        
        if (profile) {
          await supabase.from('profiles').update({ tokens: profile.tokens - 1 }).eq('id', profile.id);
          onAction();
        }
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la génération");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    
    // Phoenix Browser & Mobile Support logic
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `sofia_ai_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    
    // Prolong delay for Android/Phoenix
    setTimeout(() => {
      document.body.removeChild(link);
    }, 5000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-screen flex flex-col">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 glass rounded-full hover:neon-border transition-all">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold prestige-text">Nano Banana</h1>
        </div>
        <div className="text-sm font-medium px-4 py-2 glass rounded-full border-[#00f2ff]/20">
          <span className="text-[#00f2ff]">{profile?.tokens || 0} Jetons</span>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-8 flex-1">
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 border-white/5">
            <h2 className="text-sm uppercase tracking-widest text-[#00f2ff] mb-4">Inspirations</h2>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Décrivez l'image ou la retouche souhaitée..."
              className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#00f2ff]/50 transition-all resize-none"
            />
            
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400">Références (Max 2)</span>
                {images.length < 2 && (
                  <label className="cursor-pointer text-[#00f2ff] hover:opacity-80 flex items-center gap-1 text-xs">
                    <Plus size={14} /> Ajouter
                    <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
                  </label>
                )}
              </div>
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10">
                    <img src={img} className="w-full h-full object-cover" />
                    <button onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="w-full mt-8 py-4 bg-[#00f2ff] text-black font-bold rounded-2xl hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? 'Génération...' : <><Sparkles size={18} /> Créer le Chef-d'œuvre</>}
            </button>
          </div>
        </div>

        <div className="glass rounded-3xl p-6 border-white/5 flex flex-col items-center justify-center relative min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-t-[#00f2ff] border-[#00f2ff]/20 rounded-full animate-spin"></div>
              <p className="text-gray-400 animate-pulse">L'IA dessine pour vous...</p>
            </div>
          ) : generatedImage ? (
            <div className="w-full h-full animate-in fade-in zoom-in-95">
              <img src={generatedImage} className="w-full h-auto rounded-2xl shadow-2xl border border-white/10" alt="Generated" />
              <button 
                onClick={downloadImage}
                className="absolute bottom-10 right-10 p-4 bg-black/80 text-[#00f2ff] border border-[#00f2ff]/30 rounded-full hover:scale-110 transition-all shadow-xl"
              >
                <Download size={24} />
              </button>
            </div>
          ) : (
            <div className="text-center opacity-30 px-12">
              <Sparkles size={48} className="mx-auto mb-4" />
              <p className="text-sm">Votre création apparaîtra ici.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
