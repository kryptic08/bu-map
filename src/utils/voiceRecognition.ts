export type VoiceRecognitionResult = {
  transcript: string;
};

export type VoiceRecognitionResultListItem = {
  isFinal: boolean;
  [index: number]: VoiceRecognitionResult;
};

export type VoiceRecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<VoiceRecognitionResultListItem>;
};

export type VoiceRecognitionErrorEvent = {
  error: string;
};

export type VoiceRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: VoiceRecognitionEvent) => void) | null;
  onerror: ((event: VoiceRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export type VoiceRecognitionConstructor = new () => VoiceRecognitionInstance;

const HF_API_KEY = (import.meta.env.VITE_HF_API_KEY ?? "").trim();

export function isHFTranscriptionConfigured(): boolean {
  return HF_API_KEY.length > 0;
}

export function getVoiceRecognitionConstructor(): VoiceRecognitionConstructor | null {
  if (typeof window === "undefined") {
    return null;
  }

  const voiceWindow = window as Window & {
    SpeechRecognition?: VoiceRecognitionConstructor;
    webkitSpeechRecognition?: VoiceRecognitionConstructor;
  };

  return (
    voiceWindow.SpeechRecognition ?? voiceWindow.webkitSpeechRecognition ?? null
  );
}

export function isBrowserSpeechRecognitionSupported(): boolean {
  return getVoiceRecognitionConstructor() !== null;
}

/**
 * Check if the browser supports audio capture and transcription via FastAPI
 * Requires MediaRecorder API and getUserMedia support
 */
export function isFastAPIVoiceSupportedInBrowser(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const hasMediaRecorder = typeof MediaRecorder !== "undefined";
  const hasGetUserMedia = !!(
    navigator.mediaDevices && navigator.mediaDevices.getUserMedia
  );

  return hasMediaRecorder && hasGetUserMedia;
}

/**
 * Transcribe audio using FastAPI endpoint
 * Sends audio blob to the Hugging Face Space endpoint for transcription
 */
export async function transcribeAudioWithFastAPI(
  audioBlob: Blob,
): Promise<string> {
  if (!isHFTranscriptionConfigured()) {
    throw new Error(
      "HF API key not configured. Please set VITE_HF_API_KEY in .env.local",
    );
  }

  const formData = new FormData();
  formData.append("file", audioBlob, "audio.webm");

  console.log("[FastAPI] Sending audio to transcription endpoint...");
  const response = await fetch("https://veccode-wish.hf.space/transcribe", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[FastAPI] Transcription failed with status:", response.status, errorText);
    throw new Error(
      `FastAPI transcription failed: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as { text?: string; transcript?: string };
  const transcript = data.text || data.transcript || "";
  console.log("[FastAPI] Transcription successful:", transcript);
  return transcript;
}

export type BrowserSpeechOptions = {
  lang?: string;
  signal?: AbortSignal;
};

export async function transcribeWithBrowserSpeechRecognition(
  options: BrowserSpeechOptions = {},
): Promise<string> {
  const SpeechRecognition = getVoiceRecognitionConstructor();
  if (!SpeechRecognition) {
    throw new Error("Browser speech recognition is not supported.");
  }

  const { lang = "en-US", signal } = options;

  return new Promise<string>((resolve, reject) => {
    const recognition = new SpeechRecognition();
    let settled = false;

    const cleanup = () => {
      signal?.removeEventListener("abort", onAbort);
    };

    const safeResolve = (value: string) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve(value);
    };

    const safeReject = (reason: Error) => {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(reason);
    };

    const onAbort = () => {
      recognition.stop();
      safeReject(new Error("Audio capture was cancelled."));
    };

    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const firstResult = event.results[0];
      const firstAlternative = firstResult?.[0];
      safeResolve(firstAlternative?.transcript?.trim() ?? "");
    };

    recognition.onerror = (event) => {
      safeReject(new Error(`Speech recognition error: ${event.error}`));
    };

    recognition.onend = () => {
      safeResolve("");
    };

    if (signal?.aborted) {
      safeReject(new Error("Audio capture was cancelled."));
      return;
    }

    signal?.addEventListener("abort", onAbort, { once: true });

    try {
      recognition.start();
    } catch (error) {
      safeReject(
        error instanceof Error
          ? error
          : new Error("Failed to start speech recognition."),
      );
    }
  });
}

export type CaptureAudioOptions = {
  maxDurationMs?: number;
  timesliceMs?: number;
  signal?: AbortSignal;
};

function getSupportedAudioMimeType() {
  if (typeof MediaRecorder === "undefined") {
    return undefined;
  }

  if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
    return "audio/webm;codecs=opus";
  }
  if (MediaRecorder.isTypeSupported("audio/webm")) {
    return "audio/webm";
  }

  return undefined;
}

/**
 * Capture audio from microphone using MediaRecorder API
 * Returns a promise that resolves with the audio blob when recording stops
 */
export async function captureAudioFromMicrophone(
  options: CaptureAudioOptions = {},
): Promise<Blob> {
  if (typeof window === "undefined") {
    throw new Error("captureAudioFromMicrophone can only be called in a browser");
  }

  const { maxDurationMs = 4500, timesliceMs = 250, signal } = options;

  console.log("[Microphone] Requesting microphone access...");
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  console.log("[Microphone] Microphone access granted");

  if (signal?.aborted) {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
    throw new Error("Audio capture was cancelled.");
  }

  const mimeType = getSupportedAudioMimeType();
  const mediaRecorder = mimeType
    ? new MediaRecorder(stream, { mimeType })
    : new MediaRecorder(stream);
  const audioChunks: BlobPart[] = [];
  let didAbort = false;

  mediaRecorder.ondataavailable = (event: BlobEvent) => {
    if (event.data.size > 0) {
      console.log("[Microphone] Recording data chunk received:", event.data.size, "bytes");
      audioChunks.push(event.data);
    }
  };

  return new Promise<Blob>((resolve, reject) => {
    let stopTimeout: number | null = null;

    const stopTracks = () => {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    };

    const safeStopRecorder = () => {
      if (mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
    };

    const onAbort = () => {
      didAbort = true;
      console.log("[Microphone] Capture cancelled by user");
      safeStopRecorder();
    };

    signal?.addEventListener("abort", onAbort, { once: true });

    mediaRecorder.onstop = () => {
      console.log("[Microphone] Recording stopped");
      if (stopTimeout !== null) {
        window.clearTimeout(stopTimeout);
      }
      signal?.removeEventListener("abort", onAbort);
      stopTracks();

      if (didAbort) {
        reject(new Error("Audio capture was cancelled."));
        return;
      }

      const audioBlob = new Blob(audioChunks, {
        type: mediaRecorder.mimeType || "audio/webm",
      });
      console.log("[Microphone] Audio blob created, total size:", audioBlob.size, "bytes");

      if (audioBlob.size === 0) {
        reject(new Error("No audio captured."));
        return;
      }

      resolve(audioBlob);
    };

    mediaRecorder.onerror = (event: ErrorEvent) => {
      console.error("[Microphone] MediaRecorder error:", event.message);
      if (stopTimeout !== null) {
        window.clearTimeout(stopTimeout);
      }
      signal?.removeEventListener("abort", onAbort);
      stopTracks();
      reject(new Error(`MediaRecorder error: ${event.message}`));
    };

    // Start short-window recording to reduce end-to-end latency.
    console.log("[Microphone] Starting audio recording...");
    mediaRecorder.start(timesliceMs);

    // Auto-stop quickly so transcription can start sooner.
    stopTimeout = window.setTimeout(() => {
      if (mediaRecorder.state !== "inactive") {
        console.log(
          `[Microphone] Auto-stopping recording after ${maxDurationMs} ms`,
        );
        mediaRecorder.stop();
      }
    }, maxDurationMs);
  });
}
