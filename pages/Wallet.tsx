
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet as WalletIcon, CheckCircle, Smartphone } from 'lucide-react';
import { PACKS } from '../constants';
import { UserProfile } from '../types';
import { supabase } from '../services/supabaseClient';

export const Wallet: React.FC<{ profile: UserProfile | null; onAction: () => void }> = ({ profile, onAction }) => {
  const navigate = useNavigate();
  const [smsText, setSmsText] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleValidateSMS = async () => {
    if (!smsText.trim() || isValidating) return;
    setIsValidating(true);
    
    try {
      // MoneyFusion Extraction Logic: Look for IDs and Amounts
      // Regex pattern for typical mobile money SMS (CinetPay, Wave, Orange, MTN)
      const amountRegex = /(\d+)\s*FCFA/i;
      const idRegex = /ID\s*:\s*([A-Z0-9]+)/i;
      
      const amountMatch = smsText.match(amountRegex);
      const idMatch = smsText.match(idRegex);
      
      if (amountMatch && profile) {
        const amount = parseInt(amountMatch[1]);
        const transId = idMatch ? idMatch[1] : `AUTO-${Date.now()}`;
        
        // Find corresponding pack tokens
        const pack = PACKS.find(p => p.price <= amount) || PACKS[0];
        
        // Update Supabase
        await supabase.from('profiles').update({ tokens: (profile.tokens || 0) + pack.tokens }).eq('id', profile.id);
        await supabase.from('transactions').insert({
          user_id: profile.id,
          amount: amount,
          tokens: pack.tokens,
          transaction_id: transId,
          status: 'completed',
          created_at: new Date().toISOString()
        });

        setSuccess(true);
        setSmsText('');
        onAction();
        setTimeout(() => setSuccess(false), 5000);
      } else {
        alert("Impossible d'extraire les informations du SMS. Vérifiez le format.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="flex items-center gap-4 mb-12">
        <button onClick={() => navigate('/')} className="p-2 glass rounded-full hover:neon-border transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold prestige-text">Gestionnaire de Jetons</h1>
      </header>

      <div className="grid md:grid-cols-[1fr_350px] gap-8">
        <div className="space-y-6">
          <div className="glass rounded-3xl p-8 border-[#00f2ff]/20 flex justify-between items-center relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-xs uppercase tracking-widest text-gray-400">Solde Actuel</span>
              <h2 className="text-4xl font-bold text-[#00f2ff] neon-glow">{profile?.tokens || 0} Jetons</h2>
            </div>
            <div className="opacity-10 absolute -right-4 -bottom-4">
              <WalletIcon size={120} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {PACKS.map(p => (
              <div key={p.id} className="glass rounded-2xl p-6 border-white/5 hover:neon-border transition-all text-center">
                <span className="text-xs text-[#00f2ff] font-bold uppercase">{p.label}</span>
                <div className="text-2xl font-bold my-2">{p.tokens} J</div>
                <div className="text-sm text-gray-500 font-bold">{p.price} FCFA</div>
              </div>
            ))}
          </div>

          <div className="glass rounded-3xl p-8 border-white/5">
            <h3 className="flex items-center gap-2 font-bold mb-4">
              <Smartphone size={20} className="text-[#00f2ff]" /> 
              Validation MoneyFusion
            </h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Collez ici le SMS de confirmation reçu après votre paiement via Orange, MTN ou Wave. 
              Le système créditera automatiquement votre compte.
            </p>
            <textarea
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              placeholder="Ex: Confirmation de paiement de 2000 FCFA reçu pour SOFIA AI. ID: XH82..."
              className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-4 outline-none focus:border-[#00f2ff]/50 transition-all resize-none text-sm mb-4"
            />
            <button
              onClick={handleValidateSMS}
              disabled={isValidating || !smsText.trim()}
              className="w-full py-4 bg-[#00f2ff] text-black font-bold rounded-2xl transition-all disabled:opacity-50"
            >
              {isValidating ? 'Validation...' : 'Valider le SMS'}
            </button>
            {success && (
              <div className="mt-4 flex items-center gap-2 text-green-400 animate-in fade-in">
                <CheckCircle size={18} /> Compte crédité avec succès !
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-3xl p-6 border-white/5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#00f2ff] mb-4">Besoin d'aide ?</h3>
            <div className="space-y-4 text-xs text-gray-400 leading-relaxed">
              <p>1. Choisissez votre pack préféré.</p>
              <p>2. Effectuez le paiement mobile vers le numéro marchand (Bouton bientôt disponible).</p>
              <p>3. Recevez le SMS et collez-le à gauche.</p>
              <p>4. Profitez de vos outils Premium !</p>
            </div>
          </div>
          <div className="p-6 bg-gradient-to-br from-[#00f2ff]/10 to-transparent rounded-3xl border border-[#00f2ff]/20">
             <p className="text-[10px] text-gray-500 italic">"La technologie au service du développement de l'Afrique." - P.D.G KABRE</p>
          </div>
        </div>
      </div>
    </div>
  );
};
