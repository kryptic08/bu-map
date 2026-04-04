import { useEffect, useMemo, useRef, useState } from "react";
import { divIcon, type LatLngExpression } from "leaflet";
import { MapPin } from "lucide-react";
import QRCode from "qrcode";
import { renderToStaticMarkup } from "react-dom/server";
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
import type {
  Destination,
  EntryMode,
  FocusRequest,
  Point,
  PresetDestination,
  RouteInfo,
} from "./types/navigation";

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
  const voiceCaptureAbortRef = useRef<AbortController | null>(null);

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

  const runAiVoiceCommand = (rawCommand: string) => {
    console.log("[Voice Command] Processing voice input:", rawCommand);

    const command = rawCommand.trim();
    if (!command) {
      console.log("[Voice Command] Empty command after trim");
      setLocationError("Voice command did not capture a destination.");
      return;
    }

    console.log(
      "[Voice Command] Attempting to match against preset destinations",
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
      "Voice command recognized, but no preset destination was matched.",
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

  const onToggleVoiceCommand = async () => {
    if (isVoiceListening) {
      console.log("[Voice] Stopping voice recognition");
      stopVoiceRecognition();
      return;
    }

    setLocationError(null);
    setIsVoiceListening(true);
    setVoiceFeedback("Listening... say where you want to go");
    console.log("[Voice] Starting voice recognition...");

    const controller = new AbortController();
    voiceCaptureAbortRef.current = controller;

    try {
      console.log("[Voice] Listening - awaiting user speech...");

      const useFastApiTranscription =
        isHFTranscriptionConfigured() && isFastAPIVoiceSupportedInBrowser();
      let transcript = "";

      if (useFastApiTranscription) {
        // Capture audio from microphone for FastAPI transcription.
        console.log("[Voice] Capturing audio from microphone...");
        const audioBlob = await captureAudioFromMicrophone({
          maxDurationMs: 4500,
          timesliceMs: 250,
          signal: controller.signal,
        });
        console.log(
          "[Voice] Audio captured successfully, size:",
          audioBlob.size,
          "bytes",
        );

        // Send captured audio to FastAPI endpoint.
        console.log(
          "[Voice] Sending audio to FastAPI endpoint for transcription...",
        );
        setVoiceFeedback("Transcribing your voice...");
        try {
          transcript = await transcribeAudioWithFastAPI(audioBlob);
          console.log(
            "[Voice] Transcription received from FastAPI:",
            transcript,
          );
        } catch (fastApiError) {
          console.warn(
            "[Voice] FastAPI transcription failed, attempting browser fallback:",
            fastApiError,
          );

          if (!isBrowserSpeechRecognitionSupported()) {
            throw fastApiError;
          }

          setVoiceFeedback(
            "FastAPI unavailable. Switching to browser speech...",
          );
          transcript = await transcribeWithBrowserSpeechRecognition({
            signal: controller.signal,
          });
          console.log(
            "[Voice] Transcription received from browser fallback:",
            transcript,
          );
        }
      } else {
        console.log(
          "[Voice] HF key unavailable; using browser speech recognition fallback.",
        );
        setVoiceFeedback("Listening in browser...");
        transcript = await transcribeWithBrowserSpeechRecognition({
          signal: controller.signal,
        });
        console.log("[Voice] Transcription received from browser:", transcript);
      }

      // Process the transcribed text to find a matching destination
      if (transcript) {
        console.log(
          "[Voice] Processing transcribed text for destination matching...",
        );
        setVoiceFeedback("Matching destination...");
        runAiVoiceCommand(transcript);
      } else {
        console.log("[Voice] No transcript returned from FastAPI");
        setLocationError("No speech detected. Please try again.");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("[Voice] Error during voice recognition:", error);

      if (
        errorMessage.includes("NotAllowedError") ||
        errorMessage.includes("permission")
      ) {
        setLocationError(
          "Microphone permission denied. Please enable microphone access in your browser settings.",
        );
      } else if (errorMessage.includes("NotFoundError")) {
        setLocationError(
          "No microphone found. Please connect a microphone and try again.",
        );
      } else if (errorMessage.includes("HF API key")) {
        setLocationError(
          "Voice transcription setup is missing VITE_HF_API_KEY.",
        );
      } else if (
        errorMessage.includes("Speech recognition error: not-allowed")
      ) {
        setLocationError(
          "Microphone permission denied. Please enable microphone access in your browser settings.",
        );
      } else if (errorMessage.includes("Speech recognition error: no-speech")) {
        setLocationError("No speech detected. Please try again.");
      } else if (
        errorMessage.includes("Browser speech recognition is not supported")
      ) {
        setLocationError(
          "Voice recognition is not supported in this browser. Try Chrome or Edge.",
        );
      } else {
        setLocationError(`Voice command failed: ${errorMessage}`);
      }
    } finally {
      console.log("[Voice] Voice recognition ended");
      voiceCaptureAbortRef.current = null;
      setIsVoiceListening(false);
      setVoiceFeedback(null);
    }
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
    <main className="relative h-[100dvh] w-screen overflow-hidden bg-slate-100 font-[Manrope] text-slate-900">
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
