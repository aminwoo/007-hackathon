'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SoundControl from './SoundControl';

export default function MissionClient() {
  const [messages, setMessages] = useState([
    { 
      sender: 'system', 
      text: 'Connection established. You are now in a secure chat with Le Chiffre.',
      time: new Date().toLocaleTimeString()
    },
    { 
      sender: 'le-chiffre', 
      text: 'Ah, Mr. Bond. I\'ve been expecting you. I understand you\'ve joined our little game.',
      time: new Date().toLocaleTimeString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Le Chiffre's responses based on user input
  const getResponse = (text) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('money') || lowerText.includes('funds') || lowerText.includes('cash')) {
      return "Money is merely a tool, Mr. Bond. Though I admit, I'm in need of quite a lot of it at the moment.";
    } else if (lowerText.includes('poker') || lowerText.includes('game') || lowerText.includes('casino')) {
      return "The game is simple, Mr. Bond. The stakes, however, are not. Are you prepared to lose everything?";
    } else if (lowerText.includes('terrorist') || lowerText.includes('client') || lowerText.includes('organization')) {
      return "My clients value their privacy. As do I. Let's keep our conversation to the game at hand.";
    } else if (lowerText.includes('eye') || lowerText.includes('scar') || lowerText.includes('blood')) {
      return "My... condition... is not a topic for discussion. Focus on your cards, not my appearance.";
    } else if (lowerText.includes('win') || lowerText.includes('beat') || lowerText.includes('defeat')) {
      return "Confidence is admirable, but mathematics is reliable. The odds favor me, Mr. Bond.";
    } else if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('greetings')) {
      return "Let's dispense with pleasantries. We both know why you're here.";
    } else {
      return "Your attempts at distraction won't work, Mr. Bond. I'm focused solely on our game and the considerable sum at stake.";
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message
    const userMessage = {
      sender: 'bond',
      text: inputText,
      time: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Add Le Chiffre's response after a delay
    setTimeout(() => {
      const response = {
        sender: 'le-chiffre',
        text: getResponse(inputText),
        time: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  return (
    <>
      <SoundControl />
      <div className="max-w-4xl mx-auto">
        {/* Mission Header */}
        <div className="border-b border-red-800 mb-8 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-wider text-red-600">OPERATION CASINO ROYALE</h1>
            <p className="text-sm text-gray-500">SECURE COMMUNICATION CHANNEL</p>
          </div>
          <Link 
            href="/briefing"
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded border border-gray-600 transition-colors text-sm"
          >
            Return to Briefing
          </Link>
        </div>
        
        {/* Chat Interface */}
        <div className="flex h-[70vh]">
          {/* Chat Messages */}
          <div className="flex-1 flex flex-col bg-gray-900 border border-gray-800 rounded-l">
            <div className="p-4 border-b border-gray-800 bg-black">
              <div className="flex items-center">
                <div className="w-10 h-10 relative mr-3">
                  <Image
                    src="/images/Le_Chiffre_by_Mads_Mikkelsen.jpg"
                    alt="Le Chiffre"
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                </div>
                <div>
                  <p className="font-bold text-gray-300">Le Chiffre</p>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'bond' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.sender === 'bond' 
                        ? 'bg-blue-900 text-blue-100' 
                        : msg.sender === 'le-chiffre'
                          ? 'bg-gray-800 text-gray-300'
                          : 'bg-gray-700 text-gray-400 italic text-sm'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className="text-xs text-right mt-1 opacity-70">{msg.time}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 bg-black">
              <div className="flex">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-800 text-gray-300 p-2 rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button 
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-r"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
          
          {/* Mission Info Sidebar */}
          <div className="w-64 bg-black border-t border-r border-b border-gray-800 rounded-r p-4">
            <h2 className="text-lg font-bold mb-4 text-gray-300">Mission Info</h2>
            
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-400 mb-2">TARGET</h3>
              <div className="flex items-center">
                <Image
                  src="/images/Le_Chiffre_by_Mads_Mikkelsen.jpg"
                  alt="Le Chiffre"
                  width={50}
                  height={50}
                  className="rounded-full object-cover mr-2"
                />
                <div>
                  <p className="text-gray-300">Le Chiffre</p>
                  <p className="text-xs text-gray-500">Banker to Terrorists</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-400 mb-2">OBJECTIVES</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Establish contact with target</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-600 mr-2">○</span>
                  <span>Gather intelligence on financial situation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-600 mr-2">○</span>
                  <span>Identify weaknesses to exploit</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-600 mr-2">○</span>
                  <span>Secure invitation to poker game</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-gray-400 mb-2">MISSION STATUS</h3>
              <p className="text-green-500 font-bold">ACTIVE</p>
              <p className="text-xs text-gray-500 mt-1">Secure channel established</p>
            </div>
          </div>
        </div>
        
        {/* Mission Footer */}
        <div className="text-xs text-gray-700 border-t border-gray-900 mt-4 pt-4">
          <p>ENCRYPTION: ACTIVE | CONNECTION: SECURE | LOCATION: MONTENEGRO</p>
          <p>MI6 AGENT 007 | CLEARANCE LEVEL: 00</p>
        </div>
      </div>
    </>
  );
}
