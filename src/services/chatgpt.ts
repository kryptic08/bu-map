import type { PresetDestination } from "../types/navigation";
import type { ConversationMessage } from "../types/conversation";
import { getCampusDirectoryText } from "../data/campusDirectory";

const OPENAI_API_KEY = (import.meta.env.VITE_OPENAI_API_KEY ?? "").trim();
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export function isOpenAIConfigured(): boolean {
  return OPENAI_API_KEY.length > 0;
}

export type ChatGPTResponse = {
  destination: string | null;
  message: string;
  confidence: "high" | "medium" | "low";
};

/**
 * Send voice command to ChatGPT for intelligent processing
 * ChatGPT will understand the user's intent and match it to preset destinations
 */
export async function processVoiceCommandWithChatGPT(
  voiceCommand: string,
  availableDestinations: PresetDestination[],
): Promise<ChatGPTResponse> {
  if (!isOpenAIConfigured()) {
    throw new Error(
      "OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in .env.local",
    );
  }

  // Build a list of available destinations for ChatGPT context
  const destinationList = availableDestinations
    .map((dest) => {
      const keywords = dest.keywords.join(", ");
      return `- ${dest.label} (keywords: ${keywords})`;
    })
    .join("\n");

  // Get complete campus directory for detailed room/building knowledge
  const campusDirectory = getCampusDirectoryText();

  const systemPrompt = `You are an AI navigation assistant for Bicol University Polangui campus. Match user voice commands to campus locations.

${campusDirectory}

Main Navigation Destinations (mappable locations):
${destinationList}

IMPORTANT: Keep messages SHORT (1 sentence max).

LIBRARY RULE: When user mentions "library", "lib", "librarian", "books", or "study" - ALWAYS set destination to "Salceda Building" because the library is on its 2nd floor.

Your response MUST be JSON:
{
  "destination": "exact destination label or null",
  "message": "brief message (1 sentence)",
  "confidence": "high" | "medium" | "low"
}

Examples:
- "take me to gym" → {"destination": "BUP GYM", "message": "Navigating to BUP GYM.", "confidence": "high"}
- "canteen" or "food" → {"destination": "BUP Canteen", "message": "Taking you to the canteen.", "confidence": "high"}
- "nursing department" → {"destination": "Nursing Department", "message": "Navigating to Nursing.", "confidence": "high"}
- "registrar" → {"destination": "Registrar", "message": "Going to registrar.", "confidence": "high"}
- "admin building" → {"destination": "Administrative Building", "message": "Going to admin building.", "confidence": "high"}
- "library" or "books" → {"destination": "Salceda Building", "message": "Library is on 2nd floor.", "confidence": "high"}
- "computer lab 3" or "CL3" → {"destination": "Center for Computer and Engineering Studies / Salceda Building 2", "message": "Navigating to CL3.", "confidence": "high"}

Be direct. No extra explanations.`;

  const userMessage = `User voice command: "${voiceCommand}"`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 80, // Reduced for brief responses
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[ChatGPT] API request failed:",
        response.status,
        errorText,
      );
      throw new Error(
        `ChatGPT API request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("ChatGPT returned empty response");
    }

    const parsedResponse = JSON.parse(content) as ChatGPTResponse;
    console.log("[ChatGPT] Response:", parsedResponse);

    return parsedResponse;
  } catch (error) {
    console.error("[ChatGPT] Error processing voice command:", error);
    throw error;
  }
}

/**
 * Chat with AI in a conversational manner about campus navigation
 * Maintains conversation history and can trigger navigation actions
 */
export async function chatWithAI(
  userMessage: string,
  conversationHistory: ConversationMessage[],
  context: {
    currentLocation?: string;
    destination?: string;
    availableDestinations: PresetDestination[];
    isNavigating: boolean;
    routeInfo?: {
      distance: number;
      duration: number;
      profile: "foot" | "driving";
      steps: Array<{ instruction: string; distance: number }>;
    };
  },
): Promise<{ message: string; action?: { type: "navigate"; destination: string } }> {
  if (!isOpenAIConfigured()) {
    throw new Error(
      "OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in .env.local",
    );
  }

  const destinationList = context.availableDestinations
    .map((dest) => {
      const keywords = dest.keywords.join(", ");
      return `- ${dest.label} (keywords: ${keywords})`;
    })
    .join("\n");

  // Get complete campus directory for detailed room/building knowledge
  const campusDirectory = getCampusDirectoryText();

  // Build route information if available
  let routeDetails = "";
  if (context.routeInfo && context.destination) {
    const distanceKm = (context.routeInfo.distance / 1000).toFixed(2);
    const durationMin = Math.ceil(context.routeInfo.duration / 60);
    const mode = context.routeInfo.profile === "foot" ? "walking" : "driving";
    
    routeDetails = `
Current Route Information:
- From: ${context.currentLocation || "current location"}
- To: ${context.destination}
- Distance: ${distanceKm} km (${context.routeInfo.distance} meters)
- Duration: ${durationMin} minutes
- Mode: ${mode}
- Steps: ${context.routeInfo.steps.length} navigation steps

Navigation Steps:
${context.routeInfo.steps.map((step, i) => `${i + 1}. ${step.instruction} (${step.distance}m)`).join("\n")}
`;
  }

  const systemPrompt = `You are a helpful AI assistant for Bicol University Polangui campus navigation. You help students and visitors navigate the campus and answer questions about campus locations, rooms, and facilities.

${campusDirectory}

Main Navigation Destinations (mappable locations):
${destinationList}

${context.currentLocation ? `Current location: ${context.currentLocation}` : ""}
${context.destination ? `Current destination: ${context.destination}` : ""}
${context.isNavigating ? "User is currently navigating to a destination." : ""}
${routeDetails}

IMPORTANT: Keep ALL responses SHORT and DIRECT. Maximum 1-2 sentences. No long explanations.

LIBRARY RULE: When user mentions "library", "lib", "librarian", "books", or "study" - ALWAYS navigate to "Salceda Building" because the library is located on its 2nd floor.

When a user wants to navigate somewhere NEW, respond with JSON that includes an action:
{"message": "Navigating to [destination]. [Distance] away, about [time] minutes.", "action": {"type": "navigate", "destination": "exact destination label"}}

When user asks about a SPECIFIC ROOM or OFFICE, provide brief details and navigate:
{"message": "[Room] is on [floor] floor. Navigating there now.", "action": {"type": "navigate", "destination": "exact destination label"}}

When user asks about the CURRENT route, provide brief details:
{"message": "[Distance] to [destination], about [time] minutes. Next: [instruction]"}

For general questions:
{"message": "brief answer in 1 sentence"}

Examples:
- "canteen" or "food" → {"message": "Navigating to BUP Canteen.", "action": {"type": "navigate", "destination": "BUP Canteen"}}
- "nursing department" → {"message": "Going to Nursing Department.", "action": {"type": "navigate", "destination": "Nursing Department"}}
- "registrar" → {"message": "Navigating to Registrar.", "action": {"type": "navigate", "destination": "Registrar"}}
- "admin building" → {"message": "Navigating to Administrative Building.", "action": {"type": "navigate", "destination": "Administrative Building"}}
- "take me to gym" → {"message": "Navigating to BUP GYM.", "action": {"type": "navigate", "destination": "BUP GYM"}}
- "library" or "books" → {"message": "Library on 2nd floor Salceda. Navigating now.", "action": {"type": "navigate", "destination": "Salceda Building"}}
- "computer lab 3" → {"message": "CL3 on 2nd floor Salceda. Navigating now.", "action": {"type": "navigate", "destination": "Center for Computer and Engineering Studies / Salceda Building 2"}}
- "how far?" → {"message": "290m to your destination, about 2 minutes walking."}

Be direct and concise. No greetings, no extra details unless asked.`;

  // Convert conversation history to OpenAI format
  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...conversationHistory.map((msg) => ({
      role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
      content: msg.content,
    })),
    { role: "user" as const, content: userMessage },
  ];

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.3, // Lower temperature for more focused responses
        max_tokens: 100, // Reduced from 300 to force concise responses
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "[ChatGPT] Conversation API request failed:",
        response.status,
        errorText,
      );
      throw new Error(
        `ChatGPT API request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("ChatGPT returned empty response");
    }

    const parsedResponse = JSON.parse(content) as {
      message: string;
      action?: { type: "navigate"; destination: string };
    };

    console.log("[ChatGPT] Conversation response:", parsedResponse);

    return parsedResponse;
  } catch (error) {
    console.error("[ChatGPT] Error in conversation:", error);
    throw error;
  }
}

/**
 * Ask ChatGPT a general question about campus navigation
 */
export async function askChatGPTQuestion(
  question: string,
  context: {
    currentLocation?: string;
    destination?: string;
    availableDestinations: PresetDestination[];
  },
): Promise<string> {
  if (!isOpenAIConfigured()) {
    throw new Error(
      "OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in .env.local",
    );
  }

  const destinationList = context.availableDestinations
    .map((dest) => `- ${dest.label}: ${dest.summary}`)
    .join("\n");

  const systemPrompt = `You are a helpful AI assistant for Bicol University campus navigation. 
You help students and visitors navigate the campus and answer questions about campus locations.

Available campus locations:
${destinationList}

${context.currentLocation ? `Current location: ${context.currentLocation}` : ""}
${context.destination ? `Current destination: ${context.destination}` : ""}

Provide concise, helpful responses. Keep answers brief (2-3 sentences max) unless detailed information is specifically requested.`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      throw new Error(`ChatGPT API request failed: ${response.status}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    return data.choices?.[0]?.message?.content ?? "I couldn't process that question.";
  } catch (error) {
    console.error("[ChatGPT] Error asking question:", error);
    throw error;
  }
}
