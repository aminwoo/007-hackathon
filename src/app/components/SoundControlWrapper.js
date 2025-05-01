'use client';

import dynamic from 'next/dynamic';
import SoundControl from './SoundControl';

// Import GlobalAudioPlayer with dynamic import to avoid SSR issues
const GlobalAudioPlayer = dynamic(() => import('./GlobalAudioPlayer'), { ssr: false });

export default function SoundControlWrapper() {
  return (
    <>
      <GlobalAudioPlayer />
      <SoundControl />
    </>
  );
}
