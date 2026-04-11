/**
 * Voice Activity Detection (VAD)
 * Automatically detects when user is speaking without manual button clicks
 */

export type VADConfig = {
  /** Minimum audio level to consider as speech (0-255) */
  speechThreshold?: number;
  /** Minimum duration of silence to end speech (ms) */
  silenceDuration?: number;
  /** Minimum duration of speech to be valid (ms) */
  minSpeechDuration?: number;
  /** Maximum duration of continuous recording (ms) */
  maxRecordingDuration?: number;
  /** How often to check audio levels (ms) */
  checkInterval?: number;
};

export type VADCallbacks = {
  onSpeechStart?: () => void;
  onSpeechEnd?: (audioBlob: Blob) => void;
  onError?: (error: Error) => void;
  onVolumeChange?: (volume: number) => void;
};

const DEFAULT_CONFIG: Required<VADConfig> = {
  speechThreshold: 20, // Adjust based on microphone sensitivity
  silenceDuration: 1500, // 1.5 seconds of silence ends recording
  minSpeechDuration: 500, // Minimum 0.5 seconds to be considered speech
  maxRecordingDuration: 10000, // Maximum 10 seconds per recording
  checkInterval: 100, // Check every 100ms
};

/**
 * Voice Activity Detector class
 * Continuously monitors microphone for speech and auto-records
 */
export class VoiceActivityDetector {
  private config: Required<VADConfig>;
  private callbacks: VADCallbacks;
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private checkIntervalId: number | null = null;
  private silenceTimeoutId: number | null = null;
  private maxDurationTimeoutId: number | null = null;
  private isSpeaking = false;
  private speechStartTime = 0;
  private audioChunks: BlobPart[] = [];
  private isActive = false;

  constructor(config: VADConfig = {}, callbacks: VADCallbacks = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.callbacks = callbacks;
  }

  /**
   * Start voice activity detection
   */
  async start(): Promise<void> {
    if (this.isActive) {
      console.log("[VAD] Already active");
      return;
    }

    try {
      console.log("[VAD] Starting voice activity detection...");
      
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("[VAD] Microphone access granted");

      // Setup audio analysis
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.8;
      source.connect(this.analyser);

      // Setup media recorder
      const mimeType = this.getSupportedMimeType();
      this.mediaRecorder = mimeType
        ? new MediaRecorder(this.stream, { mimeType })
        : new MediaRecorder(this.stream);

      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log("[VAD] Audio chunk recorded:", event.data.size, "bytes");
        }
      };

      this.isActive = true;

      // Start monitoring audio levels
      this.startMonitoring();
      console.log("[VAD] Voice activity detection started");
    } catch (error) {
      console.error("[VAD] Failed to start:", error);
      this.callbacks.onError?.(
        error instanceof Error ? error : new Error(String(error))
      );
      throw error;
    }
  }

  /**
   * Stop voice activity detection
   */
  stop(): void {
    console.log("[VAD] Stopping voice activity detection");
    
    this.stopMonitoring();
    
    if (this.isSpeaking) {
      this.endSpeech();
    }

    if (this.mediaRecorder?.state === "recording") {
      this.mediaRecorder.stop();
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.mediaRecorder = null;
    this.isActive = false;
    
    console.log("[VAD] Stopped");
  }

  /**
   * Check if currently detecting voice activity
   */
  isListening(): boolean {
    return this.isActive;
  }

  /**
   * Check if currently recording speech
   */
  isRecording(): boolean {
    return this.isSpeaking;
  }

  private getSupportedMimeType(): string | undefined {
    if (typeof MediaRecorder === "undefined") {
      return undefined;
    }

    const mimeTypes = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
    ];

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        return mimeType;
      }
    }

    return undefined;
  }

  private startMonitoring(): void {
    this.checkIntervalId = window.setInterval(() => {
      this.checkAudioLevel();
    }, this.config.checkInterval);
  }

  private stopMonitoring(): void {
    if (this.checkIntervalId !== null) {
      window.clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }

    if (this.silenceTimeoutId !== null) {
      window.clearTimeout(this.silenceTimeoutId);
      this.silenceTimeoutId = null;
    }

    if (this.maxDurationTimeoutId !== null) {
      window.clearTimeout(this.maxDurationTimeoutId);
      this.maxDurationTimeoutId = null;
    }
  }

  private checkAudioLevel(): void {
    if (!this.analyser || !this.isActive) {
      return;
    }

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    // Calculate average volume
    const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
    
    // Notify volume change
    this.callbacks.onVolumeChange?.(average);

    // Check if speaking
    const isSpeaking = average > this.config.speechThreshold;

    if (isSpeaking) {
      this.handleSpeechDetected();
    } else {
      this.handleSilenceDetected();
    }
  }

  private handleSpeechDetected(): void {
    // Clear silence timeout if it exists
    if (this.silenceTimeoutId !== null) {
      window.clearTimeout(this.silenceTimeoutId);
      this.silenceTimeoutId = null;
    }

    // Start recording if not already
    if (!this.isSpeaking) {
      this.startSpeech();
    }
  }

  private handleSilenceDetected(): void {
    // Only care about silence if we're currently recording speech
    if (!this.isSpeaking) {
      return;
    }

    // Start silence timer if not already started
    if (this.silenceTimeoutId === null) {
      this.silenceTimeoutId = window.setTimeout(() => {
        this.endSpeech();
      }, this.config.silenceDuration);
    }
  }

  private startSpeech(): void {
    console.log("[VAD] Speech detected - starting recording");
    
    this.isSpeaking = true;
    this.speechStartTime = Date.now();
    this.audioChunks = [];

    // Start recording
    if (this.mediaRecorder && this.mediaRecorder.state === "inactive") {
      this.mediaRecorder.start(100); // Capture in 100ms chunks
    }

    // Set maximum duration timeout
    this.maxDurationTimeoutId = window.setTimeout(() => {
      console.log("[VAD] Maximum recording duration reached");
      this.endSpeech();
    }, this.config.maxRecordingDuration);

    this.callbacks.onSpeechStart?.();
  }

  private endSpeech(): void {
    const speechDuration = Date.now() - this.speechStartTime;
    console.log("[VAD] Speech ended, duration:", speechDuration, "ms");

    // Clear timers
    if (this.silenceTimeoutId !== null) {
      window.clearTimeout(this.silenceTimeoutId);
      this.silenceTimeoutId = null;
    }

    if (this.maxDurationTimeoutId !== null) {
      window.clearTimeout(this.maxDurationTimeoutId);
      this.maxDurationTimeoutId = null;
    }

    // Stop recording
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.stop();

      // Wait for final data chunks
      setTimeout(() => {
        // Check if speech was long enough
        if (speechDuration < this.config.minSpeechDuration) {
          console.log("[VAD] Speech too short, ignoring");
          this.audioChunks = [];
          this.isSpeaking = false;
          return;
        }

        // Create audio blob
        const audioBlob = new Blob(this.audioChunks, {
          type: this.mediaRecorder?.mimeType || "audio/webm",
        });

        console.log("[VAD] Audio blob created:", audioBlob.size, "bytes");

        if (audioBlob.size > 0) {
          this.callbacks.onSpeechEnd?.(audioBlob);
        }

        this.audioChunks = [];
        this.isSpeaking = false;
      }, 100);
    } else {
      this.isSpeaking = false;
    }
  }
}
