import type { PresetDestination } from "../types/navigation";
import type { ConversationMessage } from "../types/conversation";
import { getCampusDirectoryText } from "../data/campusDirectory";
import { getCampusServicesText } from "../data/campusServices";

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

  const systemPrompt = `You are an AI navigation assistant for Bicol University campus. Your role is to help users navigate to campus locations.

Available destinations:
${destinationList}

When a user provides a voice command:
1. Determine if they want to go to a specific location
2. Match their request to one of the available destinations
3. If the match is clear, respond with the exact destination label
4. If unclear, ask for clarification or provide helpful suggestions

Your response MUST be a JSON object with this exact structure:
{
  "destination": "exact destination label or null",
  "message": "helpful message to the user",
  "confidence": "high" | "medium" | "low"
}

Examples:
- User: "take me to the gym" → {"destination": "Gym B", "message": "Navigating to Gym B", "confidence": "high"}
- User: "I need to go to class" → {"destination": null, "message": "Which building is your class in? We have College of Education, College of Science, and other buildings.", "confidence": "low"}
- User: "where is the library" → {"destination": "Main Library", "message": "Found the Main Library. Starting navigation.", "confidence": "high"}`;

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
        max_tokens: 200,
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
  },
): Promise<{
  message: string;
  action?: { type: "navigate"; destination: string };
  room?: string | null;
}> {
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

  // Get comprehensive campus directory and services
  const campusDirectory = getCampusDirectoryText();
  const campusServices = getCampusServicesText();

  const systemPrompt = `You are a helpful AI assistant for Bicol University Polangui Campus navigation. You help students and visitors navigate the campus and answer questions about campus locations, buildings, rooms, facilities, and services.

COMPLETE CAMPUS DIRECTORY:
${campusDirectory}

CAMPUS SERVICES & TRANSACTIONS GUIDE:
${campusServices}

NAVIGABLE DESTINATIONS:
${destinationList}

${context.currentLocation ? `Current location: ${context.currentLocation}` : ""}
${context.destination ? `Current destination: ${context.destination}` : ""}
${context.isNavigating ? "User is currently navigating to a destination." : ""}

LATEST-REQUEST PRIORITY RULE:
- Always treat the LATEST user message as the highest priority instruction.
- If the latest user message asks for a different destination than earlier messages, navigate to the latest requested destination.
- Do not keep navigating to an old destination unless the latest user message explicitly says to continue with it.
- When the latest message is a navigation request, return an action for that latest request.

You can:
1. Answer questions about specific rooms, laboratories, offices, and facilities
2. Tell users which building and floor a room is located on
3. Provide directions to buildings and rooms
4. Give information about what's available on campus
5. Help users find specific departments, offices, or facilities
6. Answer questions about campus services, transactions, and fees
7. Have casual conversation about campus life

When a user wants to navigate somewhere, respond with JSON that includes an action.
CRITICAL NAVIGATION RULES:
- When user asks where a specific room, office, or facility is located, treat it as a navigation request and include an action to the correct building destination.
- When user asks for "library", "librarian", or library-related rooms → navigate to "Salceda Building" (library is on 2nd floor)
- When user asks for "ID", "university ID", "identification card", "ID reprint", "lost ID", "defaced ID", "mutilated ID", "faded ID", or "CSAC" → navigate to "Salceda Building" (CSAC office is located in Salceda Building)
- When user asks for ECB rooms (ECB 12-19, ECB 201-204, CL1-CL6, computer labs) → navigate to "Salceda Building 2 (Computer & Engineering)"
- When user asks for "gym", "sports", "fitness" → navigate to "BUP GYM"
- When user asks for "nursing" related rooms → navigate to "Nursing Department"
- When user asks for "registrar", "enrollment", "transcript", "academic records" → navigate to "Registrar"
- When user asks for "cashier", "payment", "fees" → navigate to "Administrative Building"
- When user asks for "health", "medical", "dental", "clinic" → navigate to "Medical and Dental Clinic Bicol Univerity Health Services"
- If request contains both "ID" and "payment/fee", prioritize ID issuance/reprint at CSAC and navigate to "Salceda Building" unless user explicitly asks for cashier payment window.
- Always match the EXACT destination label from the NAVIGABLE DESTINATIONS list

Response format for navigation - INCLUDE DETAILED DIRECTIONS:
{"message": "I'll navigate you to [destination]. [Room name] is located on the [floor] floor of [building]. You can see the floor plan and room location on the map as you navigate there. I'm starting the route from [current location].", "action": {"type": "navigate", "destination": "exact destination label from NAVIGABLE DESTINATIONS"}, "room": "exact room/office label if user asked for a specific room, otherwise null"}

For informational questions only (no navigation):
{"message": "your detailed, helpful response about the location", "room": null}

IMPORTANT: 
- Use the complete campus directory to provide accurate room and building information
- When mentioning rooms, always include the building name and floor
- Be specific about room codes (like SB-11, CL1, ECB 201, etc.)
- If a user asks about a specific room or office, tell them exactly which building and floor it's on
- If a user asks for a specific room/office (example: library, cashier, csac, ict lab), include that room/office name in the "room" field
- For navigation responses, mention the starting point and destination for clarity
- Include room floor information in your navigation message
- When users ask about services or fees, refer to the Campus Services section above
- Provide specific fee amounts when asked about costs (e.g., "Transcript of Records: ₱30.00 per page")

Be friendly, helpful, and conversational. Keep responses concise but informative.`;

  // Keep only recent history so the latest request dominates navigation behavior
  const recentHistory = conversationHistory.slice(-6);

  // Convert conversation history to OpenAI format
  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...recentHistory.map((msg) => ({
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
        temperature: 0.7,
        max_tokens: 300,
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
      room?: string | null;
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
