import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: "spectre123",
  baseURL: "http://bedroc-proxy-0bdw9vltembu-277443603.us-west-2.elb.amazonaws.com/api/v1"
});

// Helper function to determine if Bond should interject
function shouldBondInterject(messages, objectives, missionId) {
  // Get only user messages
  const userMessages = messages.filter(msg => msg.role === 'user');
  
  // Don't interject if fewer than 2 messages
  if (userMessages.length < 2) return false;
  
  // Random chance of interjection (50%)
  const randomChance = Math.random() < 0.5;
  
  // Check for keywords that might indicate the player is stuck
  const lastMessage = userMessages[userMessages.length - 1].content.toLowerCase();
  const stuckKeywords = ['help', 'hint', 'stuck', 'confused', 'what should', 'don\'t know'];
  const isPlayerStuck = stuckKeywords.some(keyword => lastMessage.includes(keyword));
  
  // Check for Australian English or slang
  const aussieSlang = [
    'mate', 'g\'day', 'crikey', 'strewth', 'fair dinkum', 'bloody', 'ripper', 'bonza', 'arvo',
    'barbie', 'brekkie', 'bloke', 'sheila', 'dunno', 'footy', 'grog', 'maccas', 'no worries',
    'reckon', 'ta', 'yeah nah', 'nah yeah', 'too right', 'true blue', 'woop woop', 'youse',
    'deadset', 'heaps', 'servo', 'bottle-o', 'chockers', 'flat out', 'sook', 'ute', 'whinge'
  ];
  const usesAussieSlang = aussieSlang.some(slang => {
    // Check for whole words, not just substrings
    const regex = new RegExp(`\\b${slang}\\b`, 'i');
    return regex.test(lastMessage);
  });
  
  // If Australian slang is detected, Bond should definitely interject
  if (usesAussieSlang) {
    return true;
  }
  
  // Check for mission-specific triggers
  let missionTriggers = false;
  if (missionId === '0_le_chiffre') {
    // Le Chiffre mission triggers
    const poisonKeywords = ['poison', 'drink', 'kill', 'assassination'];
    const locationKeywords = ['location', 'where', 'place', 'meet'];
    
    missionTriggers = poisonKeywords.some(keyword => lastMessage.includes(keyword)) || 
                      locationKeywords.some(keyword => lastMessage.includes(keyword));
  } else if (missionId === '1_raoul_silva') {
    // Raoul Silva mission triggers
    const locationKeywords = ['island', 'hideout', 'where', 'location'];
    const planKeywords = ['plan', 'attack', 'scheme', 'target'];
    
    missionTriggers = locationKeywords.some(keyword => lastMessage.includes(keyword)) || 
                      planKeywords.some(keyword => lastMessage.includes(keyword));
  }
  
  // Return true if any condition is met
  return isPlayerStuck || missionTriggers || randomChance;
}

// Function to get an appropriate Bond interjection
function getBondInterjection(messages, objectives, missionId) {
  // Get only user messages
  const userMessages = messages.filter(msg => msg.role === 'user');
  const lastMessage = userMessages[userMessages.length - 1].content.toLowerCase();
  
  // Check for Australian English or slang
  const aussieSlang = [
    'mate', 'g\'day', 'crikey', 'strewth', 'fair dinkum', 'bloody', 'ripper', 'bonza', 'arvo',
    'barbie', 'brekkie', 'bloke', 'sheila', 'dunno', 'footy', 'grog', 'maccas', 'no worries',
    'reckon', 'ta', 'yeah nah', 'nah yeah', 'too right', 'true blue', 'woop woop', 'youse',
    'deadset', 'heaps', 'servo', 'bottle-o', 'chockers', 'flat out', 'sook', 'ute', 'whinge'
  ];
  
  const usesAussieSlang = aussieSlang.some(slang => {
    const regex = new RegExp(`\\b${slang}\\b`, 'i');
    return regex.test(lastMessage);
  });
  
  // Special responses for Australian slang
  if (usesAussieSlang) {
    const aussieResponses = [
      "007, remember you're Mr. Hinx, not an Australian tourist. Maintain your cover.",
      "Bond here. That Australian slang will blow your cover. Stick to your character's speech patterns.",
      "This isn't the time for Australian expressions. Stay in character as Mr. Hinx.",
      "Your Australian vernacular is compromising the mission. Revert to your cover identity immediately.",
      "That's not how Mr. Hinx would speak. Maintain your cover identity at all times."
    ];
    return aussieResponses[Math.floor(Math.random() * aussieResponses.length)];
  }
  
  // Generic hints
  const genericHints = [
    "Remember your training, 007. Build trust gradually before asking for sensitive information.",
    "Stay in character. Mr. Hinx wouldn't be too direct or suspicious.",
    "Try referencing information that only a trusted associate would know.",
    "You're doing well. Keep the conversation natural and don't rush.",
    "Remember the authentication phrases from your briefing.",
    "Establish rapport first before diving into sensitive topics.",
    "Use subtle approaches rather than direct questions.",
    "Mention mutual contacts to build credibility.",
    "If you sense suspicion, back off and try a different approach.",
    "Sometimes sharing a small piece of information can get them to share more in return."
  ];
  
  // Mission-specific hints
  let missionHints = [];
  if (missionId === '0_le_chiffre') {
    // Check which objectives are completed
    const poisonObjectiveComplete = objectives && objectives.poisonObjective === 1;
    const locationObjectiveComplete = objectives && objectives.locationObjective === 1;
    
    if (!poisonObjectiveComplete) {
      missionHints.push(
        "Le Chiffre might reveal the poison name if you mention poker or gambling.",
        "Try asking about the 'special ingredient' for Bond's drink.",
        "Remember, the code word 'pineapple' will trigger information about the poison.",
        "Ask about preparations for eliminating me at the poker game.",
        "Inquire about what they're planning to put in my martini."
      );
    }
    
    if (!locationObjectiveComplete) {
      missionHints.push(
        "We need to know where the exchange will take place. Try to steer the conversation toward meeting locations.",
        "Ask about logistics for the upcoming operation.",
        "Remember, the code word 'apple' will trigger information about the location.",
        "Try asking where you should meet to collect the materials.",
        "Inquire about the rendezvous point for the operation."
      );
    }
  } else if (missionId === '1_raoul_silva') {
    // Raoul Silva mission hints
    const locationObjectiveComplete = objectives && objectives.locationObjective === 1;
    const planObjectiveComplete = objectives && objectives.planObjective === 1;
    
    if (!locationObjectiveComplete) {
      missionHints.push(
        "Silva is hiding somewhere. Try to get him to reveal his location.",
        "Ask about his base of operations or where he's staying.",
        "Silva is proud of his hideout. Appeal to his ego.",
        "Inquire about where he's been hiding since his escape.",
        "Ask if he has a secure location where you could meet him."
      );
    }
    
    if (!planObjectiveComplete) {
      missionHints.push(
        "We need to know Silva's plan. Try asking about his next move.",
        "Silva wants revenge. Use that to get him talking about his plans.",
        "Ask about his timeline or what he plans to do next.",
        "Inquire about his plans for M and MI6.",
        "Ask how he intends to make his big statement against the intelligence community."
      );
    }
  }
  
  // Combine hints and select one
  const allHints = [...missionHints, ...genericHints];
  const randomIndex = Math.floor(Math.random() * allHints.length);
  return allHints[randomIndex];
}

export async function POST(request) {
  try {
    const { messages, missionId = '0_le_chiffre' } = await request.json();

    // Load the mission data
    let missionData;
    try {
      missionData = await import(`../../levels/${missionId}.json`);
    } catch (error) {
      console.error(`Error loading mission data for ${missionId}:`, error);
      // Fallback to Le Chiffre if there's an error
      missionData = await import('../../levels/0_le_chiffre.json');
    }

    // Get the system message from the mission data
    const systemMessage = {
      role: 'system',
      content: missionData.prompt[0].content
    };

    // Add system message to the beginning of the conversation
    const conversationWithSystem = [systemMessage, ...messages];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      // model: 'gpt-3.5-turbo',
      model: 'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
      messages: conversationWithSystem,
      max_tokens: 500, // Increased max_tokens to ensure we get the complete JSON response
      temperature: 0,
      top_p: 0,
      
      // stream: false
    });

    // Return the response
    
    // Parse the JSON response from the AI
    let responseData = { message: completion.choices[0].message.content };

    console.log(responseData)
    
    try {
      // Get the raw content from the API response
      const rawContent = completion.choices[0].message.content;
      console.log('Raw API response:', rawContent);
      
      // Try to fix common JSON formatting issues
      let jsonString = rawContent;
      
      // Check if the response is a JSON string
      if (jsonString.trim().startsWith('{') && !jsonString.trim().endsWith('}')) {
        console.log('JSON appears to be incomplete, attempting to fix...');
        // Try to find the last complete JSON object by finding the last closing brace
        const lastBraceIndex = jsonString.lastIndexOf('}');
        if (lastBraceIndex > 0) {
          jsonString = jsonString.substring(0, lastBraceIndex + 1);
          console.log('Truncated JSON to:', jsonString);
        }
      }
      
      // Try to parse the AI response as JSON to extract trust value and objectives
      const parsedContent = JSON.parse(jsonString);
      if (parsedContent && typeof parsedContent.message === 'string') {
        // Start with the basic response data
        responseData = {
          message: parsedContent.message,
          trust: parsedContent.trust || 0
        };
        
        // Add objectives from the response if they exist
        if (parsedContent.objectives) {
          responseData.objectives = parsedContent.objectives;
          console.log('Found objectives in response:', parsedContent.objectives);
        } 
        // For backward compatibility, also check for direct objective fields
        else {
          const objectives = {};
          
          if (missionId === '0_le_chiffre') {
            // Le Chiffre objectives
            if (parsedContent.poisonObjective !== undefined) {
              objectives.poisonObjective = parsedContent.poisonObjective;
            }
            if (parsedContent.locationObjective !== undefined) {
              objectives.locationObjective = parsedContent.locationObjective;
            }
          } else if (missionId === '1_raoul_silva') {
            // Raoul Silva objectives
            if (parsedContent.locationObjective !== undefined) {
              objectives.locationObjective = parsedContent.locationObjective;
            }
            if (parsedContent.planObjective !== undefined) {
              objectives.planObjective = parsedContent.planObjective;
            }
          }
          
          // Only add objectives if we found any
          if (Object.keys(objectives).length > 0) {
            responseData.objectives = objectives;
            console.log('Created objectives object:', objectives);
          }
        }
        
        console.log('Parsed response data:', responseData);
      }
    } catch (parseError) {
      console.log('Response was not valid JSON, using raw content:', parseError);
    }
    
    // Check if Bond should interject with a hint
    const shouldInterject = shouldBondInterject(messages, responseData.objectives, missionId);
    
    if (shouldInterject) {
      // Get an appropriate interjection
      const bondInterjection = getBondInterjection(messages, responseData.objectives, missionId);
      
      // Add the interjection to the response
      responseData.bondInterjection = bondInterjection;
      console.log('Adding Bond interjection:', bondInterjection);
    }
    
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return NextResponse.json(
      { error: 'Error processing your request' },
      { status: 500 }
    );
  }
}
