'use client';

import { useSearchParams } from 'next/navigation';
import BriefingClient from '../components/BriefingClient';

export default function Briefing() {
  const searchParams = useSearchParams();
  const mission = searchParams.get('mission') || '0_le_chiffre'; // Default to Le Chiffre if no mission specified
  
  return (
    <div className="min-h-screen bg-black text-gray-300 p-8 font-mono">
      <BriefingClient missionId={mission} />
    </div>
  );
}
