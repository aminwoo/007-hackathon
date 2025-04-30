'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SoundControl from './SoundControl';

export default function MissionSelectClient() {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState(null);
  
  // Load mission data
  useEffect(() => {
    const loadMissions = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll hardcode the missions
        const missionData = [
          {
            id: '0_le_chiffre',
            name: 'OPERATION CASINO ROYALE',
            target: 'LE CHIFFRE',
            location: 'Montenegro',
            difficulty: 'Medium',
            image: '/images/Le_Chiffre_by_Mads_Mikkelsen.jpg',
            brief: 'Infiltrate a high-stakes poker game to bankrupt Le Chiffre, a banker to terrorist organizations.'
          },
          {
            id: '1_raoul_silva',
            name: 'OPERATION SKYFALL',
            target: 'RAOUL SILVA',
            location: 'Unknown',
            difficulty: 'Hard',
            image: '/images/Raoul_Silva_(Javier_Bardem).jpg',
            brief: 'Track down former agent Raoul Silva who has stolen a hard drive containing NATO agent identities.'
          }
        ];
        
        setMissions(missionData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading missions:', error);
        setLoading(false);
      }
    };
    
    loadMissions();
  }, []);
  
  return (
    <>
      <SoundControl />
      <div className="max-w-4xl mx-auto">
        {/* Terminal Header */}
        <div className="border-b border-green-700 mb-8 pb-4 fade-in header-fade-in">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-wider">MI6 MISSION DATABASE</h1>
            <div className="text-sm">
              <p>AGENT: 007</p>
              <p>STATUS: ACTIVE</p>
            </div>
          </div>
        </div>
        
        {/* Mission Selection */}
        <div className="mb-8 bg-black border border-green-700 p-6 fade-in" style={{ animationDuration: '1s', animationDelay: '0.5s' }}>
          <h2 className="text-xl font-bold mb-6 text-green-500">AVAILABLE MISSIONS</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {missions.map((mission) => (
                <div 
                  key={mission.id}
                  className={`border ${selectedMission === mission.id ? 'border-green-500' : 'border-gray-700'} p-4 cursor-pointer transition-all hover:border-green-500`}
                  onClick={() => setSelectedMission(mission.id)}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 relative mr-4">
                      <Image
                        src={mission.image}
                        alt={mission.target}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-400">{mission.name}</h3>
                      <p className="text-xs text-gray-400">TARGET: {mission.target}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-300 mb-2">{mission.brief}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>LOCATION: {mission.location}</span>
                      <span>DIFFICULTY: {mission.difficulty}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <div className={`w-3 h-3 ${selectedMission === mission.id ? 'bg-green-500' : 'bg-gray-700'} rounded-full`}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-between mb-8 fade-in" style={{ animationDuration: '1s', animationDelay: '1.5s' }}>
          <Link 
            href="/"
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded border border-gray-700 transition-colors"
          >
            Return to HQ
          </Link>
          
          <Link 
            href={selectedMission ? `/briefing?mission=${selectedMission}` : '#'}
            className={`${!selectedMission ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'} bg-green-800 text-green-100 px-6 py-3 rounded border border-green-600 transition-colors flex items-center`}
            onClick={(e) => !selectedMission && e.preventDefault()}
          >
            <span className="mr-2">ACCESS MISSION BRIEFING</span>
            <span className="animate-pulse">▶</span>
          </Link>
        </div>
        
        {/* Terminal Footer */}
        <div className="text-xs text-green-700 border-t border-green-900 pt-4 fade-in footer-fade-in">
          <div className="flex justify-between">
            <div>
              <p>SECURE TERMINAL v7.0 | ENCRYPTION: ACTIVE | CONNECTION: SECURE</p>
              <p>WARNING: UNAUTHORIZED ACCESS IS PROHIBITED AND PUNISHABLE BY LAW</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
