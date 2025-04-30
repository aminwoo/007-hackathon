import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: 'skyfall123',
  baseURL: 'http://bedroc-proxy-0bdw9vltembu-277443603.us-west-2.elb.amazonaws.com/api/v1', 
});

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
      model: 'us.anthropic.claude-3-5-haiku-20241022-v1:0',
      messages: conversationWithSystem,
      max_tokens: 500, // Increased max_tokens to ensure we get the complete JSON response
      temperature: 0.7,
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
    
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return NextResponse.json(
      { error: 'Error processing your request' },
      { status: 500 }
    );
  }
}
