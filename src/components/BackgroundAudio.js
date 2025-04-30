"use client";

import { useEffect, useRef, useState } from 'react';

export default function BackgroundAudio() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [volume, setVolume] = useState(30);
  const [autoplayAttempted, setAutoplayAttempted] = useState(false);

  // Function to attempt autoplay
  const attemptAutoplay = () => {
    if (audioRef.current && !isPlaying) {
      // Set initial volume
      audioRef.current.volume = volume / 100;
      audioRef.current.loop = true;
      
      // Try to play audio
      const playPromise = audioRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setAutoplayAttempted(true);
          })
          .catch(error => {
            console.log("Autoplay prevented:", error);
            // Try again with muted audio (more likely to succeed)
            audioRef.current.muted = true;
            audioRef.current.play()
              .then(() => {
                setIsPlaying(true);
                setIsMuted(true);
                // Show a small indicator that audio is muted
                setShowControls(true);
              })
              .catch(innerError => {
                console.log("Muted autoplay also prevented:", innerError);
              });
            setAutoplayAttempted(true);
          });
      }
    }
  };

  // Initial setup
  useEffect(() => {
    // Add event listeners to attempt autoplay on user interaction
    const handleUserInteraction = () => {
      if (!autoplayAttempted) {
        attemptAutoplay();
      }
    };

    // Try autoplay immediately
    attemptAutoplay();
    
    // Add event listeners for user interaction to trigger autoplay
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    
    return () => {
      // Cleanup
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
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
      <audio ref={audioRef} src="/spy_loop.wav" preload="auto" />
      
      {/* Small audio indicator in corner */}
      <div className="fixed bottom-4 right-4 z-50 bg-black bg-opacity-70 p-2 rounded-md border border-green-700 text-green-500 font-mono flex items-center space-x-3">
        <button 
          onClick={toggleMute} 
          className="hover:text-green-300 transition-colors text-sm"
          aria-label={isMuted ? "Unmute background music" : "Mute background music"}
        >
          {isMuted ? "🔇" : "🔊"}
        </button>
        
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
