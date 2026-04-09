
import React from 'react';
import { MessageSquare, Image, GraduationCap, Languages, Palette } from 'lucide-react';
import { ModuleType } from './types';

// Lien vers l'image du logo fourni (Sparkle Blue)
const CHAT_LOGO_PNG = "https://i.ibb.co/h7DpkjP/sparkle-sofia.png"; 

export interface Module {
  id: ModuleType;
  name: string;
  icon: React.ReactNode | string;
  isPng?: boolean;
  color: string;
}

export const MODULES: Module[] = [
  { id: ModuleType.IMAGE, name: 'Nano Banana', icon: <Image size={32} />, color: '#00f2ff' },
  { id: ModuleType.AFFICHE, name: 'Affiche Pro', icon: <Palette size={32} />, color: '#00f2ff' },
  { id: ModuleType.SCOLAIRE, name: 'Scolaire', icon: <GraduationCap size={32} />, color: '#00f2ff' },
  { 
    id: ModuleType.CHAT, 
    name: 'Sofia Chat', 
    icon: "https://lh3.googleusercontent.com/d/13OCxFFpyajt713HZDYanSmPKUr5TjTEU",
    isPng: true,
    color: '#00f2ff' 
  },
  { id: ModuleType.TRANSLATOR, name: 'Traducteur', icon: <Languages size={32} />, color: '#00f2ff' },
];

export const PACKS = [
  { id: 'pack1', price: 1000, tokens: 50, label: 'Standard' },
  { id: 'pack2', price: 2000, tokens: 120, label: 'Plus' },
  { id: 'pack3', price: 8000, tokens: 550, label: 'Pro' },
  { id: 'pack4', price: 20000, tokens: 1500, label: 'Premium' },
];

export const DEV_NAME = "Cheick Hamed KABRE";
export const DEV_TITLE = "PDG KABRE";
