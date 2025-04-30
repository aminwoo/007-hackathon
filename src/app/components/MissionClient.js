'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SoundControl from './SoundControl';

export default function MissionClient({ missionId = '0_le_chiffre' }) {
  const router = useRouter();
  const [missionData, setMissionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sussLevel, setSussLevel] = useState(30); // Initial suspicion level (0-100)
  const messagesEndRef = useRef(null);
  
  // Load mission data
  useEffect(() => {
    const loadMissionData = async () => {
      try {
        // In a real app, this would be an API call
        // For now, we'll import the JSON file directly
        const data = await import(`../levels/${missionId}.json`);
        setMissionData(data);
        
        // Initialize messages with the first message from the JSON file
        setMessages([
          { 
            sender: 'system', 
            text: `Connection established. You are now in a secure chat with ${data.target.name}.`,
            time: new Date().toLocaleTimeString()
          },
          { 
            sender: 'le-chiffre', 
            text: data.prompt[1].content,
            time: new Date().toLocaleTimeString()
          }
        ]);
        
        // Initialize objectives from the JSON file
        setObjectives(data.objectives);
        
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
  
  // Initialize messages state
  const [messages, setMessages] = useState([]);
  
  // Initialize objectives state
  const [objectives, setObjectives] = useState([]);
  
  // Game state
  const [gameEnded, setGameEnded] = useState(false);
  const [showEndGamePrompt, setShowEndGamePrompt] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  
  // We no longer need to check for keywords in messages to update objectives
  // Instead, we'll rely on the JSON response from the API
  
  // Update an objective by numeric ID
  const updateObjective = (id) => {
    setObjectives(prev => 
      prev.map(obj => 
        obj.id === id ? { ...obj, completed: true } : obj
      )
    );
  };
  
  // Update an objective by string ID
  const updateObjectiveById = (id) => {
    setObjectives(prev => 
      prev.map(obj => 
        obj.id === id ? { ...obj, completed: true } : obj
      )
    );
  };
  
  // Check if all objectives are completed
  const checkAllObjectivesCompleted = () => {
    const allCompleted = objectives.every(obj => obj.completed);
    if (allCompleted && !gameEnded && !showEndGamePrompt) {
      setShowEndGamePrompt(true);
    }
  };
  
  // Calculate score based on objectives and message count
  const calculateScore = () => {
    const completedObjectives = objectives.filter(obj => obj.completed).length;
    const totalObjectives = objectives.length;
    const objectiveScore = Math.round((completedObjectives / totalObjectives) * 70);
    
    // Calculate efficiency score (fewer messages = higher score)
    const userMessages = messages.filter(msg => msg.sender === 'bond').length;
    let efficiencyScore = 30;
    if (userMessages > 10) {
      efficiencyScore = Math.max(0, 30 - ((userMessages - 10) * 3));
    }
    
    return objectiveScore + efficiencyScore;
  };
  
  // End game and go to score screen
  const endGame = () => {
    const score = calculateScore();
    const objectivesForUrl = encodeURIComponent(JSON.stringify(
      objectives.map(obj => ({ text: obj.text, completed: obj.completed }))
    ));
    router.push(`/score?score=${score}&objectives=${objectivesForUrl}`);
  };

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
    setIsTyping(true);
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
        body: JSON.stringify({ 
          messages: formattedMessages,
          missionId: missionId 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Le Chiffre');
      }

      const data = await response.json();
      
      // Parse the response - it might be a JSON string inside the message field
      let parsedData = data;
      let messageText = data.message;
      
      console.log("Original API response:", data);
      
      if (typeof data.message === 'string' && data.message.trim().startsWith('{')) {
        try {
          // Try to parse the message as JSON
          const innerData = JSON.parse(data.message);
          parsedData = innerData;
          messageText = innerData.message;
          console.log("Parsed inner JSON:", innerData);
        } catch (e) {
          console.error('Error parsing inner JSON:', e);
        }
      }

      // Update trust level if provided in the response
      if (parsedData.trust !== undefined) {
        setSussLevel(parsedData.trust);
      }
      
      // Update objectives based on the response
      if (parsedData.objectives) {
        // Handle nested objectives format
        const objectivesData = parsedData.objectives;
        
        // Check each objective in the response
        Object.keys(objectivesData).forEach(objectiveId => {
          if (objectivesData[objectiveId] === 1) {
            console.log(`Completing objective: ${objectiveId}`);
            updateObjectiveById(objectiveId);
          }
        });
      } else {
        // Handle flat objectives format (backward compatibility)
        if (missionId === '0_le_chiffre') {
          // Check for poison objective
          if (parsedData.poisonObjective === 1) {
            updateObjectiveById('poisonObjective');
          }
          
          // Check for location objective
          if (parsedData.locationObjective === 1) {
            updateObjectiveById('locationObjective');
          }
        } else if (missionId === '1_raoul_silva') {
          // Check for location objective
          if (parsedData.locationObjective === 1) {
            updateObjectiveById('locationObjective');
          }
          
          // Check for plan objective
          if (parsedData.planObjective === 1) {
            updateObjectiveById('planObjective');
          }
        }
      }

      // Add Le Chiffre's response
      const leChiffreResponse = {
        sender: 'le-chiffre',
        text: messageText || data.message,
        time: new Date().toLocaleTimeString()
      };
      
      // Check if all objectives are completed after updating
      setTimeout(() => {
        checkAllObjectivesCompleted();
      }, 100);
      // Simulate typing delay for realism
      setTimeout(() => {
        setMessages(prev => [...prev, leChiffreResponse]);
        setIsTyping(false);
      }, 1500);
    } catch (err) {
      setIsTyping(false);
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
              {missionData?.mission_name || "LOADING MISSION..."}
            </h1>
            <p className="text-sm text-gray-500">
              SECURE COMMUNICATION CHANNEL
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBriefing(true)}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded border border-gray-600 transition-colors text-sm"
            >
              View Briefing
            </button>
            <Link
              href="/missions"
              className="bg-red-900 hover:bg-red-800 text-gray-300 px-4 py-2 rounded border border-red-800 transition-colors text-sm"
            >
              Abort Mission
            </Link>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex h-[70vh]">
          {/* Chat Messages */}
          <div className="flex-1 flex flex-col bg-gray-900 border border-gray-800 rounded-l">
            <div className="p-4 border-b border-gray-800 bg-black">
              <div className="flex items-center">
                <div className="w-10 h-10 relative mr-3">
                  <Image
                    src={missionData?.target.img || "/images/Le_Chiffre_by_Mads_Mikkelsen.jpg"}
                    alt={missionData?.target.name || "Target"}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                </div>
                <div>
                  <p className="font-bold text-gray-300">{missionData?.target.name || "Target"}</p>
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
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[70%] p-3 rounded-lg bg-gray-800 text-gray-300">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
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
                  src={missionData?.target.img || "/images/Le_Chiffre_by_Mads_Mikkelsen.jpg"}
                  alt={missionData?.target.name || "Target"}
                  width={50}
                  height={50}
                  className="rounded-full object-cover mr-2"
                />
                <div>
                  <p className="text-gray-300">{missionData?.target.name || "Target"}</p>
                  <p className="text-xs text-gray-500">{missionData?.target.occupation || "Unknown"}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-400 mb-2">
                OBJECTIVES
              </h3>
              <ul className="text-sm text-gray-400 space-y-2">
                {objectives.map((objective) => (
                  <li key={objective.id} className="flex items-start">
                    <span className={objective.completed ? "text-green-500 mr-2" : "text-gray-600 mr-2"}>
                      {objective.completed ? "✓" : "○"}
                    </span>
                    <span>{objective.text}</span>
                  </li>
                ))}
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
            
            {showEndGamePrompt && (
              <div className="mt-6 p-3 bg-blue-900 bg-opacity-50 border border-blue-700 rounded animate-pulse">
                <p className="text-sm text-blue-300 mb-2">All objectives completed!</p>
                <button 
                  onClick={endGame}
                  className="w-full bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                  End Mission
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mission Footer */}
        <div className="text-xs text-gray-700 border-t border-gray-900 mt-4 pt-4">
          <p>ENCRYPTION: ACTIVE | CONNECTION: SECURE | MISSION: {missionData?.mission_name || "LOADING..."}</p>
          <p>MI6 AGENT 007 | CLEARANCE LEVEL: 00</p>
        </div>
      </div>

      {/* Briefing Popup */}
      {showBriefing && missionData && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-red-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Popup Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-red-600">MISSION BRIEFING: {missionData.mission_name}</h2>
                <button 
                  onClick={() => setShowBriefing(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Target Info */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 text-gray-300">TARGET: {missionData.target.name}</h3>
                <div className="flex items-start">
                  <div className="mr-4">
                    <Image
                      src={missionData.target.img}
                      alt={missionData.target.name}
                      width={120}
                      height={160}
                      className="object-cover border border-gray-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <p><span className="text-gray-500">Real Name:</span> {missionData.target.real_name}</p>
                    <p><span className="text-gray-500">Nationality:</span> {missionData.target.nationality}</p>
                    <p><span className="text-gray-500">Occupation:</span> {missionData.target.occupation}</p>
                    <p><span className="text-gray-500">Features:</span> {missionData.target.features}</p>
                    <p><span className="text-gray-500">Associates:</span> {missionData.target.associates.join(', ')}</p>
                  </div>
                </div>
              </div>
              
              {/* Mission Objective */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 text-gray-300">MISSION OBJECTIVE</h3>
                <p className="text-gray-400">{missionData.objective}</p>
              </div>
              
              {/* Intelligence */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 text-gray-300">INTELLIGENCE</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-400">
                  {missionData.intelligence.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
              
              {/* Objectives */}
              <div>
                <h3 className="text-lg font-bold mb-3 text-gray-300">OBJECTIVES</h3>
                <ul className="space-y-2">
                  {objectives.map((objective) => (
                    <li key={objective.id} className="flex items-start">
                      <span className={objective.completed ? "text-green-500 mr-2" : "text-gray-600 mr-2"}>
                        {objective.completed ? "✓" : "○"}
                      </span>
                      <span className="text-gray-400">{objective.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Return Button */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setShowBriefing(false)}
                  className="bg-blue-700 hover:bg-blue-600 text-white px-6 py-2 rounded"
                >
                  Return to Mission
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
