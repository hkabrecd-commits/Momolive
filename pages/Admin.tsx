
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Zap, TrendingUp, DollarSign } from 'lucide-react';
import { UserProfile, Transaction } from '../types';
import { supabase } from '../services/supabaseClient';

export const Admin: React.FC<{ profile: UserProfile | null }> = ({ profile }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalActions: 0 });

  useEffect(() => {
    if (!profile || profile.role !== 'admin') {
      navigate('/');
      return;
    }
    
    // Simulate live sync
    const interval = setInterval(() => {
      const db = JSON.parse(localStorage.getItem('sofia_ai_local_db') || '{}');
      setUsers(Object.values(db.users || {}));
      const rev = (db.transactions || []).reduce((acc: number, t: any) => acc + t.amount, 0);
      setStats({ totalRevenue: rev, totalActions: (db.logs || []).length });
    }, 2000);
    
    return () => clearInterval(interval);
  }, [profile, navigate]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="flex items-center gap-4 mb-12">
        <button onClick={() => navigate('/')} className="p-2 glass rounded-full hover:neon-border transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold prestige-text">Panel d'Administration (P.D.G)</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="glass p-6 rounded-3xl border-[#00f2ff]/20">
          <div className="flex items-center gap-4 mb-2 text-gray-400">
            <Users size={20} /> <span className="text-xs uppercase font-bold">Utilisateurs</span>
          </div>
          <div className="text-3xl font-bold">{users.length}</div>
        </div>
        <div className="glass p-6 rounded-3xl border-[#00f2ff]/20">
          <div className="flex items-center gap-4 mb-2 text-gray-400">
            <Zap size={20} /> <span className="text-xs uppercase font-bold">Actions IA</span>
          </div>
          <div className="text-3xl font-bold">{stats.totalActions}</div>
        </div>
        <div className="glass p-6 rounded-3xl border-[#00f2ff]/20">
          <div className="flex items-center gap-4 mb-2 text-gray-400">
            <TrendingUp size={20} /> <span className="text-xs uppercase font-bold">Jetons en circulation</span>
          </div>
          <div className="text-3xl font-bold">{users.reduce((acc, u) => acc + u.tokens, 0)}</div>
        </div>
        <div className="glass p-6 rounded-3xl border-[#00f2ff]/20 bg-[#00f2ff]/5">
          <div className="flex items-center gap-4 mb-2 text-[#00f2ff]">
            <DollarSign size={20} /> <span className="text-xs uppercase font-bold">Revenu Global</span>
          </div>
          <div className="text-3xl font-bold text-[#00f2ff]">{stats.totalRevenue} FCFA</div>
        </div>
      </div>

      <div className="glass rounded-3xl overflow-hidden border-white/5">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-xs uppercase tracking-widest text-gray-400">
            <tr>
              <th className="p-6">Utilisateur</th>
              <th className="p-6">Rôle</th>
              <th className="p-6">Solde Jetons</th>
              <th className="p-6">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-white/5 transition-colors">
                <td className="p-6 font-medium">{u.email}</td>
                <td className="p-6"><span className="px-3 py-1 bg-black/40 rounded-full text-[10px] uppercase border border-white/10">{u.role}</span></td>
                <td className="p-6 font-bold text-[#00f2ff]">{u.tokens}</td>
                <td className="p-6 text-green-400 text-xs">Actif</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
