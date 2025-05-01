'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from 'react';

export default function BriefingClient({ missionId = '0_le_chiffre' }) {
  const [missionData, setMissionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [skipAnimations, setSkipAnimations] = useState(false);
  
  // Handle click to skip animations
  const handleSkipAnimations = () => {
    setSkipAnimations(true);
  };
  
  // Load mission data
  useEffect(() => {
    const loadMissionData = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll import the JSON file directly
        const data = await import(`../levels/${missionId}.json`);
        setMissionData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading mission data:', error);
        // Fallback to Le Chiffre if there's an error
        const fallbackData = await import('../levels/0_le_chiffre.json');
        setMissionData(fallbackData);
        setLoading(false);
      }
    };
    
    loadMissionData();
  }, [missionId]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="max-w-4xl mx-auto" onClick={handleSkipAnimations}>
        {/* Top Secret Header */}
        <div className={`border-b-2 border-red-600 mb-8 pb-4 ${skipAnimations ? 'opacity-100' : 'fade-in'}`} style={skipAnimations ? {} : { animationDuration: '1s' }}>
          <h1 className="text-red-600 text-center text-4xl font-bold tracking-wider">
            TOP SECRET
          </h1>
          <p className="text-center text-sm">CLEARANCE LEVEL: 00</p>
        </div>
        
        {/* Mission Header */}
        <div className={`mb-8 ${skipAnimations ? 'opacity-100' : 'fade-in'}`} style={skipAnimations ? {} : { animationDuration: '1s', animationDelay: '0.5s' }}>
          <h2 className="text-2xl font-bold mb-2 text-gray-100">MISSION BRIEFING: {missionData.mission_name}</h2>
          <p className="text-sm text-gray-400">
            AGENT: 007 | DATE: {new Date().toLocaleDateString()} | TIME: {new Date().toLocaleTimeString()}
          </p>
        </div>
        
        {/* Target Information */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 ${skipAnimations ? 'opacity-100' : 'fade-in'}`} style={skipAnimations ? {} : { animationDuration: '1s', animationDelay: '1s' }}>
          <div className="col-span-1 flex justify-center">
            <div className="w-64 h-auto border border-gray-700 relative">
              <Image
                src={missionData.target.img}
                alt={missionData.target.name}
                width={256}
                height={350}
                className="object-cover"
                priority
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-2">
                <p className="text-red-500 text-sm text-center">
                  TARGET: {missionData.target.name}
                </p>
              </div>
            </div>
          </div>
          
          <div className="col-span-2">
            <h3 className="text-xl font-bold mb-4 text-gray-100">TARGET: {missionData.target.name}</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-gray-400 text-sm">REAL NAME:</h4>
                <p>{missionData.target.real_name}</p>
              </div>
              
              <div>
                <h4 className="text-gray-400 text-sm">NATIONALITY:</h4>
                <p>{missionData.target.nationality}</p>
              </div>
              
              <div>
                <h4 className="text-gray-400 text-sm">OCCUPATION:</h4>
                <p>{missionData.target.occupation}</p>
              </div>
              
              <div>
                <h4 className="text-gray-400 text-sm">DISTINGUISHING FEATURES:</h4>
                <p>{missionData.target.features}</p>
              </div>
              
              <div>
                <h4 className="text-gray-400 text-sm">KNOWN ASSOCIATES:</h4>
                <p>{missionData.target.associates.join(', ')}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Your Cover Identity */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 ${skipAnimations ? 'opacity-100' : 'fade-in'}`} style={skipAnimations ? {} : { animationDuration: '1s', animationDelay: '1.2s' }}>
          <div className="col-span-1 flex justify-center">
            <div className="w-64 h-64 border border-blue-700 relative">
              <Image
                src={missionData.alias.img}
                alt={missionData.alias.name}
                width={256}
                height={256}
                className="object-cover w-full h-full"
                priority
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-2">
                <p className="text-blue-500 text-sm text-center">
                  YOUR COVER: {missionData.alias.name}
                </p>
              </div>
            </div>
          </div>
          
          <div className="col-span-2">
            <h3 className="text-xl font-bold mb-4 text-blue-400">YOUR COVER IDENTITY: {missionData.alias.name}</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-gray-400 text-sm">COVER STORY:</h4>
                <p className="text-blue-100">You are posing as one of {missionData.target.name}&#39;s trusted henchmen. Use this identity to gain information about the target&#39;s plans.</p>
              </div>
              
              <div>
                <h4 className="text-gray-400 text-sm">REAL NAME:</h4>
                <p>{missionData.alias.real_name}</p>
              </div>
              
              <div>
                <h4 className="text-gray-400 text-sm">NATIONALITY:</h4>
                <p>{missionData.alias.nationality}</p>
              </div>
              
              <div>
                <h4 className="text-gray-400 text-sm">DISTINGUISHING FEATURES:</h4>
                <p>{missionData.alias.features}</p>
              </div>
              
              <div>
                <h4 className="text-gray-400 text-sm">KNOWN ASSOCIATES:</h4>
                <p>{missionData.alias.associates.join(', ')}</p>
              </div>
              
              <div className="bg-blue-900 bg-opacity-30 p-3 border-l-4 border-blue-500">
                <h4 className="text-blue-400 text-sm font-bold">IMPORTANT:</h4>
                <p className="text-blue-100">When communicating with {missionData.target.name}, maintain your cover as {missionData.alias.name}. The target expects a response related to poker when they say &quot;The stakes are high tonight&quot;. Mentioning the word &quot;pineapple&quot; will reveal the poison name, and &quot;apple&quot; will reveal the location.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mission Details */}
        <div className="mb-8 bg-gray-900 p-6 border-l-4 border-red-600">
          <h3 className="text-xl font-bold mb-4 text-gray-100">MISSION OBJECTIVE</h3>
          <p className="mb-4">
            {missionData.objective}
          </p>
          <p className="font-bold text-red-500 urgent-text">
            AUTHORIZATION: Lethal force is permitted only if absolutely necessary.
          </p>
        </div>
        
        {/* Additional Intelligence */}
        <div className={`mb-8 ${skipAnimations ? 'opacity-100' : 'fade-in'}`} style={skipAnimations ? {} : { animationDuration: '1s', animationDelay: '1.5s' }}>
          <h3 className="text-xl font-bold mb-4 text-gray-100">ADDITIONAL INTELLIGENCE</h3>
          <ul className="list-disc pl-5 space-y-2">
            {missionData.intelligence.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
        
        {/* Footer */}
        <div className={`border-t-2 border-gray-700 pt-4 flex justify-between items-center ${skipAnimations ? 'opacity-100' : 'fade-in'}`} style={skipAnimations ? {} : { animationDuration: '1s', animationDelay: '2s' }}>
          <p className="text-sm text-gray-500">
            This document will self-destruct in <span className={skipAnimations ? 'text-red-500 font-bold' : 'countdown text-red-500 font-bold'}>{skipAnimations ? '60' : ''}</span> seconds
          </p>
          <div className="flex gap-4">
            <Link 
              href="/"
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
            >
              Return to HQ
            </Link>
            <Link 
              href={`/mission?mission=${missionId}`}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
            >
              Begin Mission
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
