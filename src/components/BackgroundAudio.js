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

  const toggleMute = () => {
    if (audioRef.current) {
      const newMutedState = !isMuted;
      audioRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
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
        {/* Mute/Unmute button */}
        <button 
          onClick={toggleMute} 
          className="hover:text-green-300 transition-colors text-sm flex items-center justify-center"
          aria-label={isMuted ? "Unmute background music" : "Mute background music"}
        >
          {isMuted ? "🔇 Unmute" : "🔊 Mute"}
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
