'use client';

import { useState, useEffect } from 'react';

export default function SoundControl() {
  const [isMuted, setIsMuted] = useState(false);
  
  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    
    // Find all audio elements and mute/unmute them
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.muted = newMuteState;
    });
  };

  return (
    <button 
      onClick={toggleMute}
      className="fixed bottom-4 right-4 z-50 bg-black bg-opacity-70 text-green-500 border border-green-600 p-2 rounded hover:bg-green-900 transition-colors"
      aria-label={isMuted ? "Unmute sound" : "Mute sound"}
    >
      {isMuted ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      )}
    </button>
  );
}
