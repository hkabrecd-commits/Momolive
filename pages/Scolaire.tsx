
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Send, Paperclip } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { jsPDF } from 'jspdf';
import { scolaireAnalysis } from '../services/geminiService';
import { UserProfile } from '../types';
import { supabase } from '../services/supabaseClient';
import { DEV_NAME } from '../constants';

export const Scolaire: React.FC<{ profile: UserProfile | null; onAction: () => void }> = ({ profile, onAction }) => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<{ data: string; mimeType: string } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const reader = new FileReader();
      reader.onload = () => {
        setFile({ data: (reader.result as string).split(',')[1], mimeType: f.type });
      };
      reader.readAsDataURL(f);
    }
  };

  const handleAnalyze = async () => {
    if (!prompt.trim() || isLoading) return;
    if (profile && profile.tokens < 1) {
      alert("Jetons insuffisants !");
      return;
    }

    setIsLoading(true);
    try {
      const result = await scolaireAnalysis(prompt, file || undefined);
      setResponse(result || "Aucune réponse générée.");
      
      if (profile) {
        await supabase.from('profiles').update({ tokens: profile.tokens - 1 }).eq('id', profile.id);
        onAction();
      }
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(5, 5, 5);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(0, 242, 255);
    doc.setFontSize(22);
    doc.text('SOFIA AI - EXCELLENCE SCOLAIRE', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Document préparé par ${DEV_NAME}`, 105, 30, { align: 'center' });

    // Content
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(12);
    const splitText = doc.splitTextToSize(response, 180);
    doc.text(splitText, 15, 50);

    doc.save(`sofia_education_${Date.now()}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 min-h-screen flex flex-col">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 glass rounded-full hover:neon-border transition-all">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold prestige-text">Assistant Scolaire</h1>
        </div>
        {response && (
          <button 
            onClick={exportPDF}
            className="flex items-center gap-2 px-6 py-3 bg-[#00f2ff]/10 border border-[#00f2ff]/40 text-[#00f2ff] rounded-full hover:bg-[#00f2ff]/20 transition-all"
          >
            <Download size={18} /> Export PDF
          </button>
        )}
      </header>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8 flex-1">
        <div className="glass rounded-3xl p-8 border-white/5 overflow-y-auto max-h-[70vh]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="w-12 h-12 border-4 border-t-[#00f2ff] border-[#00f2ff]/20 rounded-full animate-spin"></div>
              <p className="text-gray-400">Analyse de l'expert en cours...</p>
            </div>
          ) : response ? (
            <div className="prose prose-invert max-w-none text-gray-200">
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {response}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-30 text-center px-12">
              <FileText size={48} className="mb-4" />
              <p>Soumettez un problème mathématique ou un document pour analyse.</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="glass rounded-3xl p-6 border-white/5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#00f2ff] mb-4">Requête Scolaire</h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Résous cet exercice de physique et détaille le calcul..."
              className="w-full h-40 bg-black/40 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#00f2ff]/50 transition-all resize-none text-sm"
            />
            
            <div className="mt-4 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-white transition-colors">
                <Paperclip size={18} />
                <span className="text-xs">{file ? 'Document prêt' : 'Joindre PDF/Image'}</span>
                <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} />
              </label>
              {file && <button onClick={() => setFile(null)} className="text-xs text-red-400">Effacer</button>}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isLoading || !prompt.trim()}
              className="w-full mt-6 py-4 bg-[#00f2ff] text-black font-bold rounded-2xl hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send size={18} /> Analyser
            </button>
          </div>

          <div className="glass rounded-3xl p-6 border-white/5 space-y-4">
             <div className="flex items-center gap-3 text-gray-400">
               <div className="w-8 h-8 rounded-full bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff]">1</div>
               <span className="text-xs">Uploadez votre exercice (Image/PDF)</span>
             </div>
             <div className="flex items-center gap-3 text-gray-400">
               <div className="w-8 h-8 rounded-full bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff]">2</div>
               <span className="text-xs">L'IA détecte les formules et résout</span>
             </div>
             <div className="flex items-center gap-3 text-gray-400">
               <div className="w-8 h-8 rounded-full bg-[#00f2ff]/10 flex items-center justify-center text-[#00f2ff]">3</div>
               <span className="text-xs">Exportez en PDF Premium</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
