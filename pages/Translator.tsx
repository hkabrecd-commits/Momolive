
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Languages, Volume2, Mic, Copy, ArrowRightLeft } from 'lucide-react';
import { translateTextStream } from '../services/geminiService';
import { UserProfile } from '../types';
import { supabase } from '../services/supabaseClient';

const LANGUAGES = [
  { code: 'French', label: 'Français' },
  { code: 'English', label: 'Anglais' },
  { code: 'Spanish', label: 'Espagnol' },
  { code: 'German', label: 'Allemand' },
  { code: 'Chinese', label: 'Chinois' },
  { code: 'Arabic', label: 'Arabe' },
  { code: 'Japanese', label: 'Japonais' },
  { code: 'Russian', label: 'Russe' },
  { code: 'Portuguese', label: 'Portugais' },
];

export const Translator: React.FC<{ profile: UserProfile | null; onAction: () => void }> = ({ profile, onAction }) => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLang, setTargetLang] = useState('English');
  const [isLoading, setIsLoading] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim() || isLoading) return;
    if (profile && profile.tokens < 1) {
      alert("Jetons insuffisants !");
      return;
    }

    setIsLoading(true);
    setTranslatedText('');
    try {
      let fullTranslation = '';
      await translateTextStream(inputText, targetLang, (chunk) => {
        fullTranslation += chunk;
        setTranslatedText(fullTranslation);
      });
      
      if (profile) {
        await supabase.from('profiles').update({ tokens: profile.tokens - 1 }).eq('id', profile.id);
        onAction();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (text: string, lang: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang.includes('French') ? 'fr-FR' : 'en-US';
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="flex items-center gap-4 mb-12">
        <button onClick={() => navigate('/')} className="p-2 glass rounded-full hover:neon-border transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold prestige-text">Traducteur Pro</h1>
      </header>

      <div className="space-y-6">
        <div className="glass rounded-3xl p-6 border-white/5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs uppercase tracking-widest text-[#00f2ff]">Auto-Détection</span>
            <button className="text-gray-500 hover:text-white"><Mic size={18} /></button>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Entrez le texte à traduire..."
            className="w-full h-32 bg-transparent outline-none resize-none text-xl"
          />
        </div>

        <div className="flex items-center justify-center gap-4">
          <div className="h-[1px] flex-1 bg-white/5"></div>
          <button className="p-4 glass rounded-full border-[#00f2ff]/30 text-[#00f2ff]">
            <ArrowRightLeft size={20} />
          </button>
          <div className="h-[1px] flex-1 bg-white/5"></div>
        </div>

        <div className="glass rounded-3xl p-6 border-[#00f2ff]/10 bg-[#00f2ff]/5">
          <div className="flex items-center justify-between mb-4">
            <select 
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-transparent text-[#00f2ff] outline-none text-xs uppercase tracking-widest font-bold cursor-pointer"
            >
              {LANGUAGES.map(l => <option key={l.code} value={l.code} className="bg-black text-white">{l.label}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={() => speak(translatedText, targetLang)} className="p-2 text-gray-500 hover:text-white"><Volume2 size={18} /></button>
              <button onClick={() => navigator.clipboard.writeText(translatedText)} className="p-2 text-gray-500 hover:text-white"><Copy size={18} /></button>
            </div>
          </div>
          <div className="min-h-[128px] text-xl text-white">
            {isLoading && !translatedText ? <div className="animate-pulse text-gray-500">Traduction...</div> : translatedText}
          </div>
        </div>

        <button
          onClick={handleTranslate}
          disabled={isLoading || !inputText.trim()}
          className="w-full py-5 bg-[#00f2ff] text-black font-bold rounded-2xl hover:shadow-[0_0_30px_rgba(0,242,255,0.4)] transition-all disabled:opacity-50 text-lg"
        >
          Traduire maintenant
        </button>
      </div>
    </div>
  );
};
