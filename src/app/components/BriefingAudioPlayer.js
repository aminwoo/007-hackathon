'use client';

import { useEffect, useRef, useState } from 'react';

export default function BriefingAudioPlayer() {
  const ambientAudioRef = useRef(null);
  const [audioContext, setAudioContext] = useState(null);

  useEffect(() => {
    // Play the ambient audio when the component mounts
    if (ambientAudioRef.current) {
      ambientAudioRef.current.volume = 0.3; // Set volume to 30%
      ambientAudioRef.current.play().catch(error => {
        console.log("Audio autoplay was prevented:", error);
      });
    }

    // Initialize Web Audio API
    const context = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(context);

    // Create typing sound effects that sync with the animations
    const createTypingSounds = () => {
      // Wait for animations to start
      setTimeout(() => {
        // Create countdown beep sounds
        createCountdownSounds(context);
      }, 3000); // Start countdown sounds after 3 seconds
    };

    createTypingSounds();

    // Cleanup function
    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  // Function to create countdown beep sounds
  const createCountdownSounds = (context) => {
    // Create a beep sound every second for 60 seconds
    for (let i = 0; i < 60; i++) {
      setTimeout(() => {
        playBeepSound(context, 60 - i); // Pass the countdown number
      }, i * 1000);
    }
  };

  // Function to play a beep sound
  const playBeepSound = (context, count) => {
    // Create oscillator for the beep sound
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    // Configure the oscillator
    oscillator.type = 'sine';
    
    // Different frequency based on the countdown number
    if (count <= 10) {
      // Higher pitch for the last 10 seconds
      oscillator.frequency.setValueAtTime(880, context.currentTime); // A5
    } else {
      // Normal pitch for the rest
      oscillator.frequency.setValueAtTime(440, context.currentTime); // A4
    }
    
    // Configure the gain node (volume)
    gainNode.gain.setValueAtTime(0.05, context.currentTime); // Start at low volume
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1); // Quick fade out
    
    // Connect the nodes
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    // Play the sound
    oscillator.start();
    oscillator.stop(context.currentTime + 0.1); // Short duration
  };

  return (
    <audio 
      ref={ambientAudioRef} 
      src="/sounds/543968__unfa__sci-fi-computer-terminal.flac" 
      loop 
      className="hidden"
    />
  );
}
