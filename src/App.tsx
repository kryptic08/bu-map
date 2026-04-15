import { useEffect, useMemo, useRef, useState } from "react";
import { divIcon, type LatLngExpression } from "leaflet";
import { MapPin } from "lucide-react";
import QRCode from "qrcode";
import { renderToStaticMarkup } from "react-dom/server";
import { AiConversationModal } from "./components/AiConversationModal";
import { CampusMapView } from "./components/CampusMapView";
import welcomeRouteImage from "./assets/welcome-route.svg";
import { DestinationListModal } from "./components/DestinationListModal";
import { DestinationPreviewCard } from "./components/DestinationPreviewCard";
import { FloatingActionButtons } from "./components/FloatingActionButtons";
import { NextStopPrompt } from "./components/NextStopPrompt";
import { QrPreviewModal } from "./components/QrPreviewModal";
import { StatusToast } from "./components/StatusToast";
import { TopDirectionBanner } from "./components/TopDirectionBanner";
import { WelcomeModal } from "./components/WelcomeModal";
import { ScannedRouteWelcome } from "./components/ScannedRouteWelcome";
import { GUARD_HOUSE, PRESET_DESTINATIONS } from "./data/presetDestinations";
import { planBestRoutes } from "./services/routePlanner";
import {
  resolvePresetFromDestination,
  resolvePresetFromPrompt,
} from "./utils/destinationMatcher";
import {
  formatDistance,
  // formatDuration, // Unused after removing RouteAssistantPanel
  compactLabel,
} from "./utils/formatters";
import { calculateBearing } from "./utils/geo";
import {
  buildRoutePacket,
  decodePacket,
  encodePacket,
} from "./utils/routePacket";
import {
  captureAudioFromMicrophone,
  isFastAPIVoiceSupportedInBrowser,
  isBrowserSpeechRecognitionSupported,
  isHFTranscriptionConfigured,
} from "./utils/voiceRecognition";
import {
  isOpenAIConfigured,
  processVoiceCommandWithChatGPT,
  chatWithAI,
} from "./services/chatgpt";
import {
  isOpenAITranscriptionConfigured,
} from "./services/openaiTranscription";
import {
  transcribeRealtimeWithOpenAI,
  transcribeRealtimeWithFastAPI,
  transcribeRealtimeWithBrowserSpeech,
} from "./services/realtimeTranscription";
import { isEnglishText } from "./utils/languageDetection";
import type {
  Destination,
  EntryMode,
  FocusRequest,
  Point,
  PresetDestination,
  RouteInfo,
} from "./types/navigation";
import type { ConversationMessage } from "./types/conversation";

const MAP_CENTER: LatLngExpression = [GUARD_HOUSE.lat, GUARD_HOUSE.lon];

const PUBLIC_BASE_URL = (import.meta.env.VITE_PUBLIC_BASE_URL ?? "").trim();

function App() {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [_routeLoading, setRouteLoading] = useState(false); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [routeError, setRouteError] = useState<string | null>(null);

  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null);
  const [simulationIndex, setSimulationIndex] = useState<number | null>(null);
  const [simulationSpeed] = useState(1.25);
  const [isSimulationPaused, setIsSimulationPaused] = useState(false);
  const [showNextStopPrompt, setShowNextStopPrompt] = useState(false);
  const [hasArrivedAtDestination, setHasArrivedAtDestination] = useState(false);
  const [currentStartPoint, setCurrentStartPoint] =
    useState<Point>(GUARD_HOUSE);
  const [startLabel, setStartLabel] = useState("Guard House");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [gyroEnabled] = useState(false);
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [entryMode, setEntryMode] = useState<EntryMode | null>(null);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const [showDestinationDetails, setShowDestinationDetails] = useState(false);
  const [isPreviewCardCollapsed, setIsPreviewCardCollapsed] = useState(false);
  const [showDestinationListModal, setShowDestinationListModal] =
    useState(false);
  const [showQrPreview, setShowQrPreview] = useState(false);
  const [showScannedRouteWelcome, setShowScannedRouteWelcome] = useState(false);
  const [isScannedRoute, setIsScannedRoute] = useState(false);
  const voiceCaptureAbortRef = useRef<AbortController | null>(null);

  // AI Conversation state
  const [showAiConversation, setShowAiConversation] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<
    ConversationMessage[]
  >([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // const isShareLinkPublic = useMemo(() => {
  //   if (PUBLIC_BASE_URL) {
  //     return true;
  //   }

  //   const host = window.location.hostname.toLowerCase();
  //   return host !== "localhost" && host !== "127.0.0.1";
  // }, []);

  const startPoint = currentStartPoint;
  const activeEntryMode = entryMode ?? "quick";
  const voiceRecognitionSupported = useMemo(
    () =>
      isOpenAITranscriptionConfigured() ||
      (isHFTranscriptionConfigured() && isFastAPIVoiceSupportedInBrowser()) ||
      isBrowserSpeechRecognitionSupported(),
    [],
  );
  const selectedPresetDestination = useMemo(
    () => resolvePresetFromDestination(destination, PRESET_DESTINATIONS),
    [destination],
  );

  const simulationPoint = useMemo<Point | null>(() => {
    if (!route || simulationIndex === null) {
      return null;
    }

    const maxIndex = route.points.length - 1;
    const boundedIndex = Math.max(0, Math.min(simulationIndex, maxIndex));
    const baseIndex = Math.floor(boundedIndex);
    const nextIndex = Math.min(baseIndex + 1, maxIndex);
    const blend = boundedIndex - baseIndex;
    const from = route.points[baseIndex];
    const to = route.points[nextIndex];

    if (!from || !to) {
      return null;
    }

    return {
      lat: from[0] + (to[0] - from[0]) * blend,
      lon: from[1] + (to[1] - from[1]) * blend,
    };
  }, [route, simulationIndex]);

  const isSimulationRunning = simulationIndex !== null && !isSimulationPaused;
  const headingDegrees = useMemo(() => {
    if (!route || simulationIndex === null) {
      return 0;
    }

    const maxIndex = route.points.length - 1;
    const baseIndex = Math.floor(
      Math.max(0, Math.min(simulationIndex, maxIndex)),
    );
    const current = route.points[baseIndex];
    const next = route.points[Math.min(baseIndex + 1, maxIndex)];
    if (!current || !next) {
      return 0;
    }

    return calculateBearing(
      { lat: current[0], lon: current[1] },
      { lat: next[0], lon: next[1] },
    );
  }, [route, simulationIndex]);

  const effectiveHeading =
    gyroEnabled && deviceHeading !== null ? deviceHeading : headingDegrees;

  const currentStepIndex =
    route && simulationIndex !== null && route.steps.length > 0
      ? Math.min(
          Math.floor(
            (simulationIndex / Math.max(route.points.length - 1, 1)) *
              route.steps.length,
          ),
          route.steps.length - 1,
        )
      : -1;

  const currentStep =
    currentStepIndex >= 0 && route ? route.steps[currentStepIndex] : null;

  const showTopDirectionBanner = isSimulationRunning && currentStep !== null;

  const buildingPinIcon = useMemo(
    () =>
      divIcon({
        html: renderToStaticMarkup(
          <span className="building-pin-inner" aria-hidden="true">
            <MapPin size={16} strokeWidth={2.6} />
          </span>,
        ),
        className: "building-pin-icon",
        iconSize: [24, 24],
        iconAnchor: [12, 20],
        tooltipAnchor: [0, -16],
      }),
    [],
  );

  const applyDestination = (nextDestination: Destination) => {
    setDestination(nextDestination);
    setShowDestinationDetails(true);
    setIsPreviewCardCollapsed(false);
    setLocationError(null);
    setFocusRequest({ point: nextDestination, zoom: 17 });
    setSimulationIndex(null);
    setIsSimulationPaused(false);
    setShowNextStopPrompt(false);
    setHasArrivedAtDestination(false);
  };

  const stopVoiceRecognition = () => {
    if (voiceCaptureAbortRef.current) {
      voiceCaptureAbortRef.current.abort();
      voiceCaptureAbortRef.current = null;
    }
    setIsVoiceListening(false);
    setVoiceFeedback(null);
  };

  // @ts-ignore - Keeping runAiVoiceCommand for future implementation
  const runAiVoiceCommand = async (rawCommand: string) => {
    console.log("[Voice Command] Processing voice input:", rawCommand);

    const command = rawCommand.trim();
    if (!command) {
      console.log("[Voice Command] Empty command after trim");
      setLocationError("Voice command did not capture a destination.");
      return;
    }

    // Use ChatGPT for AI-powered voice command processing if configured
    if (isOpenAIConfigured()) {
      console.log("[Voice Command] Processing with ChatGPT AI assistant...");
      setVoiceFeedback("AI is processing your request...");

      try {
        const aiResponse = await processVoiceCommandWithChatGPT(
          command,
          PRESET_DESTINATIONS,
        );

        console.log("[Voice Command] ChatGPT response:", aiResponse);

        if (aiResponse.destination) {
          // ChatGPT identified a destination - find and navigate to it
          const matchedPreset = PRESET_DESTINATIONS.find(
            (dest) => dest.label === aiResponse.destination,
          );

          if (matchedPreset) {
            console.log(
              "[Voice Command] SUCCESS - AI matched destination:",
              matchedPreset.label,
            );
            setVoiceFeedback(aiResponse.message);
            setTimeout(() => {
              applyDestination(matchedPreset);
              setLocationError(null);
              setVoiceFeedback(null);
            }, 1500);
            return;
          }
        }

        // ChatGPT couldn't find a clear destination - show its message
        console.log(
          "[Voice Command] AI needs clarification:",
          aiResponse.message,
        );
        setLocationError(aiResponse.message);
        setVoiceFeedback(null);
        return;
      } catch (error) {
        console.error("[Voice Command] ChatGPT processing failed:", error);
        setVoiceFeedback(null);
        // Fall back to basic matching
        console.log(
          "[Voice Command] Falling back to basic destination matching",
        );
      }
    }

    // Fallback: Basic keyword matching
    console.log(
      "[Voice Command] Attempting basic match against preset destinations",
    );
    const matchedPreset = resolvePresetFromPrompt(command, PRESET_DESTINATIONS);

    if (matchedPreset) {
      console.log(
        "[Voice Command] SUCCESS - Destination matched:",
        matchedPreset.label,
      );
      applyDestination(matchedPreset);
      setLocationError(null);
      return;
    }

    console.log("[Voice Command] FAILED - No matching destination found");
    setLocationError(
      "Voice command recognized, but no preset destination was matched. Try saying the building name clearly.",
    );
  };

  const onChooseEntryMode = (mode: EntryMode) => {
    setEntryMode(mode);
    setShowWelcomeModal(false);
    setLocationError(null);
    setShowDestinationListModal(mode === "quick");

    if (mode !== "ai") {
      stopVoiceRecognition();
    }

    if (mode === "quick") {
      setShowDestinationDetails(false);
    }

    // Open AI conversation modal when AI voice command is selected
    if (mode === "ai") {
      setShowAiConversation(true);
      // Voice will auto-start via the modal's useEffect
    }
  };

  const onToggleVoiceCommand = () => {
    // Open AI conversation modal when voice button is clicked
    setShowAiConversation(true);
    setLocationError(null);
  };

  // Send a text message in the AI conversation
  const onSendConversationMessage = async (messageText: string) => {
    // Validate message - trim and check if not empty
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage) {
      console.log("[AI Conversation] Skipping empty message");
      return;
    }

    const userMessage: ConversationMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedMessage,
      timestamp: Date.now(),
    };

    setConversationMessages((prev) => [...prev, userMessage]);
    setIsAiProcessing(true);

    try {
      const response = await chatWithAI(trimmedMessage, conversationMessages, {
        currentLocation: startLabel,
        destination: destination?.label,
        availableDestinations: PRESET_DESTINATIONS,
        isNavigating: route !== null,
      });

      const assistantMessage: ConversationMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.message,
        timestamp: Date.now(),
      };

      setConversationMessages((prev) => [...prev, assistantMessage]);

      // If AI wants to navigate somewhere, do it immediately
      if (response.action?.type === "navigate") {
        const matchedDest = PRESET_DESTINATIONS.find(
          (dest) => dest.label === response.action?.destination,
        );
        if (matchedDest) {
          // Apply destination and show route immediately
          applyDestination(matchedDest);
          // Keep AI conversation visible - don't close it
        }
      }
    } catch (error) {
      console.error("[AI Conversation] Error:", error);
      const errorMessage: ConversationMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          "Sorry, I encountered an error. Please make sure your OpenAI API key is configured correctly in .env.local",
        timestamp: Date.now(),
      };
      setConversationMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Toggle voice input in conversation mode
  const onToggleConversationVoice = async () => {
    if (isVoiceListening) {
      console.log("[Conversation Voice] Stopping voice recognition");
      stopVoiceRecognition();
      return;
    }

    setIsVoiceListening(true);
    console.log("[Conversation Voice] Starting real-time voice recognition with English-only filtering...");

    const controller = new AbortController();
    voiceCaptureAbortRef.current = controller;

    try {
      let transcript = "";

      // Use OpenAI Whisper with real-time transcription if configured
      if (isOpenAITranscriptionConfigured()) {
        console.log("[Conversation Voice] Capturing audio from microphone...");
        const audioBlob = await captureAudioFromMicrophone({
          maxDurationMs: 7000,
          timesliceMs: 150,
          signal: controller.signal,
        });

        console.log("[Conversation Voice] Transcribing with OpenAI GPT-4o (real-time, English-only)...");
        try {
          // Use real-time transcription with English filtering
          for await (const update of transcribeRealtimeWithOpenAI(audioBlob, {
            language: "en",
            minConfidence: 0.5,
            signal: controller.signal,
          })) {
            console.log("[Conversation Voice] Real-time update:", {
              interim: update.interim.substring(0, 50),
              final: update.final.substring(0, 50),
              isEnglish: update.isEnglish,
              confidence: update.confidence.toFixed(2),
            });
            
            // Update UI with interim results in real-time
            if (update.interim) {
              setVoiceFeedback(`Listening: ${update.interim}`);
            }
            
            // Collect final transcription
            if (update.final) {
              transcript = update.final;
              console.log("[Conversation Voice] Final transcript:", transcript);
            }
          }
        } catch (openaiError) {
          const errorMsg = openaiError instanceof Error ? openaiError.message : String(openaiError);
          console.warn(
            "[Conversation Voice] OpenAI real-time transcription failed:",
            errorMsg,
          );
          
          // Check if it's a language filter rejection
          if (errorMsg.includes("English") || errorMsg.includes("confidence")) {
            setLocationError("Only English language input is accepted. Please try again in English.");
            setIsVoiceListening(false);
            setVoiceFeedback(null);
            return;
          }
          
          // Fall back to browser speech recognition
          if (isBrowserSpeechRecognitionSupported()) {
            console.log("[Conversation Voice] Falling back to browser speech recognition...");
            for await (const update of transcribeRealtimeWithBrowserSpeech({
              signal: controller.signal,
            })) {
              if (update.interim) {
                setVoiceFeedback(`Listening: ${update.interim}`);
              }
              if (update.final) {
                transcript = update.final;
              }
            }
          } else {
            throw openaiError;
          }
        }
      } else if (
        isHFTranscriptionConfigured() &&
        isFastAPIVoiceSupportedInBrowser()
      ) {
        // Fallback to FastAPI if OpenAI not configured
        console.log("[Conversation Voice] Capturing audio from microphone...");
        const audioBlob = await captureAudioFromMicrophone({
          maxDurationMs: 7000,
          timesliceMs: 150,
          signal: controller.signal,
        });

        console.log("[Conversation Voice] Transcribing with FastAPI (real-time, English-only)...");
        try {
          const fastApiUrl = (import.meta.env.VITE_FASTAPI_TRANSCRIBE_URL ?? 
            "https://veccode-wish.hf.space/transcribe").trim();
          
          for await (const update of transcribeRealtimeWithFastAPI(audioBlob, fastApiUrl, {
            minConfidence: 0.5,
            signal: controller.signal,
          })) {
            console.log("[Conversation Voice] FastAPI real-time update:", {
              final: update.final.substring(0, 50),
              isEnglish: update.isEnglish,
              confidence: update.confidence.toFixed(2),
            });
            
            if (update.final) {
              transcript = update.final;
            }
          }
        } catch (fastApiError) {
          const errorMsg = fastApiError instanceof Error ? fastApiError.message : String(fastApiError);
          console.warn(
            "[Conversation Voice] FastAPI real-time transcription failed:",
            errorMsg,
          );
          
          // Check if it's a language filter rejection
          if (errorMsg.includes("English") || errorMsg.includes("confidence")) {
            setLocationError("Only English language input is accepted. Please try again in English.");
            setIsVoiceListening(false);
            setVoiceFeedback(null);
            return;
          }
          
          // Fall back to browser speech recognition
          if (isBrowserSpeechRecognitionSupported()) {
            console.log("[Conversation Voice] Falling back to browser speech recognition...");
            for await (const update of transcribeRealtimeWithBrowserSpeech({
              signal: controller.signal,
            })) {
              if (update.interim) {
                setVoiceFeedback(`Listening: ${update.interim}`);
              }
              if (update.final) {
                transcript = update.final;
              }
            }
          } else {
            throw fastApiError;
          }
        }
      } else {
        // Final fallback to browser speech recognition with English filtering
        console.log("[Conversation Voice] Using browser speech recognition (real-time, English-only)...");
        for await (const update of transcribeRealtimeWithBrowserSpeech({
          signal: controller.signal,
        })) {
          // Update UI with interim results
          if (update.interim) {
            setVoiceFeedback(`Listening: ${update.interim}`);
          }
          
          // Collect final transcription
          if (update.final) {
            transcript = update.final;
            console.log("[Conversation Voice] Browser speech final result:", transcript);
          }
        }
      }

      // Validate transcript and check language
      const trimmedTranscript = transcript.trim();
      if (trimmedTranscript && trimmedTranscript.length > 0) {
        // Double-check that final transcript is English
        if (isEnglishText(trimmedTranscript)) {
          console.log("[Conversation Voice] Valid English transcript:", trimmedTranscript);
          await onSendConversationMessage(trimmedTranscript);
        } else {
          console.warn("[Conversation Voice] Non-English transcript detected:", trimmedTranscript);
          setLocationError("Only English language input is accepted. Please try again in English.");
        }
      } else {
        console.log("[Conversation Voice] Empty or invalid transcript, skipping");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      
      // Don't show error messages for common microphone issues
      const isMicPermissionError = errorMessage.includes("Requested device not found") ||
                                   errorMessage.includes("Permission denied") ||
                                   errorMessage.includes("NotAllowedError") ||
                                   errorMessage.includes("NotFoundError") ||
                                   errorMessage.includes("AbortError") ||
                                   errorMessage.includes("cancelled") ||
                                   errorMessage.toLowerCase().includes("microphone") ||
                                   errorMessage.toLowerCase().includes("device") ||
                                   errorMessage.toLowerCase().includes("media");

      // Only log unexpected errors
      if (!isMicPermissionError) {
        console.error("[Conversation Voice] Error:", error);
      } else {
        console.log("[Conversation Voice] Microphone not available (expected when mic is off)");
      }

      // Only show error message for unexpected errors
      if (!isMicPermissionError) {
        const errorMsg: ConversationMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `Voice input error: ${errorMessage}`,
          timestamp: Date.now(),
        };
        setConversationMessages((prev) => [...prev, errorMsg]);
      }
    } finally {
      voiceCaptureAbortRef.current = null;
      setIsVoiceListening(false);
    }
  };

  // Start voice recognition (called automatically by modal)
  const onStartConversationVoice = () => {
    // Only start if not already listening
    if (!isVoiceListening && !isAiProcessing) {
      onToggleConversationVoice();
    }
  };

  const onCloseAiConversation = () => {
    setShowAiConversation(false);
    stopVoiceRecognition();
  };

  useEffect(() => {
    if (!gyroEnabled) {
      setDeviceHeading(null);
      return;
    }

    const onOrientation = (event: DeviceOrientationEvent) => {
      const webkitHeading = (
        event as DeviceOrientationEvent & { webkitCompassHeading?: number }
      ).webkitCompassHeading;

      if (typeof webkitHeading === "number") {
        setDeviceHeading(webkitHeading);
        return;
      }

      if (typeof event.alpha === "number") {
        setDeviceHeading((360 - event.alpha + 360) % 360);
      }
    };

    window.addEventListener("deviceorientation", onOrientation, true);
    return () => {
      window.removeEventListener("deviceorientation", onOrientation, true);
    };
  }, [gyroEnabled]);

  useEffect(() => {
    const packetValue = new URLSearchParams(window.location.search).get(
      "packet",
    );
    if (!packetValue) {
      return;
    }

    try {
      const packet = decodePacket(packetValue);
      if (packet.v !== 1) {
        throw new Error("Invalid packet content");
      }

      const startFromPacket = { lat: packet.s[0], lon: packet.s[1] };
      const destinationFromPacket: Destination = {
        lat: packet.d[0],
        lon: packet.d[1],
        label: packet.dl,
      };

      setCurrentStartPoint(startFromPacket);
      setStartLabel(packet.sl || "Shared Start");
      setDestination(destinationFromPacket);
      setRoute(null);
      setRouteError(null);
      setIsScannedRoute(true);
      setShowScannedRouteWelcome(true);
      setShowWelcomeModal(false);
      setEntryMode(null);
    } catch {
      setRouteError("Shared route packet is invalid or unsupported.");
    }
  }, []);

  useEffect(() => {
    return () => {
      if (voiceCaptureAbortRef.current) {
        voiceCaptureAbortRef.current.abort();
        voiceCaptureAbortRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!destination) {
      setRoute(null);
      setRouteError(null);
      setRouteLoading(false);
      setQrCodeDataUrl(null);
      setShareLink(null);
      setShowDestinationDetails(false);
      setSimulationIndex(null);
      setIsSimulationPaused(false);
      setShowNextStopPrompt(false);
      setHasArrivedAtDestination(false);
      return;
    }

    const controller = new AbortController();
    setRouteLoading(true);
    setRouteError(null);

    const fetchRoute = async () => {
      try {
        const bestRoute = await planBestRoutes(
          startPoint,
          destination,
          controller.signal,
        );

        setRoute(bestRoute);

        setSimulationIndex(null);
        setIsSimulationPaused(false);
        setShowNextStopPrompt(false);
        setHasArrivedAtDestination(false);
      } catch {
        if (controller.signal.aborted) {
          return;
        }
        setRoute(null);
        setRouteError("Could not build a route. Try a different destination.");
      } finally {
        if (!controller.signal.aborted) {
          setRouteLoading(false);
        }
      }
    };

    void fetchRoute();

    return () => {
      controller.abort();
    };
  }, [destination, startPoint.lat, startPoint.lon]);

  useEffect(() => {
    if (!route || !destination) {
      setQrCodeDataUrl(null);
      setShareLink(null);
      return;
    }

    let isActive = true;

    const buildQr = async () => {
      const packet = buildRoutePacket({
        start: startPoint,
        startLabel,
        destination,
      });
      const encoded = encodePacket(packet);
      const shareUrl = PUBLIC_BASE_URL
        ? new URL(PUBLIC_BASE_URL)
        : new URL(window.location.href);
      shareUrl.pathname = window.location.pathname;
      shareUrl.search = "";
      shareUrl.searchParams.set("packet", encoded);

      try {
        const dataUrl = await QRCode.toDataURL(shareUrl.toString(), {
          width: 640,
          margin: 1,
          errorCorrectionLevel: "M",
        });

        if (!isActive) {
          return;
        }

        setQrCodeDataUrl(dataUrl);
        setShareLink(shareUrl.toString());
      } catch {
        if (!isActive) {
          return;
        }

        setQrCodeDataUrl(null);
        setShareLink(null);
      }
    };

    void buildQr();

    return () => {
      isActive = false;
    };
  }, [route, destination, startPoint, startLabel]);

  useEffect(() => {
    if (!route || simulationIndex === null || isSimulationPaused) {
      return;
    }

    const lastIndex = route.points.length - 1;
    if (simulationIndex >= lastIndex - 0.0001) {
      setIsSimulationPaused(true);
      setHasArrivedAtDestination(true);
      setShowNextStopPrompt(true);
      return;
    }

    const tickMs = 40;
    const pointsPerSecond = 2.1 * simulationSpeed;
    const step = (pointsPerSecond * tickMs) / 1000;

    const timer = window.setTimeout(() => {
      setSimulationIndex((prev) => {
        if (prev === null) {
          return null;
        }
        return Math.min(prev + step, lastIndex);
      });
    }, tickMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [route, simulationIndex, isSimulationPaused, simulationSpeed]);

  // Auto-reset to welcome page after 3 minutes when AI conversation closes with route
  useEffect(() => {
    if (!showAiConversation && route && destination) {
      const resetTimer = window.setTimeout(() => {
        // Reset to welcome page
        setDestination(null);
        setRoute(null);
        setShowWelcomeModal(true);
        setEntryMode(null);
        setConversationMessages([]);
      }, 180000); // 3 minutes

      return () => {
        window.clearTimeout(resetTimer);
      };
    }
  }, [showAiConversation, route, destination]);

  const visibleStatus = useMemo(() => {
    if (voiceFeedback) {
      return voiceFeedback;
    }
    if (locationError) {
      return locationError;
    }
    if (routeError) {
      return routeError;
    }
    return null;
  }, [voiceFeedback, locationError, routeError]);

  const onSelectPresetDestination = (place: PresetDestination) => {
    applyDestination(place);
    setShowDestinationListModal(false);
  };

  const onToggleDestinationDetails = () => {
    setShowDestinationDetails((previous) => !previous);
  };

  const onOpenDestinationListModal = () => {
    setShowDestinationListModal(true);
  };

  const onCloseDestinationListModal = () => {
    setShowDestinationListModal(false);
  };

  const onClearRoute = () => {
    setDestination(null);
    setRoute(null);
    setRouteError(null);
    setShowDestinationListModal(false);
    setShowDestinationDetails(false);
    setSimulationIndex(null);
    setIsSimulationPaused(false);
    setShowNextStopPrompt(false);
    setHasArrivedAtDestination(false);
    setIsScannedRoute(false);
    setShowScannedRouteWelcome(false);
  };

  const onChooseNextDestination = () => {
    if (destination) {
      setCurrentStartPoint({ lat: destination.lat, lon: destination.lon });
      setStartLabel(compactLabel(destination.label));
    }

    setShowNextStopPrompt(false);
    onClearRoute();

    if (activeEntryMode === "quick") {
      setShowDestinationListModal(true);
    }
  };

  const onStartScannedRoute = () => {
    setShowScannedRouteWelcome(false);
    setEntryMode("quick");
    setShowDestinationDetails(true);
    setIsPreviewCardCollapsed(false);
    // Let RouteBoundsController handle the map fitting
  };

  const onCancelScannedRoute = () => {
    setShowScannedRouteWelcome(false);
    setIsScannedRoute(false);
    setDestination(null);
    setRoute(null);
    setShowWelcomeModal(true);
  };

  const onCopyShareLink = async () => {
    if (!shareLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareLink);
      setLocationError(
        "Share link copied. Open it on another device to follow this route.",
      );
    } catch {
      setLocationError("Could not copy share link on this browser.");
    }
  };

  return (
    <main className="relative h-dvh w-screen overflow-hidden bg-slate-100 font-[Manrope] text-slate-900">
      <CampusMapView
        mapCenter={MAP_CENTER}
        focusRequest={focusRequest}
        route={route}
        simulationPoint={simulationPoint}
        isSimulationRunning={isSimulationRunning}
        effectiveHeading={effectiveHeading}
        gyroEnabled={gyroEnabled}
        startPoint={startPoint}
        startLabel={startLabel}
        activeEntryMode={activeEntryMode}
        destinations={PRESET_DESTINATIONS}
        destination={destination}
        buildingPinIcon={buildingPinIcon}
        onSelectPresetDestination={onSelectPresetDestination}
        compactLabel={compactLabel}
      />

      <WelcomeModal
        show={showWelcomeModal}
        onChooseEntryMode={onChooseEntryMode}
        welcomeImage={welcomeRouteImage}
      />

      <ScannedRouteWelcome
        show={showScannedRouteWelcome}
        startLabel={startLabel}
        destinationLabel={destination?.label || "Unknown"}
        onStart={onStartScannedRoute}
        onCancel={onCancelScannedRoute}
      />

      <AiConversationModal
        show={showAiConversation}
        messages={conversationMessages}
        isListening={isVoiceListening}
        isProcessing={isAiProcessing}
        voiceSupported={voiceRecognitionSupported}
        onClose={onCloseAiConversation}
        onStartVoice={onStartConversationVoice}
        onOpenQrCode={() => setShowQrPreview(true)}
      />

      <QrPreviewModal
        show={showQrPreview}
        qrCodeDataUrl={qrCodeDataUrl}
        onClose={() => setShowQrPreview(false)}
        onCopyShareLink={onCopyShareLink}
      />

      <TopDirectionBanner
        show={showTopDirectionBanner && Boolean(currentStep)}
        instruction={currentStep?.instruction ?? ""}
        distanceText={currentStep ? formatDistance(currentStep.distance) : ""}
        heading={effectiveHeading}
      />

      <DestinationListModal
        show={showDestinationListModal}
        destination={destination}
        destinations={PRESET_DESTINATIONS}
        onSelectDestination={onSelectPresetDestination}
        onClose={onCloseDestinationListModal}
      />

      <DestinationPreviewCard
        destination={destination}
        selectedPresetDestination={selectedPresetDestination}
        showTopDirectionBanner={showTopDirectionBanner}
        hasArrivedAtDestination={hasArrivedAtDestination}
        showDestinationDetails={showDestinationDetails}
        onToggleDestinationDetails={onToggleDestinationDetails}
        isCollapsed={isPreviewCardCollapsed}
        onToggleCollapse={() =>
          setIsPreviewCardCollapsed(!isPreviewCardCollapsed)
        }
        compactLabel={compactLabel}
        fallbackImage={welcomeRouteImage}
        qrCodeDataUrl={qrCodeDataUrl}
        onCopyShareLink={onCopyShareLink}
        isScannedRoute={isScannedRoute}
      />

      {/* Walk Debugger Un comment this if want to see the fake walking simulation
      {route ? (
        <div className="absolute top-20 md:top-4 max-md:landscape:top-4 left-1/2 z-[1000] -translate-x-1/2 rounded-full border border-slate-300 bg-white/90 p-1.5 shadow-lg backdrop-blur-sm pointer-events-auto">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                if (simulationIndex === null) {
                  setSimulationIndex(0);
                  setIsSimulationPaused(false);
                } else {
                  setIsSimulationPaused(!isSimulationPaused);
                }
              }}
              className="rounded-full bg-slate-800 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700"
            >
              {isSimulationRunning ? "Pause Walk" : "Walk Debugger"}
            </button>
            {simulationIndex !== null ? (
              <button
                type="button"
                onClick={() => setSimulationIndex(null)}
                className="rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-500"
              >
                Stop
              </button>
            ) : null}
          </div>
        </div>
      ) : null} */}

      <FloatingActionButtons
        activeEntryMode={activeEntryMode}
        isVoiceListening={isVoiceListening}
        voiceRecognitionSupported={voiceRecognitionSupported}
        startPoint={startPoint}
        hasDestination={!!destination}
        isPreviewCardCollapsed={isPreviewCardCollapsed}
        hasQrCode={!!qrCodeDataUrl}
        onOpenDestinationListModal={onOpenDestinationListModal}
        onToggleVoiceCommand={onToggleVoiceCommand}
        onOpenQrCode={() => setShowQrPreview(true)}
        onChangeMode={() => {
          stopVoiceRecognition();
          setShowDestinationListModal(false);
          setShowWelcomeModal(true);
        }}
        onRecenter={(point) => setFocusRequest({ point, zoom: 18 })}
        onClearRoute={onClearRoute}
      />

      <StatusToast message={visibleStatus} />

      <NextStopPrompt
        show={showNextStopPrompt}
        destinationLabel={
          destination ? compactLabel(destination.label) : "your destination"
        }
        onStay={() => setShowNextStopPrompt(false)}
        onPickAnother={onChooseNextDestination}
      />
    </main>
  );
}

export default App;
