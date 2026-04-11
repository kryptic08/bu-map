/**
 * OpenAI Audio Transcription Service
 * Uses OpenAI's Whisper and GPT-4o transcription models
 */

const OPENAI_API_KEY = (import.meta.env.VITE_OPENAI_API_KEY ?? "").trim();
const TRANSCRIPTION_ENDPOINT = "https://api.openai.com/v1/audio/transcriptions";

export function isOpenAITranscriptionConfigured(): boolean {
  return OPENAI_API_KEY.length > 0;
}

export type TranscriptionModel = "whisper-1" | "gpt-4o-mini-transcribe" | "gpt-4o-transcribe";

export type TranscriptionOptions = {
  model?: TranscriptionModel;
  prompt?: string;
  language?: string;
  temperature?: number;
};

/**
 * Transcribe audio using OpenAI's Transcription API
 * Supports whisper-1, gpt-4o-mini-transcribe, and gpt-4o-transcribe models
 */
export async function transcribeAudioWithOpenAI(
  audioBlob: Blob,
  options: TranscriptionOptions = {},
): Promise<string> {
  if (!isOpenAITranscriptionConfigured()) {
    throw new Error(
      "OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in .env.local",
    );
  }

  const {
    model = "gpt-4o-mini-transcribe", // Use newer model by default
    prompt = "Bicol University Polangui campus navigation. Buildings: Salceda Building, Computer and Engineering Studies, Nursing Department, Administration Building, Gymnasium, Library, Canteen, Food Technology, Automotive Building. Common terms: CCES, ECB, SB, Computer Lab (CL1-CL6), Engineering Lab, Chemistry Lab (SB-11, SB-12), Library, NSTP, ROTC, Registrar, Guidance Office, Alumni Office, Cashier.",
    language = "en",
    temperature = 0,
  } = options;

  const formData = new FormData();
  formData.append("file", audioBlob, "audio.webm");
  formData.append("model", model);
  formData.append("response_format", "text");
  
  if (prompt) {
    formData.append("prompt", prompt);
  }
  
  if (language && model !== "whisper-1") {
    formData.append("language", language);
  }
  
  if (temperature !== undefined) {
    formData.append("temperature", temperature.toString());
  }

  console.log(
    "[OpenAI Transcription] Sending audio to OpenAI:",
    {
      model,
      size: audioBlob.size,
      type: audioBlob.type,
    }
  );

  const response = await fetch(TRANSCRIPTION_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      "[OpenAI Transcription] Failed with status:",
      response.status,
      errorText,
    );

    let errorMessage = `OpenAI transcription failed: ${response.status} ${response.statusText}`;
    
    if (response.status === 401) {
      errorMessage = "Invalid OpenAI API key. Please check your VITE_OPENAI_API_KEY in .env.local";
    } else if (response.status === 429) {
      errorMessage = "OpenAI rate limit exceeded. Please try again later.";
    } else if (response.status === 413) {
      errorMessage = "Audio file too large (max 25 MB). Please record a shorter message.";
    }

    throw new Error(errorMessage);
  }

  const transcript = await response.text();
  console.log("[OpenAI Transcription] Success:", transcript);
  
  return transcript.trim();
}

/**
 * Transcribe audio with streaming support
 * Returns an async generator that yields transcript chunks as they arrive
 */
export async function* transcribeAudioStreamWithOpenAI(
  audioBlob: Blob,
  options: TranscriptionOptions = {},
): AsyncGenerator<string, void, unknown> {
  if (!isOpenAITranscriptionConfigured()) {
    throw new Error(
      "OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in .env.local",
    );
  }

  const {
    model = "gpt-4o-mini-transcribe",
    prompt,
    language = "en",
  } = options;

  // Only gpt-4o models support streaming
  if (model === "whisper-1") {
    const transcript = await transcribeAudioWithOpenAI(audioBlob, options);
    yield transcript;
    return;
  }

  const formData = new FormData();
  formData.append("file", audioBlob, "audio.webm");
  formData.append("model", model);
  formData.append("response_format", "text");
  formData.append("stream", "true");
  
  if (prompt) {
    formData.append("prompt", prompt);
  }
  
  if (language) {
    formData.append("language", language);
  }

  console.log("[OpenAI Transcription] Starting stream...");

  const response = await fetch(TRANSCRIPTION_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[OpenAI Transcription] Stream failed:", response.status, errorText);
    throw new Error(`OpenAI transcription stream failed: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Failed to get response stream reader");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            continue;
          }

          try {
            const event = JSON.parse(data);
            if (event.text) {
              yield event.text;
            }
          } catch (e) {
            console.warn("[OpenAI Transcription] Failed to parse event:", line);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
