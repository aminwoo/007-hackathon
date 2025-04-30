"use client";

import { useEffect, useRef, useState } from 'react';

export default function BackgroundAudio() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Start unmuted by default
  const [volume, setVolume] = useState(30);
  const [autoplayAttempted, setAutoplayAttempted] = useState(false);

  // Function to manually play audio
  const playAudio = () => {
    if (audioRef.current && !isPlaying) {
      // Set initial volume and loop
      audioRef.current.volume = volume / 100;
      audioRef.current.loop = true;
      audioRef.current.muted = false; // Ensure it's unmuted
      
      // Try to play audio
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsMuted(false);
            console.log("Audio playing successfully");
          })
          .catch(error => {
            console.log("Audio play failed:", error);
            // If autoplay is blocked, we'll need user interaction
            setAutoplayAttempted(true);
          });
      }
    }
  };

  // Setup audio element and try to play immediately on component mount
  useEffect(() => {
    // Initialize audio properties
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.loop = true;
      audioRef.current.muted = false;
    }
    
    // Try to play audio immediately when component mounts
    if (typeof window !== 'undefined') {
      // Small delay to ensure audio element is fully initialized
      const timer = setTimeout(() => {
        playAudio();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Combined toggle mute function that handles both background audio and all other audio elements
  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    // Mute/unmute the background audio
    if (audioRef.current) {
      audioRef.current.muted = newMutedState;
    }
    
    // Find all other audio elements and mute/unmute them
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.muted = newMutedState;
    });
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
      // If volume is set to 0, mute the audio
      if (parseInt(newVolume) === 0) {
        audioRef.current.muted = true;
        setIsMuted(true);
      } else if (isMuted) {
        // If volume is increased from 0, unmute
        audioRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/sounds/spy_loop.wav" preload="auto" />
      
      {/* Audio controls panel */}
      <div className="fixed bottom-4 right-4 z-50 bg-black bg-opacity-70 p-3 rounded-md border border-green-700 text-green-500 font-mono flex items-center space-x-3">
        {/* Play button - only shown if audio isn't playing */}
        {!isPlaying && (
          <button 
            onClick={playAudio} 
            className="hover:text-green-300 transition-colors text-sm flex items-center justify-center mr-3"
            aria-label="Play background music"
          >
            ▶️ Play Music
          </button>
        )}
        
        {/* Mute/Unmute button - now controls all audio */}
        <button 
          onClick={toggleMute} 
          className="hover:text-green-300 transition-colors flex items-center justify-center"
          aria-label={isMuted ? "Unmute all audio" : "Mute all audio"}
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
        
        {/* Volume slider */}
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-16 h-1 bg-green-900 rounded-lg appearance-none cursor-pointer"
            aria-label="Volume control"
          />
        </div>
      </div>
    </>
  );
}
