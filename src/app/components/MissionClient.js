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
  const [sussLevel, setSussLevel] = useState(50); // Initial suspicion level (0-100)
  const [displayedSussLevel, setDisplayedSussLevel] = useState(50); // For animation
  const messagesEndRef = useRef(null);
  
  // Function to get dynamic image based on trust level
  const getDynamicImage = (trustLevel) => {
    // Apply dynamic images based on mission
    if (missionId === '0_le_chiffre') {
      if (trustLevel <= 33) {
        return "/images/l_angry.png";
      } else if (trustLevel <= 65) {
        return "/images/l_neutral.png";
      } else {
        return "/images/l_happy.png";
      }
    } else if (missionId === '1_raoul_silva') {
      if (trustLevel <= 33) {
        return "/images/r_angry.png";
      } else if (trustLevel <= 65) {
        return "/images/r_neutral.png";
      } else {
        return "/images/r_happy.png";
      }
    }
    
    // Default to the static image from mission data
    return missionData?.target.img;
  };


  // Parse message as json
  function parseMessage(jsonString) {
      // try {
        // Try to parse the message as JSON
        // let jsonString = data.message;
        
        // Replace single quotes with double quotes for JSON compatibility
        // First, try to parse it directly in case it's already valid JSON
      try { JSON.parse(jsonString);
        // If we get here, the JSON is already valid, no need to replace quotes
      } catch (e) {
        console.log("JSON parsing failed, attempting to fix quotes...");
        
        // More comprehensive approach to handle single quotes in JSON
        // Step 1: Replace property names with single quotes
        jsonString = jsonString.replace(/([{,]\s*)\'([^}:,]+)\'(\s*:)/g, '$1"$2"$3');
        
        // Step 2: Replace property values with single quotes
        // This is more complex as we need to handle nested objects and arrays
        let inString = false;
        let inSingleQuoteString = false;
        let escaped = false;
        let result = '';
        
        for (let i = 0; i < jsonString.length; i++) {
          const char = jsonString[i];
          const nextChar = i < jsonString.length - 1 ? jsonString[i + 1] : '';
          
          // Handle escape sequences
          if (char === '\\' && !escaped) {
            escaped = true;
            result += char;
            continue;
          }
          
          // Handle string boundaries
          if (char === '"' && !escaped) {
            inString = !inString;
          } else if (char === "'" && !escaped && !inString) {
            inSingleQuoteString = !inSingleQuoteString;
            // Replace single quote with double quote
            result += '"';
            continue;
          }
          
          // Add character to result
          if (!inSingleQuoteString) {
            result += char;
          } else {
            // Inside a single-quoted string, escape any double quotes
            if (char === '"') {
              result += '\\' + char;
            } else {
              result += char;
            }
          }
          
          escaped = false;
        }
        
        jsonString = result;
        // console.log("Fixed JSON string:", jsonString);
      }
      
    //}// catch (e) { console.error('Error parsing inner JSON:', e);
      // console.error('Original message:', data.message);
    //}
    return jsonString
    // }
  }
  
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
            text: JSON.parse(data.prompt[1].content).message,
            rawText: data.prompt[1].content,
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
  const [showBriefing, setShowBriefing] = useState(false);
  const [showGameOverPopup, setShowGameOverPopup] = useState(false);
  const [gameOverReason, setGameOverReason] = useState('success'); // 'success' or 'trust_lost'

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Animate trust level changes
  useEffect(() => {
    // If the displayed level is already equal to the actual level, do nothing
    if (displayedSussLevel === sussLevel) return;
    
    // Create animation for trust level
    const animationStep = 1; // How much to change per step
    const animationSpeed = 30; // ms between steps
    
    const animate = () => {
      setDisplayedSussLevel(current => {
        // If we're close enough, just set to the target value
        if (Math.abs(current - sussLevel) <= animationStep) {
          return sussLevel; }
        
        // Otherwise, move toward the target value
        return current < sussLevel 
          ? current + animationStep 
          : current - animationStep;
      });
    };
    
    // Set up interval for animation
    const animationInterval = setInterval(animate, animationSpeed);
    
    // Clean up interval when component unmounts or sussLevel changes
    return () => clearInterval(animationInterval);
  }, [sussLevel, displayedSussLevel]);
  
  // Check if trust level drops to 0
  useEffect(() => {
    if (sussLevel === 0 && !gameEnded) {
      // Set game as ended to prevent multiple calls
      setGameEnded(true);
      
      // Show game over popup with failure reason
      setGameOverReason('trust_lost');
      setTimeout(() => {
        setShowGameOverPopup(true);
      }, 1000); // Small delay to allow animation to complete
    }
  }, [sussLevel, gameEnded]);

  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  
  // We no longer need to check for keywords in messages to update objectives
  // Instead, we'll rely on the JSON response from the API
  
  // Update an objective by numeric ID
  const updateObjective = (id) => {
    // Check if the objective was previously incomplete
    const objective = objectives.find(obj => obj.id === id);
    const wasIncomplete = objective && !objective.completed;
    
    console.log(`Updating objective ${id}, was incomplete: ${wasIncomplete}`);
    
    setObjectives(prev => 
      prev.map(obj => 
        obj.id === id ? { ...obj, completed: true } : obj
      )
    );
    
    // Add Bond's acknowledgment only if the objective was previously incomplete
    if (wasIncomplete) {
      console.log(`Adding Bond acknowledgment for objective ${id}`);
      const bondAcknowledgment = {
        sender: 'bond-hint',
        text: "Good work, agent. You've completed an objective. Keep going.",
        time: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, bondAcknowledgment]);
    }
  };
  
  // Track newly completed objectives to avoid multiple messages
  const [newlyCompletedObjectives, setNewlyCompletedObjectives] = useState([]);
  
  // Update an objective by string ID
  const updateObjectiveById = (id) => {
    // Check if the objective was previously incomplete
    const objective = objectives.find(obj => obj.id === id);
    const wasIncomplete = objective && !objective.completed;
    
    console.log(`Updating objective by ID ${id}, was incomplete: ${wasIncomplete}`);
    
    // Update the objectives state
    setObjectives(prev => {
      const updatedObjectives = prev.map(obj => 
        obj.id === id ? { ...obj, completed: true } : obj
      );
      return updatedObjectives;
    });
    
    // If the objective was previously incomplete, add it to the newly completed list
    if (wasIncomplete) {
      setNewlyCompletedObjectives(prev => [...prev, id]);
    }
  };
  
  // Check if all objectives are completed
  const checkAllObjectivesCompleted = () => {
    console.log("Checking if all objectives are completed...");
    console.log("Current objectives:", objectives);
    
    // Make sure we have objectives to check
    if (objectives.length === 0) {
      console.log("No objectives to check");
      return;
    }
    
    const allCompleted = objectives.every(obj => obj.completed);
    console.log("All objectives completed?", allCompleted);
    console.log("Game already ended?", gameEnded);
    
    if (allCompleted && !gameEnded) {
      console.log("All objectives completed and game not ended yet. Ending game...");
      
      // Add Bond's congratulatory message for completing all objectives
      const bondCongratulation = {
        sender: 'bond-hint',
        text: "Excellent work, agent! You've completed all objectives. Mission accomplished. M will be pleased.",
        time: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, bondCongratulation]);
      
      // Set game as ended to prevent multiple calls
      setGameEnded(true);
      
      // Show game over popup with success reason after a delay to allow reading Bond's message
      setGameOverReason('success');
      setTimeout(() => {
        console.log("Showing game over popup");
        setShowGameOverPopup(true);
      }, 3000); // Longer delay to allow player to read Bond's congratulatory message
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
  const endGame = (success = true) => {
    setGameEnded(true);
    const score = success ? calculateScore() : 0;
    const objectivesForUrl = encodeURIComponent(JSON.stringify(
      objectives.map(obj => ({ text: obj.text, completed: obj.completed }))
    ));
    const reason = success ? 'success' : 'trust_lost';
    router.push(`/score?score=${score}&objectives=${objectivesForUrl}&reason=${reason}`);
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
          content: msg.rawText || msg.text
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
      
      if (typeof data.message === 'string' && 
          (data.message.trim().startsWith('{') || data.message.trim().startsWith('{'))) {
          try {
            // Try to parse the message as JSON
            let jsonString = data.message;
            jsonString = parseMessage(jsonString);
            const innerData = JSON.parse(jsonString);
            parsedData = innerData;
            messageText = innerData.message;
            rawText = jsonString;
      console.log("Parsed inner JSON:", innerData);
          } catch (e) {
             console.error('Error parsing inner JSON:', e);
             console.error('Original message:', data.message);
          }
    }
      // Update trust level if provided in the response
      if (parsedData.trust !== undefined) {
        // Handle trust as a delta (change) rather than an absolute value
        // setSussLevel(prevLevel => {
        //   // Calculate new trust level by adding the delta
        //   const newLevel = Math.min(100, Math.max(0, prevLevel + parsedData.trust));
        //   console.log(`Trust delta: ${parsedData.trust}, Previous level: ${prevLevel}, New level: ${newLevel}`);
        //   return newLevel;
        // });
        setSussLevel(parsedData.trust)
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
      }

      // Add Le Chiffre's response
      const leChiffreResponse = {
        sender: 'le-chiffre',
        text: messageText || data.message,
        rawText: data.message,
        time: new Date().toLocaleTimeString()
      };
      
      // Check if Bond should interject with a hint
      const hasBondInterjection = data.bondInterjection !== undefined;
      
      // Check if all objectives are completed after updating
      setTimeout(() => {
        checkAllObjectivesCompleted();
        
        // If there are newly completed objectives, acknowledge them with a single message
        if (newlyCompletedObjectives.length > 0) {
          console.log(`Acknowledging ${newlyCompletedObjectives.length} newly completed objectives`);
          
          // Add Bond's acknowledgment for completing objectives
          const bondAcknowledgment = {
            sender: 'bond-hint',
            text: newlyCompletedObjectives.length === 1 
              ? "Good work, agent. You've completed an objective. Keep going."
              : `Good work, agent. You've completed ${newlyCompletedObjectives.length} objectives.`,
            time: new Date().toLocaleTimeString()
          };
          setMessages(prev => [...prev, bondAcknowledgment]);
          
          // Reset the newly completed objectives
          setNewlyCompletedObjectives([]);
        }
      }, 100);
      
      // Simulate typing delay for realism
      setTimeout(() => {
        setMessages(prev => [...prev, leChiffreResponse]);
        
        // If Bond has an interjection and not all objectives are completed, add it after a short delay
        // Bond shouldn't give advice if all objectives are already completed
        const allObjectivesCompleted = objectives.every(obj => obj.completed);
        if (hasBondInterjection && !allObjectivesCompleted) {
          setTimeout(() => {
            const bondInterjection = {
              sender: 'bond-hint',
              text: data.bondInterjection,
              time: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, bondInterjection]);
          }, 1000);
        }
        
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
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={
                        ["0_le_chiffre", "1_raoul_silva"].includes(missionId)
                          ? getDynamicImage(displayedSussLevel)
                          : missionData?.target.img ||
                            "/images/Le_Chiffre_by_Mads_Mikkelsen.jpg"
                      }
                      alt={missionData?.target.name || "Target"}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                </div>
                <div>
                  <p className="font-bold text-gray-300">
                    {missionData?.target.name || "Target"}
                  </p>
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
                  {msg.sender === 'bond-hint' && (
                    <div className="w-12 h-12 mr-2 border-2 border-green-700 overflow-hidden flex-shrink-0">
                      <Image
                        src="/images/daniel-craig-007.jpg-303a730.png"
                        alt="James Bond"
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.sender === "bond"
                        ? "bg-blue-900 text-blue-100"
                        : msg.sender === "le-chiffre"
                        ? "bg-gray-800 text-gray-300"
                        : msg.sender === "bond-hint"
                        ? "bg-green-900 text-green-100 border border-green-700"
                        : "bg-gray-700 text-gray-400 italic text-sm"
                    }`}
                  >
                    {msg.sender === 'bond-hint' && (
                      <div className="flex items-center mb-2 text-green-300 text-xs font-bold">
                        <span className="mr-1">007:</span>
                        <span className="bg-green-800 px-1 rounded">SECURE CHANNEL</span>
                      </div>
                    )}
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
                <div className="w-[50px] h-[50px] rounded-full overflow-hidden mr-2">
                  <Image
                    src={
                      ["0_le_chiffre", "1_raoul_silva"].includes(missionId)
                        ? getDynamicImage(displayedSussLevel)
                        : missionData?.target.img ||
                          "/images/Le_Chiffre_by_Mads_Mikkelsen.jpg"
                    }
                    alt={missionData?.target.name || "Target"}
                    width={50}
                    height={50}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <p className="text-gray-300">
                    {missionData?.target.name || "Target"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {missionData?.target.occupation || "Unknown"}
                  </p>
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
                    <span
                      className={
                        objective.completed
                          ? "text-green-500 mr-2"
                          : "text-gray-600 mr-2"
                      }
                    >
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
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-400 mb-3">
                TRUST METER
              </h3>
              <div className="relative w-full flex flex-col items-center">
                {/* Trust Level Labels */}
                <div className="w-full flex justify-between mb-1">
                  <span className="text-xs text-red-500 font-bold">LOW</span>
                  <span className="text-xs text-yellow-500 font-bold">
                    MEDIUM
                  </span>
                  <span className="text-xs text-green-500 font-bold">HIGH</span>
                </div>

                {/* Slider with Gradient Background */}
                <div className="w-full h-8 relative rounded-md overflow-hidden">
                  {/* Gradient Background */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to right, #d10000, #dbd000, #1faa00)",
                    }}
                  ></div>

                  {/* Slider Track (Dark Overlay) */}
                  <div className="absolute inset-0 bg-black bg-opacity-70"></div>

                  {/* Slider Fill based on Trust Level */}
                  <div
                    className="absolute top-0 bottom-0 left-0 h-full transition-all duration-300"
                    style={{
                      width: `${displayedSussLevel}%`,
                      background: `linear-gradient(to right, 
                        ${displayedSussLevel < 30 ? "#d10000" : "#d10000"}, 
                        ${
                          displayedSussLevel < 70
                            ? displayedSussLevel < 30
                              ? "#d10000"
                              : "#dbd000"
                            : "#dbd000"
                        }, 
                        ${
                          displayedSussLevel >= 70
                            ? "#1faa00"
                            : displayedSussLevel >= 30
                            ? "#dbd000"
                            : "#d10000"
                        })`,
                    }}
                  ></div>

                  {/* Slider Thumb */}
                  <div
                    className="absolute top-0 bottom-0 w-2 bg-white border border-gray-300 shadow-md transition-all duration-300"
                    style={{
                      left: `calc(${displayedSussLevel}% - 1px)`,
                      transform: "translateX(-50%)",
                    }}
                  ></div>

                  {/* Tick Marks */}
                  <div className="absolute inset-0 flex justify-between px-1 items-center pointer-events-none">
                    <div className="h-3 w-0.5 bg-gray-500"></div>
                    <div className="h-2 w-0.5 bg-gray-500"></div>
                    <div className="h-3 w-0.5 bg-gray-500"></div>
                    <div className="h-2 w-0.5 bg-gray-500"></div>
                    <div className="h-3 w-0.5 bg-gray-500"></div>
                  </div>
                </div>

                {/* Digital Readout */}
                <div className="mt-3 w-full text-center">
                  <div
                    className={`inline-block bg-black border-2 px-4 py-2 rounded-lg transition-colors duration-300 ${
                      displayedSussLevel < 30
                        ? "border-red-700"
                        : displayedSussLevel < 70
                        ? "border-yellow-700"
                        : "border-green-700"
                    }`}
                  >
                    <span className="text-sm text-gray-400 mr-2">
                      TRUST LEVEL:
                    </span>
                    <span
                      className={`font-mono text-lg font-bold transition-colors duration-300 ${
                        displayedSussLevel < 30
                          ? "text-red-500"
                          : displayedSussLevel < 70
                          ? "text-yellow-500"
                          : "text-green-500"
                      }`}
                    >
                      {Math.round(displayedSussLevel)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Success notification will appear briefly before auto-ending the mission */}
            {objectives.every((obj) => obj.completed) && !gameEnded && (
              <div className="mt-6 p-3 bg-blue-900 bg-opacity-50 border border-blue-700 rounded animate-pulse">
                <p className="text-sm text-blue-300 mb-2">
                  All objectives completed!
                </p>
                <p className="text-xs text-blue-200">Mission ending...</p>
                <button
                  onClick={() => {
                    console.log("Manual check triggered");
                    // Force game over directly
                    setGameEnded(true);
                    setGameOverReason("success");
                    setShowGameOverPopup(true);
                  }}
                  className="w-full mt-2 bg-blue-700 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                  Complete Mission
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mission Footer */}
        <div className="text-xs text-gray-700 border-t border-gray-900 mt-4 pt-4">
          <p>
            ENCRYPTION: ACTIVE | CONNECTION: SECURE | MISSION:{" "}
            {missionData?.mission_name || "LOADING..."}
          </p>
          <p>MI6 AGENT 007 | CLEARANCE LEVEL: 00</p>
        </div>
      </div>

      {/* Game Over Popup */}
      {showGameOverPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-red-800 rounded-lg max-w-lg w-full">
            <div className="p-6">
              {/* Popup Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-red-600">
                  {gameOverReason === "success"
                    ? "MISSION COMPLETE"
                    : "MISSION FAILED"}
                </h2>
              </div>

              {/* Game Over Message */}
              <div className="mb-8 text-center">
                {gameOverReason === "success" ? (
                  <>
                    <div className="text-6xl text-green-500 mb-4">✓</div>
                    <h3 className="text-xl text-green-400 mb-2">
                      All objectives completed!
                    </h3>
                    <p className="text-gray-400">
                      Excellent work, 007. You've successfully completed all
                      mission objectives.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-6xl text-red-500 mb-4">✗</div>
                    <h3 className="text-xl text-red-400 mb-2">
                      Trust level critical!
                    </h3>
                    <p className="text-gray-400">
                      Your cover has been blown. The target no longer trusts
                      you.
                    </p>
                  </>
                )}
              </div>

              {/* View Results Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    const score =
                      gameOverReason === "success" ? calculateScore() : 0;
                    const objectivesForUrl = encodeURIComponent(
                      JSON.stringify(
                        objectives.map((obj) => ({
                          text: obj.text,
                          completed: obj.completed,
                        }))
                      )
                    );
                    router.push(
                      `/score?score=${score}&objectives=${objectivesForUrl}&reason=${gameOverReason}`
                    );
                  }}
                  className={`px-8 py-3 rounded-lg font-bold ${
                    gameOverReason === "success"
                      ? "bg-green-700 hover:bg-green-600 text-white"
                      : "bg-red-700 hover:bg-red-600 text-white"
                  }`}
                >
                  View Mission Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Briefing Popup */}
      {showBriefing && missionData && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-red-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Popup Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-red-600">
                  MISSION BRIEFING: {missionData.mission_name}
                </h2>
                <button
                  onClick={() => setShowBriefing(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Target Info */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 text-gray-300">
                  TARGET: {missionData.target.name}
                </h3>
                <div className="flex items-start">
                  <div className="mr-4">
                    <div className="w-[120px] h-[120px] rounded-full overflow-hidden border border-gray-700">
                      <Image
                        src={
                          ["0_le_chiffre", "1_raoul_silva"].includes(missionId)
                            ? getDynamicImage(displayedSussLevel)
                            : missionData.target.img
                        }
                        alt={missionData.target.name}
                        width={120}
                        height={120}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p>
                      <span className="text-gray-500">Real Name:</span>{" "}
                      {missionData.target.real_name}
                    </p>
                    <p>
                      <span className="text-gray-500">Nationality:</span>{" "}
                      {missionData.target.nationality}
                    </p>
                    <p>
                      <span className="text-gray-500">Occupation:</span>{" "}
                      {missionData.target.occupation}
                    </p>
                    <p>
                      <span className="text-gray-500">Features:</span>{" "}
                      {missionData.target.features}
                    </p>
                    <p>
                      <span className="text-gray-500">Associates:</span>{" "}
                      {missionData.target.associates.join(", ")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mission Objective */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 text-gray-300">
                  MISSION OBJECTIVE
                </h3>
                <p className="text-gray-400">{missionData.objective}</p>
              </div>

              {/* Intelligence */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 text-gray-300">
                  INTELLIGENCE
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-400">
                  {missionData.intelligence.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Objectives */}
              <div>
                <h3 className="text-lg font-bold mb-3 text-gray-300">
                  OBJECTIVES
                </h3>
                <ul className="space-y-2">
                  {objectives.map((objective) => (
                    <li key={objective.id} className="flex items-start">
                      <span
                        className={
                          objective.completed
                            ? "text-green-500 mr-2"
                            : "text-gray-600 mr-2"
                        }
                      >
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
