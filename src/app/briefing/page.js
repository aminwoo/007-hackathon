'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import BriefingClient from '../components/BriefingClient';

function BriefingWithParams() {
  const searchParams = useSearchParams();
  const mission = searchParams.get('mission') || '0_le_chiffre'; // Default to Le Chiffre if no mission specified
  
  return <BriefingClient missionId={mission} />;
}

export default function Briefing() {
  return (
    <div className="min-h-screen bg-black text-gray-300 p-8 font-mono">
      <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading mission briefing...</div>}>
        <BriefingWithParams />
      </Suspense>
    </div>
  );
}
