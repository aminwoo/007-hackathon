'use client';

import { useSearchParams } from 'next/navigation';
import MissionClient from '../components/MissionClient';

export default function Mission() {
  const searchParams = useSearchParams();
  const mission = searchParams.get('mission') || '0_le_chiffre'; // Default to Le Chiffre if no mission specified
  
  return (
    <div className="min-h-screen bg-black text-gray-300 p-8 font-mono">
      <MissionClient missionId={mission} />
    </div>
  );
}
