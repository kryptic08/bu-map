/**
 * Real-time Transcription Service
 * Handles streaming transcription with real-time language filtering (English and Tagalog)
 */

import { isValidLanguage, getLanguageConfidenceScore } from "../utils/languageDetection";

export type RealtimeTranscriptionOptions = {
  language?: "en" | "tl";
  minConfidence?: number; // Minimum confidence score (0-1) required to accept transcription
  maxDurationMs?: number;
  signal?: AbortSignal;
};

export type RealtimeTranscriptionUpdate = {
  interim: string; // Real-time interim result
  final: string; // Final confirmed transcription
  isValid: boolean; // Whether text is detected as valid language
  confidence: number; // Language confidence score (0-1)
  isFinal: boolean; // Whether this is a final result
};

/**
 * Real-time transcription using browser's Web Speech API with language filtering
 * Yields partial results as they arrive, filtering for valid language content (English or Tagalog)
 */
export async function* transcribeRealtimeWithBrowserSpeech(
  options: RealtimeTranscriptionOptions = {},
): AsyncGenerator<RealtimeTranscriptionUpdate, void, unknown> {
  const { language = "en", minConfidence = 0.5, signal } = options;

  const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognitionAPI) {
    throw new Error("Browser Speech Recognition API not supported");
  }

  const recognition = new SpeechRecognitionAPI();
  recognition.continuous = true;
  recognition.interimResults = true;
  // Use language code mapping for browser API
  const browserLang = language === "tl" ? "fil-PH" : "en-US";
  recognition.lang = browserLang;

  let finalTranscript = "";
  let aborted = false;

  const onAbort = () => {
    aborted = true;
    recognition.stop();
  };

  signal?.addEventListener("abort", onAbort);

  try {
    // Wrap the event listeners in a queue system
    const resultQueue: RealtimeTranscriptionUpdate[] = [];
    let resolveQueue: (() => void) | null = null;

    const enqueueResult = (result: RealtimeTranscriptionUpdate) => {
      resultQueue.push(result);
      if (resolveQueue) {
        resolveQueue();
        resolveQueue = null;
      }
    };

    const waitForResult = (): Promise<RealtimeTranscriptionUpdate | null> => {
      if (resultQueue.length > 0) {
        return Promise.resolve(resultQueue.shift() || null);
      }
      return new Promise((resolve) => {
        resolveQueue = () => {
          const result = resultQueue.shift() || null;
          resolve(result);
        };
      });
    };

    recognition.onerror = (event: any) => {
      console.error("[Realtime Speech] Error:", event.error);
      enqueueResult({ interim: "", final: "", isValid: false, confidence: 0, isFinal: true });
    };

    recognition.onend = () => {
      console.log("[Realtime Speech] Recognition ended");
      enqueueResult({ interim: "", final: "", isValid: false, confidence: 0, isFinal: true });
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = "";

      // Collect results from the event
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      // Check if interim result is valid language and meets confidence threshold
      if (interimTranscript) {
        const isValid = isValidLanguage(interimTranscript);
        const confidence = getLanguageConfidenceScore(interimTranscript);

        console.log("[Realtime Speech] Interim result:", {
          text: interimTranscript.substring(0, 50),
          isValid,
          confidence: confidence.toFixed(2),
        });

        // Only queue if valid language content and meets confidence threshold
        if (isValid && confidence >= minConfidence) {
          enqueueResult({
            interim: interimTranscript,
            final: finalTranscript.trim(),
            isValid: true,
            confidence,
            isFinal: false,
          });
        }
      }

      // Check if final result is valid language and meets confidence threshold
      if (finalTranscript) {
        const isValid = isValidLanguage(finalTranscript);
        const confidence = getLanguageConfidenceScore(finalTranscript);

        console.log("[Realtime Speech] Final result:", {
          text: finalTranscript.substring(0, 50),
          isValid,
          confidence: confidence.toFixed(2),
        });

        // Only queue final result if valid language and meets threshold
        if (isValid && confidence >= minConfidence) {
          enqueueResult({
            interim: "",
            final: finalTranscript.trim(),
            isValid: true,
            confidence,
            isFinal: true,
          });
        }
      }
    };

    console.log("[Realtime Speech] Starting recognition...");
    recognition.start();

    // Yield results from the queue
    while (!aborted) {
      const result = await waitForResult();
      if (result) {
        yield result;
        if (result.isFinal) {
          break;
        }
      } else {
        break;
      }
    }
  } finally {
    signal?.removeEventListener("abort", onAbort);
  }
}

/**
 * Real-time transcription using OpenAI Whisper with streaming
 * Captures audio in chunks and transcribes in real-time with language filtering
 */
export async function* transcribeRealtimeWithOpenAI(
  audioBlob: Blob,
  options: RealtimeTranscriptionOptions = {},
): AsyncGenerator<RealtimeTranscriptionUpdate, void, unknown> {
  const { language = "en", minConfidence = 0.5 } = options;

  const OPENAI_API_KEY = (import.meta.env.VITE_OPENAI_API_KEY ?? "").trim();
  const TRANSCRIPTION_ENDPOINT = "https://api.openai.com/v1/audio/transcriptions";

  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const formData = new FormData();
  formData.append("file", audioBlob, "audio.webm");
  formData.append("model", "whisper-1");  // Optimized for speed
  formData.append("response_format", "text");
  // Map language code to OpenAI language parameter
  formData.append("language", language === "tl" ? "tl" : "en");

  console.log("[Realtime OpenAI] Sending audio for transcription...");

  try {
    const response = await fetch(TRANSCRIPTION_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const transcript = await response.text();
    const trimmed = transcript.trim();

    console.log("[Realtime OpenAI] Transcription complete:", trimmed.substring(0, 50));

    // Validate language content
    const isValid = isValidLanguage(trimmed);
    const confidence = getLanguageConfidenceScore(trimmed);

    console.log("[Realtime OpenAI] Language check:", {
      isValid,
      confidence: confidence.toFixed(2),
      minRequired: minConfidence.toFixed(2),
    });

    // Only yield if meets requirements
    if (isValid && confidence >= minConfidence) {
      yield {
        interim: "",
        final: trimmed,
        isValid: true,
        confidence,
        isFinal: true,
      };
    } else if (!isValid) {
      console.warn("[Realtime OpenAI] Non-valid language detected - rejecting");
      throw new Error("Only English or Tagalog language input is accepted");
    } else {
      console.warn("[Realtime OpenAI] Confidence too low - rejecting");
      throw new Error(`Language confidence (${confidence.toFixed(2)}) below minimum (${minConfidence})`);
    }
  } catch (error) {
    console.error("[Realtime OpenAI] Error:", error);
    throw error;
  }
}

/**
 * Real-time transcription using FastAPI endpoint with language filtering
 */
export async function* transcribeRealtimeWithFastAPI(
  audioBlob: Blob,
  fastApiUrl: string,
  options: RealtimeTranscriptionOptions = {},
): AsyncGenerator<RealtimeTranscriptionUpdate, void, unknown> {
  const { minConfidence = 0.5 } = options;

  const formData = new FormData();
  formData.append("file", audioBlob, "audio.webm");

  console.log("[Realtime FastAPI] Sending audio for transcription...");

  try {
    const response = await fetch(fastApiUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`FastAPI error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as { text?: string; transcript?: string };
    const transcript = data.text || data.transcript || "";
    const trimmed = transcript.trim();

    console.log("[Realtime FastAPI] Transcription complete:", trimmed.substring(0, 50));

    // Validate language content
    const isValid = isValidLanguage(trimmed);
    const confidence = getLanguageConfidenceScore(trimmed);

    console.log("[Realtime FastAPI] Language check:", {
      isValid,
      confidence: confidence.toFixed(2),
      minRequired: minConfidence.toFixed(2),
    });

    // Only yield if meets requirements
    if (isValid && confidence >= minConfidence) {
      yield {
        interim: "",
        final: trimmed,
        isValid: true,
        confidence,
        isFinal: true,
      };
    } else if (!isValid) {
      console.warn("[Realtime FastAPI] Non-valid language detected - rejecting");
      throw new Error("Only English or Tagalog language input is accepted");
    } else {
      console.warn("[Realtime FastAPI] Confidence too low - rejecting");
      throw new Error(`Language confidence (${confidence.toFixed(2)}) below minimum (${minConfidence})`);
    }
  } catch (error) {
    console.error("[Realtime FastAPI] Error:", error);
    throw error;
  }
}
