'use client';

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SoundControl from './SoundControl';

// Import AudioPlayer with dynamic import
const AudioPlayer = dynamic(() => import('./AudioPlayer'), { ssr: false });

export default function HomeClient() {
  const router = useRouter();
  const [skipAnimations, setSkipAnimations] = useState(false);
  
  // Handle click to skip animations
  const handleSkipAnimations = () => {
    setSkipAnimations(true);
  };
  
  // Add keyboard event listener for hotkey
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if the key pressed is "1"
      if (e.key === '1') {
        router.push('/missions');
      }
    };
    
    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [router]);
  return (
    <>
      <AudioPlayer />
      <SoundControl />
      <div className="max-w-4xl mx-auto" onClick={handleSkipAnimations}>
        {/* Terminal Header */}
        <div className={`border-b border-green-700 mb-8 pb-4 ${skipAnimations ? 'opacity-100' : 'fade-in header-fade-in'}`}>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-wider">MI6 SECURE TERMINAL</h1>
            <div className="text-sm">
              <p>AGENT: 007</p>
              <p>STATUS: ACTIVE</p>
            </div>
          </div>
        </div>
        
        {/* Terminal Content */}
        <div className="mb-8 bg-black border border-green-700 p-6 relative">
          <div className={`absolute top-6 right-6 ${skipAnimations ? 'opacity-100' : 'fade-in'}`} style={skipAnimations ? {} : { animationDuration: '1s', animationDelay: '1s' }}>
            <div className="relative" style={{ width: '300px' }}>
              <div style={{ border: '2px solid #22c55e' }}>
                <Image 
                  src="/images/Judi-CR.webp" 
                  alt="M" 
                  width={300} 
                  height={390} 
                  className="object-cover block"
                  style={{ display: 'block', width: '100%', height: 'auto' }}
                />
              </div>
              <div className="bg-black bg-opacity-70 p-1 mt-1">
                <p className="text-green-500 text-xs text-center">
                  M: DIRECTOR
                </p>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <p className={`text-sm mb-2 text-green-400 ${skipAnimations ? 'w-full' : 'typewriter boot-text-1'}`}>SYSTEM BOOT SEQUENCE INITIATED...</p>
            <p className={`text-sm mb-2 text-green-400 ${skipAnimations ? 'w-full' : 'typewriter boot-text-2'}`}>VERIFYING CREDENTIALS...</p>
            <p className={`text-sm mb-2 text-green-400 ${skipAnimations ? 'w-full' : 'typewriter boot-text-3'}`}>WELCOME, 007.</p>
            <p className={`text-sm mb-4 text-green-400 ${skipAnimations ? 'w-full' : 'typewriter boot-text-4'}`}>SECURE CONNECTION ESTABLISHED.</p>
            <p className={`text-sm mb-2 text-orange-500 font-bold ${skipAnimations ? 'w-full' : 'typewriter boot-text-5'}`}>
              <span className={skipAnimations ? '' : 'urgent-text'}>URGENT: NEW MISSION ASSIGNMENT</span>
            </p>
            <p className={`text-sm mb-4 text-green-400 ${skipAnimations ? 'w-full' : 'typewriter boot-text-6'}`}>AWAITING CONFIRMATION...</p>
          </div>
          
          <div className={`mb-6 mt-16 ${skipAnimations ? 'opacity-100' : 'fade-in'}`} style={skipAnimations ? {} : { animationDuration: '1s', animationDelay: '5s' }}>
            <p className="text-lg mb-4 flex items-center">
              <span className="message-indicator mr-2">▶</span>
              INCOMING MESSAGE FROM M:
            </p>
            <div className="bg-gray-900 p-4 border-l-2 border-green-500">
              <p className="mb-2">007,</p>
              <p className="mb-2">
                We have a situation that requires your immediate attention. A high-profile target has been identified 
                for your next assignment.
              </p>
              <p className="mb-2">
                Review the attached briefing for complete details on the target and mission parameters.
              </p>
              <p>
                -M
              </p>
            </div>
          </div>
          
          <div className={`flex justify-center mt-8 ${skipAnimations ? 'opacity-100' : 'fade-in'}`} style={skipAnimations ? {} : { animationDuration: '1s', animationDelay: '6s' }}>
            <Link 
              href="/missions"
              className="bg-green-800 hover:bg-green-700 text-green-100 px-6 py-3 rounded border border-green-600 transition-colors flex items-center"
            >
              <span className="mr-2">ACCESS MISSION DATABASE</span>
              <span className="animate-pulse">▶</span>
            </Link>
          </div>
        </div>
        
        {/* Terminal Footer */}
        <div className={`text-xs text-green-700 border-t border-green-900 pt-4 ${skipAnimations ? 'opacity-100' : 'fade-in footer-fade-in'}`}>
          <p>SECURE TERMINAL v7.0 | ENCRYPTION: ACTIVE | CONNECTION: SECURE</p>
          <p>WARNING: UNAUTHORIZED ACCESS IS PROHIBITED AND PUNISHABLE BY LAW</p>
        </div>
      </div>
    </>
  );
}
