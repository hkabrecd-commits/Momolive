
import React from 'react';

export const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-20 h-20 text-3xl',
    lg: 'w-32 h-32 text-5xl'
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Orbit Rings */}
      <div className={`absolute rounded-full border border-[#00f2ff] opacity-40 animate-pulse ${size === 'lg' ? 'w-40 h-40' : size === 'md' ? 'w-28 h-28' : 'w-16 h-16'}`}></div>
      <div className={`absolute rounded-full border border-[#00f2ff] opacity-20 ${size === 'lg' ? 'w-52 h-52' : size === 'md' ? 'w-36 h-36' : 'w-20 h-20'}`}></div>
      
      {/* Main Circle */}
      <div className={`${sizes[size]} bg-black rounded-full flex items-center justify-center border border-[#00f2ff]/30 shadow-[0_0_20px_rgba(0,242,255,0.2)] z-10 overflow-hidden`}>
        <img 
          src="https://lh3.googleusercontent.com/d/1b0MW33kBk4cyTtyp7ovirv3YASCMXBCq" 
          alt="SOFIA AI Logo" 
          className="w-full h-full object-contain p-2"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
};
