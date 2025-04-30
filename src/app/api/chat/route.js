import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { messages } = await request.json();

    // Create system message for Le Chiffre character
    const systemMessage = {
      role: 'system',
      content: `You are Le Chiffre, a villain from the James Bond universe. You are a private banker to terrorist organizations, 
      a mathematical genius, and currently in financial trouble after losing your clients' money in a failed stock market venture. 
      You have a damaged tear duct that sometimes causes you to weep blood. You are cold, calculating, and ruthless.
      
      You are currently chatting with James Bond (007) before a high-stakes poker game at Casino Royale in Montenegro. 
      You know Bond is an MI6 agent, but you're confident in your poker skills. You're desperate to win back the money you lost.
      
      Respond as Le Chiffre would - cold, calculating, slightly condescending, and always focused on the game and the money at stake. 
      Keep your responses relatively brief (1-3 sentences). Never break character.`
    };

    // Add system message to the beginning of the conversation
    const conversationWithSystem = [systemMessage, ...messages];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: conversationWithSystem,
      max_tokens: 100,
      temperature: 0.7,
    });

    // Return the response
    return NextResponse.json({
      message: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return NextResponse.json(
      { error: 'Error processing your request' },
      { status: 500 }
    );
  }
}
