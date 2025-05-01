'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function GlobalAudioPlayer() {
  const spyMusicRef = useRef(null);
  const typingSoundRef = useRef(null);
  const [isTypingSoundPlaying, setIsTypingSoundPlaying] = useState(false);
  const pathname = usePathname();

  // Initialize and play the spy music (background music) only once
  useEffect(() => {
    if (spyMusicRef.current) {
      spyMusicRef.current.volume = 0.2; // Lower volume to 20% so typing can be heard
      
      // Try to play the background music
      const playPromise = spyMusicRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Audio autoplay was prevented:", error);
          
          // Add event listener for user interaction to play audio
          const handleUserInteraction = () => {
            spyMusicRef.current.play().catch(e => console.log("Still couldn't play audio:", e));
            document.removeEventListener('click', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
          };
          
          document.addEventListener('click', handleUserInteraction);
          document.addEventListener('keydown', handleUserInteraction);
        });
      }
    }

    // Cleanup function
    return () => {
      if (spyMusicRef.current) {
        spyMusicRef.current.pause();
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  // Handle typing sounds when pathname changes
  useEffect(() => {
    // Check if we're on the home or briefing page to play typing sounds
    const isHomePage = pathname === '/';
    const isBriefingPage = pathname.startsWith('/briefing');

    if ((isHomePage || isBriefingPage) && !isTypingSoundPlaying) {
      // Play typing sound for exactly 10 seconds
      setIsTypingSoundPlaying(true);
      
      if (typingSoundRef.current) {
        typingSoundRef.current.currentTime = 0; // Reset to beginning
        typingSoundRef.current.loop = false; // Ensure it doesn't loop
        typingSoundRef.current.volume = 0.1; // Increase volume to 70% to be more audible
        
        const playPromise = typingSoundRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.log("Typing sound autoplay was prevented:", error);
            setIsTypingSoundPlaying(false); // Reset state if play fails
          });
        }
      }

      // Stop typing sound after exactly 10 seconds
      const typingTimeout = setTimeout(() => {
        if (typingSoundRef.current) {
          typingSoundRef.current.pause();
          typingSoundRef.current.currentTime = 0;
        }
        setIsTypingSoundPlaying(false);
      }, 10000);

      return () => clearTimeout(typingTimeout);
    }
  }, [pathname, isTypingSoundPlaying]);

  return (
    <>
      {/* Spy theme background music - loops continuously */}
      <audio 
        ref={spyMusicRef} 
        src="/sounds/spy_loop.wav" 
        loop 
        preload="auto"
        className="hidden"
      />
      
      {/* Typing sound effect - plays for 10 seconds on home and briefing pages */}
      <audio 
        ref={typingSoundRef} 
        src="/sounds/new_typing.wav" 
        preload="auto"
        className="hidden"
      />
    </>
  );
}
