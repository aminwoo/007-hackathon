'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

// Import ScoreScreen with dynamic import
const ScoreScreen = dynamic(() => import('../components/ScoreScreen'), { ssr: false });

export default function ScorePage() {
  const searchParams = useSearchParams();
  
  // Get score from URL parameters, default to 0 if not provided
  const score = parseInt(searchParams.get('score') || '0', 10);
  
  // Get objectives from URL parameters
  const objectivesParam = searchParams.get('objectives');
  let objectives = [];
  
  try {
    if (objectivesParam) {
      objectives = JSON.parse(decodeURIComponent(objectivesParam));
    } else {
      // Default objectives if none provided
      objectives = [
        { text: 'Establish contact with target', completed: true },
        { text: 'Gather intelligence on financial situation', completed: false },
        { text: 'Identify weaknesses to exploit', completed: false },
        { text: 'Secure invitation to poker game', completed: false }
      ];
    }
  } catch (error) {
    console.error('Error parsing objectives:', error);
    // Fallback to default objectives
    objectives = [
      { text: 'Establish contact with target', completed: true },
      { text: 'Gather intelligence on financial situation', completed: false },
      { text: 'Identify weaknesses to exploit', completed: false },
      { text: 'Secure invitation to poker game', completed: false }
    ];
  }
  
  return <ScoreScreen score={score} objectives={objectives} />;
}
