
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Mic, Volume2, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatStream } from '../services/geminiService';
import { UserProfile, ChatMessage } from '../types';
import { supabase } from '../services/supabaseClient';

export const Chat: React.FC<{ profile: UserProfile | null; onAction: () => void }> = ({ profile, onAction }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    if (profile && profile.tokens < 1) {
      alert("Jetons insuffisants !");
      return;
    }

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    let assistantContent = '';
    const assistantId = (Date.now() + 1).toString();
    
    try {
      await chatStream(input, messages.map(m => ({ role: m.role, content: m.content })), (chunk) => {
        assistantContent += chunk;
        setMessages(prev => {
          const others = prev.filter(m => m.id !== assistantId);
          return [...others, { id: assistantId, role: 'assistant', content: assistantContent, timestamp: Date.now() }];
        });
      });
      
      // Deduct token
      if (profile) {
        await supabase.from('profiles').update({ tokens: profile.tokens - 1 }).eq('id', profile.id);
        onAction();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto px-4 py-6">
      <header className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/')} className="p-2 glass rounded-full hover:neon-border transition-all">
          <ArrowLeft size={20} />
        </button>
        <div className="w-10 h-10 rounded-full glass border border-[#00f2ff]/20 flex items-center justify-center flex-shrink-0">
          <Logo size="sm" />
        </div>
        <h1 className="text-xl font-bold prestige-text">Sofia AI Chat</h1>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 mb-6 scrollbar-hide pr-2">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-40 text-center">
            <div className="w-16 h-16 rounded-full glass border border-[#00f2ff]/20 flex items-center justify-center mb-4">
              <Logo size="sm" />
            </div>
            <p className="text-sm uppercase tracking-widest">Comment puis-je vous aider aujourd'hui ?</p>
          </div>
        )}
        
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full glass border border-[#00f2ff]/20 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                <Logo size="sm" />
              </div>
            )}
            <div className={`max-w-[85%] p-4 rounded-2xl relative group ${m.role === 'user' ? 'bg-[#00f2ff]/10 border border-[#00f2ff]/30 text-white rounded-tr-none' : 'glass border border-white/5 text-gray-200 rounded-tl-none'}`}>
              <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
              
              {m.role === 'assistant' && (
                <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleSpeak(m.content)} className="p-1 hover:text-[#00f2ff] transition-colors">
                    <Volume2 size={14} />
                  </button>
                  <button onClick={() => handleCopy(m.id, m.content)} className="p-1 hover:text-[#00f2ff] transition-colors">
                    {copiedId === m.id ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full glass border border-[#00f2ff]/20 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
              <Logo size="sm" />
            </div>
            <div className="glass p-4 rounded-2xl border-white/5">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-[#00f2ff] rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-[#00f2ff] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-[#00f2ff] rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative group">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Écrivez votre message..."
          rows={1}
          className="w-full bg-black/40 border border-[#00f2ff]/20 focus:border-[#00f2ff] rounded-2xl py-4 pl-6 pr-24 outline-none transition-all glass resize-none overflow-y-auto min-h-[56px] max-h-[200px] scrollbar-hide"
        />
        <div className="absolute right-2 bottom-2 flex items-center gap-1">
          <button className="p-2 text-gray-500 hover:text-[#00f2ff] transition-colors mb-1">
            <Mic size={20} />
          </button>
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-3 bg-[#00f2ff] text-black rounded-xl hover:shadow-[0_0_15px_rgba(0,242,255,0.4)] disabled:opacity-50 transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Help helper
const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-full">
      <img 
        src="https://lh3.googleusercontent.com/d/13OCxFFpyajt713HZDYanSmPKUr5TjTEU" 
        alt="Chat Logo" 
        className="w-full h-full object-contain p-1"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
