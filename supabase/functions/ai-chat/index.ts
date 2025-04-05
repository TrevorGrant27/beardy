// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_API_VERSION = '2023-06-01';
const CLAUDE_MODEL = 'claude-3-haiku-20240307'; // Or use Sonnet/Opus if needed

const SYSTEM_PROMPT = `You are Beardy Bot, an expert assistant specializing in bearded dragon care. Your goal is to provide helpful, accurate, and safe information based on the user's questions. 

IMPORTANT: Always include the following disclaimer at the end of your response, exactly as written: "Disclaimer: I am an AI assistant and cannot provide professional veterinary advice. Always consult a qualified veterinarian for medical concerns regarding your bearded dragon."

Do not engage in conversations outside the topic of bearded dragon care. Be friendly and informative.`;

interface RequestBody {
  history: { role: 'user' | 'assistant'; content: string }[];
  newMessage: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Ensure POST request
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let requestBody: RequestBody;
  try {
    requestBody = await req.json();
  } catch (error) {
    console.error('Failed to parse request body:', error);
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { history = [], newMessage } = requestBody;

  if (!newMessage) {
    return new Response(JSON.stringify({ error: 'newMessage is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Retrieve the API key from environment variables (set via Supabase secrets)
  const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!anthropicApiKey) {
    console.error('ANTHROPIC_API_KEY environment variable not set');
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error: API key not configured',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Construct the messages array for Anthropic API
  const messages = [
    ...history, // Include previous messages if provided
    { role: 'user', content: newMessage },
  ];

  try {
    const anthropicResponse = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': anthropicApiKey,
        'anthropic-version': ANTHROPIC_API_VERSION,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        system: SYSTEM_PROMPT,
        messages: messages,
        max_tokens: 1024, // Adjust as needed
      }),
    });

    if (!anthropicResponse.ok) {
      const errorBody = await anthropicResponse.text();
      console.error(
        `Anthropic API error: ${anthropicResponse.status} ${anthropicResponse.statusText}`,
        errorBody
      );
      return new Response(
        JSON.stringify({
          error: `Failed to get response from AI: ${anthropicResponse.statusText}`,
        }),
        {
          status: anthropicResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const responseJson = await anthropicResponse.json();

    // Extract the text response (assuming the first content block is text)
    const aiContent =
      responseJson.content?.[0]?.text || 'No response content found.';

    // Send the AI's response back to the client
    return new Response(JSON.stringify({ reply: aiContent }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal Server Error: Failed to call AI service',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/ai-chat' \
    --header 'Authorization: Bearer ' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
