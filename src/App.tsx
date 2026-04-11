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
import { RouteAssistantPanel } from "./components/RouteAssistantPanel";
import { StatusToast } from "./components/StatusToast";
import { TopDirectionBanner } from "./components/TopDirectionBanner";
import { WelcomeModal } from "./components/WelcomeModal";
import { GUARD_HOUSE, PRESET_DESTINATIONS } from "./data/presetDestinations";
import { planBestRoutes } from "./services/routePlanner";
import {
  resolvePresetFromDestination,
  resolvePresetFromPrompt,
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
import {
  captureAudioFromMicrophone,
  transcribeAudioWithFastAPI,
  isFastAPIVoiceSupportedInBrowser,
  isBrowserSpeechRecognitionSupported,
  isHFTranscriptionConfigured,
  transcribeWithBrowserSpeechRecognition,
} from "./utils/voiceRecognition";
import {
  isOpenAIConfigured,
  processVoiceCommandWithChatGPT,
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
  const [isPreviewCardCollapsed, setIsPreviewCardCollapsed] = useState(false);
  const [showDestinationListModal, setShowDestinationListModal] =
    useState(false);
  const voiceCaptureAbortRef = useRef<AbortController | null>(null);

  // AI Conversation state
  const [showAiConversation, setShowAiConversation] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<
    ConversationMessage[]
  >([]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

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
    console.log("[Conversation Voice] Starting voice recognition...");

    const controller = new AbortController();
    voiceCaptureAbortRef.current = controller;

    try {
      const useFastApiTranscription =
        isHFTranscriptionConfigured() && isFastAPIVoiceSupportedInBrowser();
      let transcript = "";

      if (useFastApiTranscription) {
        console.log("[Conversation Voice] Capturing audio from microphone...");
        const audioBlob = await captureAudioFromMicrophone({
          maxDurationMs: 4500,
          timesliceMs: 250,
          signal: controller.signal,
        });

        console.log("[Conversation Voice] Transcribing with FastAPI...");
        try {
          transcript = await transcribeAudioWithFastAPI(audioBlob);
          console.log(
            "[Conversation Voice] Transcription received:",
            transcript,
          );
        } catch (fastApiError) {
          console.warn(
            "[Conversation Voice] FastAPI failed, using browser fallback:",
            fastApiError,
          );
          if (isBrowserSpeechRecognitionSupported()) {
            transcript = await transcribeWithBrowserSpeechRecognition({
              signal: controller.signal,
            });
          } else {
            throw fastApiError;
          }
        }
      } else {
        console.log("[Conversation Voice] Using browser speech recognition");
        transcript = await transcribeWithBrowserSpeechRecognition({
          signal: controller.signal,
        });
      }

      if (transcript) {
        console.log("[Conversation Voice] Transcript:", transcript);
        await onSendConversationMessage(transcript);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("[Conversation Voice] Error:", error);

      const errorMsg: ConversationMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: `Voice input error: ${errorMessage}`,
        timestamp: Date.now(),
      };
      setConversationMessages((prev) => [...prev, errorMsg]);
    } finally {
      voiceCaptureAbortRef.current = null;
      setIsVoiceListening(false);
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
      setFocusRequest({ point: startFromPacket, zoom: 19 });
      setRouteError(null);
      setEntryMode("quick");
      setShowWelcomeModal(false);
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
        welcomeImage={welcomeRouteImage}
      />

      <AiConversationModal
        show={showAiConversation}
        messages={conversationMessages}
        isListening={isVoiceListening}
        isProcessing={isAiProcessing}
        voiceSupported={voiceRecognitionSupported}
        onClose={onCloseAiConversation}
        onSendMessage={onSendConversationMessage}
        onToggleVoice={onToggleConversationVoice}
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
