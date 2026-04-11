import { useEffect, useMemo, useRef, useState } from "react";
import { divIcon, type LatLngExpression } from "leaflet";
import { MapPin } from "lucide-react";
import QRCode from "qrcode";
import { renderToStaticMarkup } from "react-dom/server";
import { AiConversationModal } from "./components/AiConversationModal";
import { CampusMapView } from "./components/CampusMapView";
import welcomeRouteImage from "./assets/welcome-route.svg";
import { DestinationListModal } from "./components/DestinationListModal";
import { MobileScannedRouteModal } from "./components/MobileScannedRouteModal";
import { DestinationPreviewCard } from "./components/DestinationPreviewCard";
import { FloatingActionButtons } from "./components/FloatingActionButtons";
import { NextStopPrompt } from "./components/NextStopPrompt";
import { RouteAssistantPanel } from "./components/RouteAssistantPanel";
import { StatusToast } from "./components/StatusToast";
import { TopDirectionBanner } from "./components/TopDirectionBanner";
import { WelcomeModal } from "./components/WelcomeModal";
import { GUARD_HOUSE, PRESET_DESTINATIONS } from "./data/presetDestinations";
import { planBestRoutes } from "./services/routePlanner";
import {
  resolvePresetFromDestination,
} from "./utils/destinationMatcher";
import {
  formatDistance,
  formatDuration,
  compactLabel,
} from "./utils/formatters";
import { calculateBearing } from "./utils/geo";
import {
  buildRoutePacket,
  decodePacket,
  encodePacket,
} from "./utils/routePacket";
import { isMobileDevice } from "./utils/deviceDetection";
import {
  transcribeAudioWithOpenAI,
  transcribeAudioWithFastAPI,
  isFastAPIVoiceSupportedInBrowser,
  isBrowserSpeechRecognitionSupported,
  isOpenAITranscriptionConfigured,
  isHFTranscriptionConfigured,
} from "./utils/voiceRecognition";
import {
  VoiceActivityDetector,
  type VADConfig,
  type VADCallbacks,
} from "./utils/voiceActivityDetection";
import {
  chatWithAI,
} from "./services/chatgpt";
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
  const [routeLoading, setRouteLoading] = useState(false);
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
  const [showDestinationListModal, setShowDestinationListModal] =
    useState(false);
  const [showMobileScannedRoute, setShowMobileScannedRoute] = useState(false);
  const voiceCaptureAbortRef = useRef<AbortController | null>(null);
  const vadInstanceRef = useRef<VoiceActivityDetector | null>(null);

  // AI Conversation state
  const [showAiConversation, setShowAiConversation] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<
    ConversationMessage[]
  >([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);

  const isShareLinkPublic = useMemo(() => {
    if (PUBLIC_BASE_URL) {
      return true;
    }

    const host = window.location.hostname.toLowerCase();
    return host !== "localhost" && host !== "127.0.0.1";
  }, []);

  const startPoint = currentStartPoint;
  const activeEntryMode = entryMode ?? "quick";
  const voiceRecognitionSupported = useMemo(
    () =>
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

  const onStartMobileNavigation = () => {
    // Close mobile welcome screen and show the map with route
    setShowMobileScannedRoute(false);
    console.log("[Mobile QR] Starting navigation, showing map");
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
  };

  const onOpenAiConversationFromWelcome = () => {
    // Open AI conversation modal from welcome screen
    setEntryMode("ai");
    setShowWelcomeModal(false);
    setShowAiConversation(true);
    setLocationError(null);
  };

  const onToggleVoiceCommand = () => {
    // Open AI conversation modal when voice button is clicked
    setShowAiConversation(true);
    setLocationError(null);
  };

  // Send a text message in the AI conversation
  const onSendConversationMessage = async (messageText: string) => {
    const userMessage: ConversationMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: Date.now(),
    };

    setConversationMessages((prev) => [...prev, userMessage]);
    setIsAiProcessing(true);

    try {
      const response = await chatWithAI(messageText, conversationMessages, {
        currentLocation: startLabel,
        destination: destination?.label,
        availableDestinations: PRESET_DESTINATIONS,
        isNavigating: route !== null,
        routeInfo: route
          ? {
              distance: route.distance,
              duration: route.duration,
              profile: route.profile,
              steps: route.steps,
            }
          : undefined,
      });

      const assistantMessage: ConversationMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.message,
        timestamp: Date.now(),
      };

      setConversationMessages((prev) => [...prev, assistantMessage]);

      // If AI wants to navigate somewhere, do it
      if (response.action?.type === "navigate") {
        const matchedDest = PRESET_DESTINATIONS.find(
          (dest) => dest.label === response.action?.destination,
        );
        if (matchedDest) {
          setTimeout(() => {
            applyDestination(matchedDest);
            setShowAiConversation(false);
          }, 1500);
        }
      }
    } catch (error) {
      console.error("[AI Conversation] Error:", error);
      
      // Log more details about the error
      if (error instanceof Error) {
        console.error("[AI Conversation] Error message:", error.message);
        console.error("[AI Conversation] Error stack:", error.stack);
      }
      
      let errorText = "Sorry, I encountered an error.";
      
      if (error instanceof Error) {
        if (error.message.includes("API key not configured")) {
          errorText = "OpenAI API key is not configured. Please check your .env.local file.";
        } else if (error.message.includes("401") || error.message.includes("Unauthorized")) {
          errorText = "Invalid OpenAI API key. Please check your API key in .env.local";
        } else if (error.message.includes("429") || error.message.includes("rate limit")) {
          errorText = "OpenAI rate limit exceeded. Please wait a moment and try again.";
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          errorText = "Network error. Please check your internet connection.";
        } else {
          errorText = `Error: ${error.message}`;
        }
      }
      
      const errorMessage: ConversationMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: errorText,
        timestamp: Date.now(),
      };
      setConversationMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Handle audio transcription from VAD
  const handleVADTranscription = async (audioBlob: Blob) => {
    console.log("[VAD] Speech ended, transcribing audio blob:", audioBlob.size, "bytes");
    
    try {
      let transcript = "";
      
      // Priority 1: OpenAI Transcription (best quality, same API as ChatGPT)
      if (isOpenAITranscriptionConfigured()) {
        console.log("[VAD] Using OpenAI transcription...");
        try {
          transcript = await transcribeAudioWithOpenAI(audioBlob);
          console.log("[VAD] OpenAI transcription received:", transcript);
        } catch (openAiError) {
          console.warn("[VAD] OpenAI failed:", openAiError);
          
          // Fallback to HuggingFace FastAPI
          if (isHFTranscriptionConfigured()) {
            console.log("[VAD] Falling back to HuggingFace FastAPI...");
            try {
              transcript = await transcribeAudioWithFastAPI(audioBlob);
            } catch (fastApiError) {
              console.error("[VAD] All transcription methods failed");
              throw new Error("Failed to transcribe audio. Please try again.");
            }
          } else {
            throw openAiError;
          }
        }
      }
      // Priority 2: HuggingFace FastAPI
      else if (isHFTranscriptionConfigured()) {
        console.log("[VAD] Using HuggingFace FastAPI...");
        transcript = await transcribeAudioWithFastAPI(audioBlob);
      } else {
        throw new Error("No transcription service configured. Please set VITE_OPENAI_API_KEY.");
      }

      if (transcript) {
        console.log("[VAD] Final transcript:", transcript);
        
        // Validate transcript - ignore very short or unclear audio
        const cleanTranscript = transcript.trim();
        const wordCount = cleanTranscript.split(/\s+/).filter(word => word.length > 0).length;
        
        // Ignore if too short (likely background noise) - require at least 2 words
        if (cleanTranscript.length < 4 || wordCount < 2) {
          console.log("[VAD] Transcript too short, ignoring:", cleanTranscript);
          return;
        }
        
        // Ignore common filler words or unclear audio patterns
        const fillerPatterns = /^(uh|um|hmm|ah|oh|er|huh|mhm|yeah|yep|nope|okay|ok)\.?$/i;
        if (fillerPatterns.test(cleanTranscript)) {
          console.log("[VAD] Filler word detected, ignoring:", cleanTranscript);
          return;
        }
        
        // Ignore transcripts that are just noise patterns (repeated characters, etc.)
        const noisePatterns = /^[^\w\s]+$|^(.)\1{4,}$/i;
        if (noisePatterns.test(cleanTranscript)) {
          console.log("[VAD] Noise pattern detected, ignoring:", cleanTranscript);
          return;
        }
        
        // Ignore transcripts with no meaningful letters (must have at least 3 letters)
        const letterCount = (cleanTranscript.match(/[a-z]/gi) || []).length;
        if (letterCount < 3) {
          console.log("[VAD] Too few letters, ignoring:", cleanTranscript);
          return;
        }
        
        // Ignore transcription prompt text (returned when no clear speech detected)
        if (cleanTranscript.includes("Navigate to campus location") || 
            cleanTranscript.includes("Buildings:")) {
          console.log("[VAD] Transcription prompt detected (no speech), ignoring:", cleanTranscript);
          return;
        }
        
        // Send valid command to AI
        await onSendConversationMessage(cleanTranscript);
      } else {
        console.warn("[VAD] No transcript received");
        const warningMsg: ConversationMessage = {
          id: `warning-${Date.now()}`,
          role: "assistant",
          content: "🎤 No speech detected. Please speak more clearly and ensure your microphone is working.",
          timestamp: Date.now(),
        };
        setConversationMessages((prev) => [...prev, warningMsg]);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[VAD] Transcription error:", error);

      let userFriendlyMessage = errorMessage;
      
      if (errorMessage.includes("Invalid OpenAI API key")) {
        userFriendlyMessage = "⚠️ OpenAI API key is invalid. Please check your .env.local configuration.";
      } else if (errorMessage.includes("rate limit")) {
        userFriendlyMessage = "⏱️ Too many requests. Please wait a moment and try again.";
      } else if (errorMessage.includes("No transcription service")) {
        userFriendlyMessage = "⚠️ Voice transcription not configured. Please set VITE_OPENAI_API_KEY.";
      }

      const errorMsg: ConversationMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: userFriendlyMessage,
        timestamp: Date.now(),
      };
      setConversationMessages((prev) => [...prev, errorMsg]);
    }
  };

  // Initialize and cleanup VAD when AI conversation modal opens/closes
  useEffect(() => {
    if (!showAiConversation) {
      // Clean up VAD when modal closes
      if (vadInstanceRef.current) {
        console.log("[VAD] Stopping VAD due to modal close");
        vadInstanceRef.current.stop();
        vadInstanceRef.current = null;
      }
      setIsVoiceListening(false);
      setIsSpeaking(false);
      setVolumeLevel(0);
      return;
    }

    // Start VAD when modal opens
    if (voiceRecognitionSupported) {
      console.log("[VAD] Starting automatic voice detection...");
      
      const vadConfig: VADConfig = {
        speechThreshold: 38, // Balanced for accuracy and noise reduction
        silenceDuration: 1200,
        minSpeechDuration: 800, // Reduced to capture shorter phrases
        maxRecordingDuration: 15000,
        checkInterval: 100,
      };

      const vadCallbacks: VADCallbacks = {
        onSpeechStart: () => {
          console.log("[VAD] Speech started");
          setIsSpeaking(true);
        },
        onSpeechEnd: (audioBlob: Blob) => {
          console.log("[VAD] Speech ended");
          setIsSpeaking(false);
          handleVADTranscription(audioBlob);
        },
        onVolumeChange: (volume: number) => {
          setVolumeLevel(volume);
        },
        onError: (error: Error) => {
          console.error("[VAD] Error:", error);
          
          let errorMessage = error.message;
          if (errorMessage.includes("Permission denied") || errorMessage.includes("not-allowed")) {
            errorMessage = "🎤 Microphone access denied. Please allow microphone permissions in your browser settings.";
          } else if (errorMessage.includes("not-found")) {
            errorMessage = "🎤 No microphone found. Please connect a microphone.";
          }

          const errorMsg: ConversationMessage = {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: errorMessage,
            timestamp: Date.now(),
          };
          setConversationMessages((prev) => [...prev, errorMsg]);
          setIsVoiceListening(false);
        },
      };

      const vad = new VoiceActivityDetector(vadConfig, vadCallbacks);
      vadInstanceRef.current = vad;

      vad.start()
        .then(() => {
          console.log("[VAD] Started successfully");
          setIsVoiceListening(true);
        })
        .catch((error) => {
          console.error("[VAD] Failed to start:", error);
          setIsVoiceListening(false);
        });
    } else {
      console.warn("[VAD] Voice recognition not supported");
      const warningMsg: ConversationMessage = {
        id: `warning-${Date.now()}`,
        role: "assistant",
        content: "⚠️ Voice input not available. Please use HTTPS, enable microphone permissions, or configure VITE_OPENAI_API_KEY.",
        timestamp: Date.now(),
      };
      setConversationMessages((prev) => [...prev, warningMsg]);
    }

    // Cleanup on unmount
    return () => {
      if (vadInstanceRef.current) {
        vadInstanceRef.current.stop();
        vadInstanceRef.current = null;
      }
    };
  }, [showAiConversation, voiceRecognitionSupported]);

  const onCloseAiConversation = () => {
    setShowAiConversation(false);
    // VAD cleanup handled by useEffect
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
      setFocusRequest({ point: startFromPacket, zoom: 19 });
      setRouteError(null);
      setEntryMode("quick");
      
      // Check if mobile device - show mobile-optimized welcome screen
      const isMobile = isMobileDevice();
      if (isMobile) {
        console.log("[QR Scan] Mobile device detected - showing mobile welcome");
        setShowMobileScannedRoute(true);
        setShowWelcomeModal(false);
      } else {
        console.log("[QR Scan] Desktop device - loading route directly");
        setShowWelcomeModal(false);
      }
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
        onOpenAiConversation={onOpenAiConversationFromWelcome}
        welcomeImage={welcomeRouteImage}
      />

      <MobileScannedRouteModal
        show={showMobileScannedRoute}
        startLabel={startLabel}
        destinationLabel={destination?.label || "Campus Location"}
        onStartNavigation={onStartMobileNavigation}
      />

      <AiConversationModal
        show={showAiConversation}
        messages={conversationMessages}
        isListening={isVoiceListening}
        isProcessing={isAiProcessing}
        voiceSupported={voiceRecognitionSupported}
        isSpeaking={isSpeaking}
        volumeLevel={volumeLevel}
        onClose={onCloseAiConversation}
        onSendMessage={onSendConversationMessage}
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
        compactLabel={compactLabel}
        fallbackImage={welcomeRouteImage}
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
        onOpenDestinationListModal={onOpenDestinationListModal}
        onToggleVoiceCommand={onToggleVoiceCommand}
        onChangeMode={() => {
          stopVoiceRecognition();
          setShowDestinationListModal(false);
          setShowWelcomeModal(true);
        }}
        onRecenter={(point) => setFocusRequest({ point, zoom: 18 })}
        onClearRoute={onClearRoute}
      />

      <StatusToast message={visibleStatus} />

      <RouteAssistantPanel
        destination={destination}
        startLabel={startLabel}
        routeLoading={routeLoading}
        route={route}
        routeError={routeError}
        formatDistance={formatDistance}
        formatDuration={formatDuration}
        compactLabel={compactLabel}
        qrCodeDataUrl={qrCodeDataUrl}
        shareLink={shareLink}
        isShareLinkPublic={isShareLinkPublic}
        onCopyShareLink={onCopyShareLink}
      />

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
