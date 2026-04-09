
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { MODULES, DEV_NAME, DEV_TITLE } from '../constants';
import { UserProfile, ModuleType } from '../types';
import { Wallet, Shield, Menu, X } from 'lucide-react';

export const Home: React.FC<{ profile: UserProfile | null }> = ({ profile }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col items-center min-h-screen relative">
      {/* Header */}
      <header className="w-full flex justify-between items-center mb-8">
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="p-2 glass rounded-full hover:neon-border transition-all text-gray-400 hover:text-[#00f2ff]"
        >
          <Menu size={24} />
        </button>
        
        <button 
          onClick={() => navigate('/wallet')}
          className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-[#00f2ff]/30 hover:bg-[#00f2ff]/10 transition-all"
        >
          <Wallet size={16} className="text-[#00f2ff]" />
          <span className="font-bold text-[#00f2ff] text-sm">{profile?.tokens || 0} Jetons</span>
        </button>
      </header>

      {/* Burger Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
          <div className="relative w-64 h-full glass border-r border-[#00f2ff]/20 p-6 flex flex-col animate-in slide-in-from-left">
            <div className="flex justify-between items-center mb-8">
              <span className="text-xl font-bold prestige-text text-[#00f2ff]">Menu</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-col gap-4">
              <button onClick={() => navigate('/wallet')} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left">
                <Wallet size={18} className="text-[#00f2ff]" />
                <span>Portefeuille</span>
              </button>
              {profile?.role === 'admin' && (
                <button onClick={() => navigate('/admin')} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-left">
                  <Shield size={18} className="text-[#00f2ff]" />
                  <span>Administration</span>
                </button>
              )}
            </div>
            
            <div className="mt-auto pt-6 border-t border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#00f2ff]/20 flex items-center justify-center text-[#00f2ff] font-bold">
                  {profile?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{profile?.email || 'Utilisateur'}</p>
                  <p className="text-xs text-gray-500 capitalize">{profile?.role || 'user'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-12 animate-in fade-in duration-1000">
        <Logo size="lg" />
      </div>

      <h1 className="text-4xl font-bold mb-2 prestige-text text-center tracking-tight">SOFIA AI</h1>
      <p className="text-gray-400 mb-12 text-center max-w-md">L'excellence de l'intelligence artificielle au bout de vos doigts.</p>

      {/* Grid of Modules */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full mb-16">
        {MODULES.map((m) => (
          <button
            key={m.id}
            onClick={() => navigate(`/${m.id}`)}
            className="flex flex-col items-center group transition-all duration-300"
          >
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${m.id === ModuleType.CHAT ? 'bg-white' : 'glass'} border border-[#00f2ff]/20 group-hover:neon-border group-hover:scale-110 transition-all relative overflow-hidden`}>
              {typeof m.icon === 'string' ? (
                <img 
                  src={m.icon} 
                  alt={m.name} 
                  className="w-full h-full object-contain p-3 group-hover:neon-glow transition-all duration-300" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-[#00f2ff] group-hover:neon-glow">
                  {m.icon}
                </div>
              )}
            </div>
            <span className="mt-4 text-xs uppercase tracking-[0.2em] font-medium text-gray-500 group-hover:text-white transition-colors">{m.name}</span>
          </button>
        ))}
      </div>

      {/* Profile & Credits */}
      <div className="w-full glass rounded-3xl p-8 mb-12 relative overflow-hidden border-[#00f2ff]/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="flex flex-col gap-2">
             <div className="flex items-center gap-3">
               <span className="text-sm uppercase tracking-widest text-[#00f2ff]">Crédits</span>
               {profile?.role === 'admin' && (
                 <button onClick={() => navigate('/admin')} className="p-1 text-gray-500 hover:text-[#00f2ff]">
                   <Shield size={16} />
                 </button>
               )}
             </div>
             <h3 className="text-2xl prestige-text font-bold">{DEV_NAME}</h3>
             <p className="text-[#00f2ff] font-medium text-sm tracking-widest">{DEV_TITLE}</p>
          </div>
        </div>
      </div>

      <footer className="mt-auto text-gray-600 text-[10px] tracking-[0.4em] uppercase">
        © 2024 SOFIA AI • Powered by KABRE CORP
      </footer>
    </div>
  );
};
