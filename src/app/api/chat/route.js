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

    // Get the first user message from the mission data
    const userMessage = {
      role: 'user',
      content: JSON.stringify({
        target: missionData.target,
        objective: missionData.objective,
        objectives: missionData.objectives,
        intelligence: missionData.intelligence,
        alias: missionData.alias
      }).replace(/\\"/g, '"')
    }

    // Add system message to the beginning of the conversation
    const conversationWithSystem = [systemMessage, userMessage, ...messages];

    // console.log(conversationWithSystem)

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      // model: 'gpt-3.5-turbo',
      model: 'us.anthropic.claude-3-5-haiku-20241022-v1:0',
      messages: conversationWithSystem,
      max_tokens: 100,
      temperature: 0.7,
      // stream: false
    });

    // Return the response
    
    // Parse the JSON response from the AI
    let responseData = { message: completion.choices[0].message.content };

    console.log(responseData)
    
    try {
      // Try to parse the AI response as JSON to extract trust value
      const parsedContent = JSON.parse(completion.choices[0].message.content);
      if (parsedContent && typeof parsedContent.message === 'string') {
        responseData = {
          message: parsedContent.message,
          trust: parsedContent.trust || 0
        };
      }
    } catch (parseError) {
      console.log('Response was not valid JSON, using raw content');
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
