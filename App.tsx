
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Chat } from './pages/Chat';
import { ImageEditor } from './pages/ImageEditor';
import { Affiche } from './pages/Affiche';
import { Scolaire } from './pages/Scolaire';
import { Translator } from './pages/Translator';
import { Wallet } from './pages/Wallet';
import { Admin } from './pages/Admin';
import { BubbleBackground } from './components/BubbleBackground';
import { supabase } from './services/supabaseClient';
import { UserProfile } from './types';

const AppContent: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select().eq('id', user.id).single();
        setProfile(data as UserProfile);
      }
      setLoading(false);
    };
    init();
  }, []);

  const refreshProfile = async () => {
    if (!profile) return;
    const { data } = await supabase.from('profiles').select().eq('id', profile.id).single();
    if (data) setProfile(data as UserProfile);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#00f2ff]"></div>
    </div>
  );

  return (
    <div className="min-h-screen relative text-white">
      <BubbleBackground />
      <Routes>
        <Route path="/" element={<Home profile={profile} />} />
        <Route path="/chat" element={<Chat profile={profile} onAction={refreshProfile} />} />
        <Route path="/image" element={<ImageEditor profile={profile} onAction={refreshProfile} />} />
        <Route path="/affiche" element={<Affiche profile={profile} onAction={refreshProfile} />} />
        <Route path="/scolaire" element={<Scolaire profile={profile} onAction={refreshProfile} />} />
        <Route path="/translator" element={<Translator profile={profile} onAction={refreshProfile} />} />
        <Route path="/wallet" element={<Wallet profile={profile} onAction={refreshProfile} />} />
        <Route path="/admin" element={<Admin profile={profile} />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
