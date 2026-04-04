import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
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
}: DestinationPreviewCardProps) {
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedFloorIndex, setSelectedFloorIndex] = useState(0);
  const [selectedDirectoryItemLabel, setSelectedDirectoryItemLabel] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!isFullscreenOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsFullscreenOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isFullscreenOpen]);

  useEffect(() => {
    setSelectedFloorIndex(0);
  }, [selectedPresetDestination?.label]);

  useEffect(() => {
    setSelectedDirectoryItemLabel(null);
  }, [selectedPresetDestination?.label, selectedFloorIndex]);

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
    activeFloorDirectory?.items ??
    (selectedPresetDestination?.details ?? []).map((detail) => ({
      label: detail,
      marker: [50, 35] as [number, number],
    }));
  const selectedDirectoryItem =
    activeDirectoryItems.find(
      (item) => item.label === selectedDirectoryItemLabel,
    ) ?? null;
  const previewImageSrc =
    activeFloorPlan?.image ?? selectedPresetDestination?.image ?? fallbackImage;
  const previewLabel = compactLabel(destination.label);

  return (
    <>
      <section
        className={`pointer-events-none absolute z-[900] overlay-enter transition-all duration-300 md:left-4 md:right-auto md:w-[420px] max-md:landscape:right-3 max-md:landscape:left-auto max-md:landscape:w-80 ${
          showTopDirectionBanner
            ? "top-24 max-md:landscape:top-20"
            : "top-3 md:top-4 max-md:landscape:top-4"
        } left-3 right-3`}
      >
        <div className="pointer-events-auto flex flex-col gap-2 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-sm md:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Destination preview
              </p>
              {hasArrivedAtDestination ? (
                <span className="rounded border border-emerald-300 bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  Arrived
                </span>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
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
            {floorPlans.length > 1 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {floorPlans.map((floorPlan, index) => (
                  <button
                    key={floorPlan.label}
                    type="button"
                    onClick={() => setSelectedFloorIndex(index)}
                    className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition ${
                      selectedFloorIndex === index
                        ? "border-blue-500 bg-blue-600 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {floorPlan.label}
                  </button>
                ))}
              </div>
            ) : null}

            <img
              src={previewImageSrc}
              alt={`${previewLabel} preview`}
              className="mt-1 block h-[16vh] min-h-[80px] max-h-44 w-full rounded-lg border border-slate-200 object-cover md:h-56 max-md:landscape:h-24 max-md:landscape:min-h-[60px]"
            />
            <p className="mt-1.5 text-sm font-semibold text-slate-900 md:mt-2">
              {previewLabel}
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600 md:line-clamp-none">
              {selectedPresetDestination?.summary ??
                "Destination loaded from a shared route. Choose a quick destination to view local details."}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFullscreenOpen(true)}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
              >
                Full screen
              </button>

              <button
                type="button"
                onClick={onToggleDestinationDetails}
                className="hidden rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800 md:inline-block"
              >
                {showDestinationDetails ? "Hide details" : "View details"}
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
          className="pointer-events-auto absolute inset-0 z-[1100] flex items-center justify-center bg-slate-950/90 p-4"
          onClick={() => setIsFullscreenOpen(false)}
          aria-label="Fullscreen destination preview"
        >
          <div
            className="w-full max-w-7xl rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-2xl md:p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-100 md:text-base">
                {activeFloorPlan?.label
                  ? `${previewLabel} - ${activeFloorPlan.label}`
                  : previewLabel}
              </p>
              <button
                type="button"
                onClick={() => setIsFullscreenOpen(false)}
                className="rounded-lg border border-slate-500 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-[280px_1fr]">
              <aside className="rounded-lg border border-slate-700 bg-slate-800/80 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">
                  Rooms and Offices
                </p>
                <p className="mt-1 text-[11px] text-slate-300">
                  {activeFloorLabel}
                </p>

                <ul className="mt-2 max-h-[58vh] space-y-1.5 overflow-y-auto pr-1 text-xs text-slate-100">
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
                              ? "border-cyan-400 bg-cyan-500/20 text-cyan-100"
                              : "border-slate-700 bg-slate-900/65 text-slate-100 hover:bg-slate-800"
                          }`}
                        >
                          {item.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </aside>

              <div className="rounded-lg border border-slate-700 bg-slate-950 p-2">
                <div className="relative overflow-auto rounded-md">
                  <img
                    src={previewImageSrc}
                    alt={`${previewLabel} full screen preview`}
                    className="block w-full rounded-md"
                  />

                  <svg
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    {selectedDirectoryItem ? (
                      <>
                        <circle
                          cx={selectedDirectoryItem.marker[0]}
                          cy={selectedDirectoryItem.marker[1]}
                          r="1.7"
                          fill="#f97316"
                        />
                        <circle
                          cx={selectedDirectoryItem.marker[0]}
                          cy={selectedDirectoryItem.marker[1]}
                          r="3.2"
                          fill="none"
                          stroke="#fb923c"
                          strokeWidth="0.5"
                          opacity="0.8"
                        />
                      </>
                    ) : null}
                  </svg>
                </div>

                <p className="mt-2 text-xs text-slate-300">
                  {selectedDirectoryItem
                    ? `Pinned location: ${selectedDirectoryItem.label}`
                    : "Click a room or office on the left to pin its location on the map."}
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
