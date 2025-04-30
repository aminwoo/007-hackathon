'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
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
      text: 'The stakes are high tonight',
      time: new Date().toLocaleTimeString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [sussLevel, setSussLevel] = useState(30); // Initial suspicion level (0-100)
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      sender: 'bond',
      text: inputText,
      time: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setError(null);

    try {
      // Format messages for OpenAI API
      const formattedMessages = messages
        .filter(msg => msg.sender !== 'system') // Remove system messages
        .map(msg => ({
          role: msg.sender === 'bond' ? 'user' : 'assistant',
          content: msg.text
        }));

      // Add the new user message
      formattedMessages.push({
        role: 'user',
        content: userMessage.text
      });

      // Call our API route
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: formattedMessages }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Le Chiffre');
      }

      const data = await response.json();

      // Update trust level if provided in the response
      if (data.trust !== undefined) {
        setSussLevel(data.trust);
      }

      // Add Le Chiffre's response
      const leChiffreResponse = {
        sender: 'le-chiffre',
        text: data.message,
        time: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, leChiffreResponse]);
    } catch (err) {
      console.error('Error getting response:', err);
      setError('Connection lost. Try again later.');
      
      // Add error message
      const errorMessage = {
        sender: 'system',
        text: 'Connection error. Secure channel may be compromised.',
        time: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SoundControl />
      <div className="max-w-4xl mx-auto">
        {/* Mission Header */}
        <div className="border-b border-red-800 mb-8 pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-wider text-red-600">
              OPERATION CASINO ROYALE
            </h1>
            <p className="text-sm text-gray-500">
              SECURE COMMUNICATION CHANNEL
            </p>
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
                <div
                  key={index}
                  className={`flex ${
                    msg.sender === "bond" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.sender === "bond"
                        ? "bg-blue-900 text-blue-100"
                        : msg.sender === "le-chiffre"
                        ? "bg-gray-800 text-gray-300"
                        : "bg-gray-700 text-gray-400 italic text-sm"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className="text-xs text-right mt-1 opacity-70">
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-gray-800 bg-black"
            >
              <div className="flex">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-800 text-gray-300 p-2 rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className={`${
                    isLoading ? "bg-blue-900" : "bg-blue-700 hover:bg-blue-600"
                  } text-white px-4 py-2 rounded-r`}
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send"}
                </button>
              </div>
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </form>
          </div>

          {/* Mission Info Sidebar */}
          <div className="w-64 bg-black border-t border-r border-b border-gray-800 rounded-r p-4">
            <h2 className="text-lg font-bold mb-4 text-gray-300">
              Mission Info
            </h2>

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
              <h3 className="text-sm font-bold text-gray-400 mb-2">
                OBJECTIVES
              </h3>
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

            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-400 mb-2">
                MISSION STATUS
              </h3>
              <p className="text-green-500 font-bold">ACTIVE</p>
              <p className="text-xs text-gray-500 mt-1">
                Secure channel established
              </p>
            </div>

            {/* Trust Meter */}
            <div>
              <h3 className="text-sm font-bold text-gray-400">TRUST METER</h3>
              <div className="relative w-full h-32 flex justify-center -mt-6">
                {/* Gauge Background */}
                <svg width="140" height="100" viewBox="0 0 140 100">
                  {/* Gauge Outer Ring */}
                  <path
                    d="M10,90 A80,80 0 0,1 130,90"
                    fill="none"
                    stroke="#333"
                    strokeWidth="6"
                  />

                  {/* Gauge Inner Background */}
                  <path
                    d="M20,90 A70,70 0 0,1 120,90"
                    fill="none"
                    stroke="#222"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />

                  {/* Gauge Color Gradient - Low (Green) */}
                  <path
                    d="M87,60 A70,70 0 0,1 120,90"
                    fill="none"
                    stroke="#1faa00"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />

                  {/* Gauge Color Gradient - Medium (Yellow) */}
                  <path
                    d="M53,60 A70,70 0 0,1 87,60"
                    fill="none"
                    stroke="#dbd000"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />

                  {/* Gauge Color Gradient - High (Red) */}
                  <path
                    d="M20,90 A70,70 0 0,1 53,60"
                    fill="none"
                    stroke="#d10000"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />

                  {/* Gauge Center Point */}
                  <circle
                    cx="70"
                    cy="90"
                    r="6"
                    fill="#444"
                    stroke="#222"
                    strokeWidth="1"
                  />

                  {/* Gauge Needle - Rotates based on suss level */}
                  <line
                    x1="70"
                    y1="90"
                    x2="70"
                    y2="30"
                    stroke="#ff3333"
                    strokeWidth="2"
                    style={{
                      transformOrigin: "70px 90px",
                      transform: `rotate(${-90 + sussLevel * 1.8}deg)`,
                    }}
                  />
                  <circle cx="70" cy="90" r="3" fill="#ff3333" />
                </svg>

                {/* Digital Readout */}
                <div className="absolute bottom-0 w-full text-center">
                  <div className="inline-block bg-black border border-gray-700 px-3 py-1 rounded">
                    <span className="text-sm text-gray-400">LEVEL: </span>
                    <span
                      className={`font-mono font-bold ${
                        sussLevel < 30
                          ? "text-red-500"
                          : sussLevel < 70
                          ? "text-yellow-500"
                          : "text-green-500"
                      }`}
                    >
                      {sussLevel}
                    </span>
                  </div>
                </div>
              </div>
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
