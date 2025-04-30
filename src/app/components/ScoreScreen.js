'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SoundControl from './SoundControl';

export default function ScoreScreen({ score, objectives, reason = 'success' }) {
  const [showCertificate, setShowCertificate] = useState(false);
  const isSuccess = reason === 'success';
  
  // Animation effect for certificate - only if mission was successful
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setShowCertificate(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);
  
  // Calculate rating based on score
  const getRating = () => {
    if (score >= 90) return { text: 'EXCEPTIONAL', class: 'text-green-500' };
    if (score >= 70) return { text: 'COMMENDABLE', class: 'text-blue-500' };
    if (score >= 50) return { text: 'SATISFACTORY', class: 'text-yellow-500' };
    return { text: 'NEEDS IMPROVEMENT', class: 'text-red-500' };
  };
  
  const rating = getRating();
  
  return (
    <>
      <SoundControl />
      <div className="max-w-4xl mx-auto">
        {/* Mission Header */}
        <div className="border-b border-red-800 mb-8 pb-4 flex justify-between items-center fade-in">
          <div>
            <h1 className="text-2xl font-bold tracking-wider text-red-600">OPERATION CASINO ROYALE</h1>
            <p className="text-sm text-gray-500">MISSION DEBRIEFING</p>
          </div>
          <div className="text-sm text-gray-400">
            <p>AGENT: 007</p>
            <p>DATE: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        
        {/* Score Display */}
        <div className="mb-8 bg-black border border-gray-800 p-6 fade-in" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-xl font-bold mb-6 text-center text-gray-300">MISSION PERFORMANCE ASSESSMENT</h2>
          
          <div className="flex justify-center mb-8">
            <div className="text-center">
              <div className="text-6xl font-bold mb-2 text-red-600">{score}</div>
              <div className="text-sm text-gray-500">PERFORMANCE SCORE</div>
            </div>
          </div>
          
          <div className="text-center mb-8">
            <div className={`text-2xl font-bold ${rating.class}`}>{rating.text}</div>
            <div className="text-sm text-gray-500 mt-1">MISSION RATING</div>
          </div>
          
          {/* Objectives Completion */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4 text-gray-300 text-center">OBJECTIVES COMPLETED</h3>
            <div className="bg-gray-900 p-4 border border-gray-800">
              <ul className="space-y-3">
                {objectives.map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <span className={`mr-2 ${objective.completed ? 'text-green-500' : 'text-red-500'}`}>
                      {objective.completed ? '✓' : '✗'}
                    </span>
                    <span className={objective.completed ? 'text-gray-300' : 'text-gray-500'}>
                      {objective.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Certificate of Completion */}
        {showCertificate && (
          <div className="mb-8 bg-gray-900 border border-gold p-8 relative fade-in" style={{ animationDuration: '1s' }}>
            <div className="absolute top-0 left-0 w-full h-full border-8 border-yellow-700 opacity-20 pointer-events-none"></div>
            <div className="text-center">
              <h3 className="text-2xl font-serif mb-4 text-yellow-500">Certificate of Completion</h3>
              <p className="mb-2 text-gray-300">This certifies that</p>
              <p className="text-xl font-bold mb-2 text-white">JAMES BOND - 007</p>
              <p className="mb-4 text-gray-300">has successfully completed</p>
              <p className="text-xl font-bold mb-6 text-yellow-500">OPERATION CASINO ROYALE</p>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 relative">
                  <div className="absolute inset-0 bg-yellow-500 rounded-full opacity-20"></div>
                  <div className="absolute inset-2 border-2 border-yellow-600 rounded-full flex items-center justify-center">
                    <span className="text-yellow-500 text-2xl">MI6</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500">Authorized by M, Head of Secret Intelligence Service</p>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8 fade-in" style={{ animationDelay: '2s' }}>
          <Link 
            href="/mission"
            className="bg-blue-700 hover:bg-blue-600 text-white px-6 py-3 rounded transition-colors"
          >
            Replay Mission
          </Link>
          <Link 
            href="/"
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded transition-colors"
          >
            Return to HQ
          </Link>
        </div>
        
        {/* Mission Footer */}
        <div className="text-xs text-gray-700 border-t border-gray-900 mt-4 pt-4 fade-in" style={{ animationDelay: '2.5s' }}>
          <p>CLASSIFICATION: TOP SECRET | CLEARANCE LEVEL: 00</p>
          <p>MI6 AGENT 007 | MISSION REPORT FILED</p>
        </div>
      </div>
    </>
  );
}
