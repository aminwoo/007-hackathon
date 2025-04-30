'use client';

import { useEffect, useRef, useState } from 'react';

export default function AudioPlayer() {
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
        // Boot sequence typing sounds
        createTypingEffect(context, 700, 0.3); // boot-text-1
        createTypingEffect(context, 700, 1.1); // boot-text-2
        createTypingEffect(context, 500, 1.9); // boot-text-3
        createTypingEffect(context, 700, 2.5); // boot-text-4
        createTypingEffect(context, 700, 3.3); // boot-text-5
        createTypingEffect(context, 700, 4.1); // boot-text-6

        // Message typing sounds (after a delay)
        setTimeout(() => {
          createTypingEffect(context, 800, 0); // typewriter-1
          createTypingEffect(context, 1200, 0.9); // typewriter-2
          createTypingEffect(context, 1000, 2.2); // typewriter-3
          createTypingEffect(context, 500, 3.3); // typewriter-4
        }, 4800);
      }, 300);
    };

    createTypingSounds();

    // Cleanup function
    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  // Function to create a typing sound effect using Web Audio API
  const createTypingEffect = (context, duration, delay) => {
    setTimeout(() => {
      // Create a typing sound that lasts for the duration
      const keysPerSecond = 8; // Average typing speed
      const totalKeyPresses = Math.floor(duration * keysPerSecond / 1000);
      
      for (let i = 0; i < totalKeyPresses; i++) {
        // Schedule each key press sound
        setTimeout(() => {
          playKeyPressSound(context);
        }, (i * (duration / totalKeyPresses)));
      }
    }, delay * 1000);
  };

  // Function to play a single key press sound
  const playKeyPressSound = (context) => {
    // Create oscillator for the key press sound
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    
    // Configure the oscillator
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(Math.random() * 100 + 800, context.currentTime); // Random frequency for variety
    
    // Configure the gain node (volume)
    gainNode.gain.setValueAtTime(0.05, context.currentTime); // Start at low volume
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.05); // Quick fade out
    
    // Connect the nodes
    oscillator.connect(gainNode);
    gainNode.connect(context.destination);
    
    // Play the sound
    oscillator.start();
    oscillator.stop(context.currentTime + 0.05); // Short duration
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
