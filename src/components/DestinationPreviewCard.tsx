import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, QrCode } from "lucide-react";
import { QrPreviewModal } from "./QrPreviewModal";
import type { Destination, PresetDestination } from "../types/navigation";

type DirectoryItem = NonNullable<
  PresetDestination["floorDirectory"]
>[number]["items"][number];

type DestinationPreviewCardProps = {
  destination: Destination | null;
  selectedPresetDestination: PresetDestination | null;
  showTopDirectionBanner: boolean;
  hasArrivedAtDestination: boolean;
  showDestinationDetails: boolean;
  onToggleDestinationDetails: () => void;
  compactLabel: (label: string) => string;
  fallbackImage: string;
  qrCodeDataUrl?: string | null;
  onCopyShareLink?: () => void;
  isScannedRoute?: boolean;
  openFloorplanRequest?: {
    token: number;
    roomLabel?: string;
  } | null;
};

export function DestinationPreviewCard({
  destination,
  selectedPresetDestination,
  showTopDirectionBanner,
  hasArrivedAtDestination,
  showDestinationDetails,
  onToggleDestinationDetails,
  compactLabel,
  fallbackImage,
  qrCodeDataUrl,
  onCopyShareLink,
  openFloorplanRequest,
  isCollapsed = false,
  onToggleCollapse,
  isScannedRoute = false,
}: DestinationPreviewCardProps & {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [showThumbnailFullscreen, setShowThumbnailFullscreen] = useState(false);
  const [selectedFloorIndex, setSelectedFloorIndex] = useState(0);
  const [showQrModal, setShowQrModal] = useState(false);
  const lastHandledFloorplanTokenRef = useRef<number | null>(null);
  const [selectedDirectoryItemLabel, setSelectedDirectoryItemLabel] = useState<
    string | null
  >(null);

  const normalizeText = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const findBestDirectoryMatch = (
    hint: string,
  ): { floorIndex: number; itemLabel: string; score: number } | null => {
    const normalizedHint = normalizeText(hint);
    if (!normalizedHint) {
      return null;
    }

    const hintTokens = normalizedHint
      .split(" ")
      .filter((token) => token.length > 1);

    const floorDirectory = selectedPresetDestination?.floorDirectory ?? [];
    let bestMatch: {
      floorIndex: number;
      itemLabel: string;
      score: number;
    } | null = null;

    for (const floorEntry of floorDirectory) {
      const floorIndex = (
        selectedPresetDestination?.floorPlans ?? []
      ).findIndex((floorPlan) => floorPlan.label === floorEntry.floorLabel);

      if (floorIndex < 0) {
        continue;
      }

      for (const item of floorEntry.items) {
        const normalizedItem = normalizeText(item.label);
        if (!normalizedItem) {
          continue;
        }

        let score = 0;
        if (normalizedHint === normalizedItem) {
          score = 100;
        } else if (normalizedItem.includes(normalizedHint)) {
          score = 80;
        } else if (normalizedHint.includes(normalizedItem)) {
          score = 70;
        } else {
          const itemTokens = normalizedItem.split(" ");
          const overlap = hintTokens.filter((token) =>
            itemTokens.includes(token),
          ).length;
          score = overlap * 10;
        }

        if (!bestMatch || score > bestMatch.score) {
          bestMatch = {
            floorIndex,
            itemLabel: item.label,
            score,
          };
        }
      }
    }

    if (!bestMatch || bestMatch.score <= 0) {
      return null;
    }

    return bestMatch;
  };

  useEffect(() => {
    if (
      !openFloorplanRequest ||
      openFloorplanRequest.token === null ||
      openFloorplanRequest.token === undefined
    ) {
      return;
    }

    if (lastHandledFloorplanTokenRef.current === openFloorplanRequest.token) {
      return;
    }

    lastHandledFloorplanTokenRef.current = openFloorplanRequest.token;
    setShowThumbnailFullscreen(false);
    setIsFullscreenOpen(true);

    if (openFloorplanRequest.roomLabel) {
      const match = findBestDirectoryMatch(openFloorplanRequest.roomLabel);
      if (match) {
        setSelectedFloorIndex(match.floorIndex);
        setSelectedDirectoryItemLabel(match.itemLabel);
        return;
      }
    }

    setSelectedDirectoryItemLabel(null);
  }, [openFloorplanRequest, selectedPresetDestination?.floorDirectory]);

  useEffect(() => {
    if (!isFullscreenOpen && !showThumbnailFullscreen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullscreenOpen(false);
        setShowThumbnailFullscreen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isFullscreenOpen, showThumbnailFullscreen]);

  useEffect(() => {
    setSelectedFloorIndex(0);
  }, [selectedPresetDestination?.label]);

  useEffect(() => {
    setSelectedDirectoryItemLabel(null);
  }, [selectedPresetDestination?.label]);

  if (!destination) {
    return null;
  }

  const floorPlans = selectedPresetDestination?.floorPlans ?? [];
  const activeFloorPlan = floorPlans[selectedFloorIndex] ?? null;
  const activeFloorLabel = activeFloorPlan?.label ?? "Ground";
  const activeFloorDirectory =
    selectedPresetDestination?.floorDirectory?.find(
      (entry) => entry.floorLabel === activeFloorLabel,
    ) ?? null;
  const activeDirectoryItems: DirectoryItem[] =
    activeFloorDirectory?.items ?? [];
  const selectedDirectoryItem =
    activeDirectoryItems.find(
      (item) => item.label === selectedDirectoryItemLabel,
    ) ?? null;
  const cardImageSrc =
    selectedPresetDestination?.thumbnail ??
    selectedPresetDestination?.image ??
    fallbackImage;
  const floorPlanImageSrc =
    activeFloorPlan?.image ?? selectedPresetDestination?.image ?? fallbackImage;
  const previewLabel = compactLabel(destination.label);

  return (
    <>
      <QrPreviewModal
        show={showQrModal}
        qrCodeDataUrl={qrCodeDataUrl ?? null}
        onClose={() => setShowQrModal(false)}
        onCopyShareLink={onCopyShareLink ?? (() => {})}
      />
      <section
        className={`pointer-events-none fixed z-900 overlay-enter transition-all duration-300 md:absolute md:left-4 md:right-auto md:w-105 max-md:landscape:right-3 max-md:landscape:left-auto max-md:landscape:w-80 ${
          showTopDirectionBanner
            ? "md:top-24 max-md:landscape:top-20"
            : "md:top-4 max-md:landscape:top-4"
        } left-0 right-0 bottom-0 md:bottom-auto max-md:top-auto`}
      >
        <div className="pointer-events-auto flex flex-col gap-2 rounded-t-3xl md:rounded-2xl border border-slate-200 md:border-slate-300/30 bg-white/95 p-5 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Destination preview
              </p>
              {isScannedRoute && (
                <span className="flex items-center gap-1 rounded border border-blue-300 bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800">
                  <QrCode size={10} />
                  Shared Route
                </span>
              )}
              {hasArrivedAtDestination ? (
                <span className="rounded border border-emerald-300 bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  Arrived
                </span>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onToggleCollapse}
              className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-600 transition hover:bg-slate-200"
              aria-label={isCollapsed ? "Expand preview" : "Collapse preview"}
            >
              {isCollapsed ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronUp size={14} />
              )}
            </button>
          </div>

          <div
            className={`transition-all duration-300 overflow-y-auto pr-1 custom-scrollbar ${
              isCollapsed
                ? "max-h-0 opacity-0"
                : "max-h-[35vh] md:max-h-[60vh] opacity-100"
            }`}
          >
            <div className="relative mt-1 block h-[16vh] min-h-20 max-h-44 w-full md:h-56 max-md:landscape:h-24 max-md:landscape:min-h-15">
              <img
                src={cardImageSrc}
                alt={`${previewLabel} preview`}
                className="absolute inset-0 h-full w-full rounded-lg border border-slate-200 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setShowThumbnailFullscreen(true)}
                title="Click to view fullscreen"
              />
            </div>
            <p className="mt-1.5 text-sm font-semibold text-slate-900 md:mt-2">
              {previewLabel}
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600 md:line-clamp-none">
              {selectedPresetDestination?.summary ??
                "Destination loaded from a shared route. Choose a quick destination to view local details."}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFullscreenOpen(true)}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
              >
                View Floorplan
              </button>

              <button
                type="button"
                onClick={onToggleDestinationDetails}
                className="hidden rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 md:inline-block"
              >
                {showDestinationDetails ? "Hide details" : "View details"}
              </button>

              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="md:hidden rounded-lg bg-blue-100 border border-blue-300 px-3 py-1.5 text-xs font-semibold text-blue-800 transition hover:bg-blue-200"
              >
                Share QR
              </button>
            </div>

            {showDestinationDetails ? (
              <ul className="mt-2 hidden space-y-1.5 rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-700 md:block">
                {(
                  selectedPresetDestination?.details ?? [
                    "Detailed profile is currently unavailable for this shared destination.",
                    "Select a quick destination from the list to load full local details.",
                  ]
                ).map((detail) => (
                  <li key={detail} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </section>

      {isFullscreenOpen ? (
        <section
          className="pointer-events-auto absolute inset-0 z-1100 flex items-center justify-center bg-slate-950/55 p-4"
          onClick={() => setIsFullscreenOpen(false)}
          aria-label="Fullscreen destination preview"
        >
          <div
            className="flex flex-col w-full h-full max-w-7xl rounded-xl border border-blue-200 bg-white p-3 shadow-2xl md:p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-2 flex shrink-0 items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-slate-900 md:text-base">
                  {activeFloorPlan?.label
                    ? `${previewLabel} - ${activeFloorPlan.label}`
                    : previewLabel}
                </p>
                {floorPlans.length > 1 ? (
                  <div className="flex bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                    {floorPlans.map((floorPlan, index) => (
                      <button
                        key={floorPlan.label}
                        type="button"
                        onClick={() => setSelectedFloorIndex(index)}
                        className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                          selectedFloorIndex === index
                            ? "bg-white text-blue-700 shadow-sm border border-slate-200/50"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {floorPlan.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setIsFullscreenOpen(false)}
                className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-[280px_1fr] min-h-0 flex-1">
              <aside className="flex flex-col min-h-0 rounded-lg border border-cyan-100 bg-cyan-50/50 p-3">
                <p className="shrink-0 text-xs font-semibold uppercase tracking-wide text-cyan-800">
                  Rooms and Offices
                </p>
                <p className="shrink-0 mt-1 text-[11px] text-cyan-700">
                  {activeFloorLabel}
                </p>

                <ul className="mt-2 flex-1 space-y-1.5 overflow-y-auto pr-1 text-xs text-slate-800 custom-scrollbar">
                  {activeDirectoryItems.map((item) => {
                    const isActive = selectedDirectoryItemLabel === item.label;

                    return (
                      <li key={`${activeFloorLabel}-${item.label}`}>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedDirectoryItemLabel(item.label)
                          }
                          className={`w-full rounded-md border px-2 py-1.5 text-left transition ${
                            isActive
                              ? "border-blue-500 bg-blue-600 text-white shadow-md"
                              : "border-slate-200 bg-white text-slate-800 shadow-sm hover:border-blue-400 hover:bg-blue-50"
                          }`}
                        >
                          {item.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </aside>

              <div className="flex flex-col min-h-0 rounded-lg border border-slate-200 bg-slate-50 p-2">
                <div className="relative flex-1 min-h-0 overflow-auto md:overflow-hidden md:flex md:items-center md:justify-center rounded-md bg-white border border-slate-100 shadow-sm custom-scrollbar">
                  <div className="relative max-w-full">
                    <img
                      src={floorPlanImageSrc}
                      alt={`${previewLabel} floor plan`}
                      className="block w-full max-w-full rounded-md md:max-h-full md:w-auto"
                      style={{ maxHeight: "calc(100vh - 200px)" }}
                    />
                    {selectedDirectoryItem ? (
                      <>
                        <div
                          className="absolute z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600 shadow-[0_0_0_2px_rgba(255,255,255,1)]"
                          style={{
                            left: `${selectedDirectoryItem.marker[0]}%`,
                            top: `${selectedDirectoryItem.marker[1]}%`,
                          }}
                        />
                        <div
                          className="absolute z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-blue-500 bg-blue-500/20"
                          style={{
                            left: `${selectedDirectoryItem.marker[0]}%`,
                            top: `${selectedDirectoryItem.marker[1]}%`,
                          }}
                        />
                      </>
                    ) : null}
                  </div>{" "}
                </div>

                <p className="shrink-0 mt-2 text-xs text-slate-600">
                  {selectedDirectoryItem
                    ? `Pinned location: ${selectedDirectoryItem.label}`
                    : "Click a room or office on the left to pin its location on the map."}
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {showThumbnailFullscreen ? (
        <section
          className="pointer-events-auto absolute inset-0 z-1100 flex items-center justify-center bg-slate-950/80 p-4"
          onClick={() => setShowThumbnailFullscreen(false)}
          aria-label="Fullscreen thumbnail view"
        >
          <div
            className="relative max-w-[95vw] max-h-[95vh]"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={cardImageSrc}
              alt={`${previewLabel} fullscreen`}
              className="max-w-full max-h-[95vh] w-auto h-auto rounded-lg shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setShowThumbnailFullscreen(false)}
              className="absolute top-4 right-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg transition hover:bg-slate-100"
            >
              Close
            </button>
          </div>
        </section>
      ) : null}
    </>
  );
}
