import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useState } from "react";
import type { Destination, RouteInfo } from "../types/navigation";

type RouteAssistantPanelProps = {
  destination: Destination | null;
  startLabel: string;
  routeLoading: boolean;
  route: RouteInfo | null;
  routeError: string | null;
  formatDistance: (meters: number) => string;
  formatDuration: (seconds: number) => string;
  compactLabel: (label: string) => string;
  qrCodeDataUrl: string | null;
  shareLink: string | null;
  isShareLinkPublic: boolean;
  onCopyShareLink: () => void;
};

export function RouteAssistantPanel({
  destination,
  startLabel,
  routeLoading,
  route,
  routeError,
  formatDistance,
  formatDuration,
  compactLabel,
  qrCodeDataUrl,
  shareLink,
  isShareLinkPublic,
  onCopyShareLink,
}: RouteAssistantPanelProps) {
  const [isMobileCollapsed, setIsMobileCollapsed] = useState(true);

  return (
    <section
      className={`pointer-events-auto absolute right-0 bottom-0 z-[900] flex w-full flex-col overflow-hidden rounded-t-3xl border border-slate-300/30 bg-white/95 p-4 text-slate-900 shadow-[0_38px_120px_-45px_rgba(15,23,42,0.95)] backdrop-blur-md overlay-enter transition-all duration-300 md:top-4 md:right-4 md:bottom-4 md:left-auto md:w-96 md:translate-x-0 md:rounded-2xl max-md:landscape:top-0 max-md:landscape:bottom-0 max-md:landscape:left-0 max-md:landscape:right-auto max-md:landscape:h-[100dvh] max-md:landscape:max-h-[100dvh] max-md:landscape:w-80 max-md:landscape:rounded-none max-md:landscape:rounded-r-2xl max-md:landscape:border-r ${
        isMobileCollapsed
          ? "max-h-[15vh] md:max-h-[calc(100vh-2rem)] max-md:landscape:-translate-x-[calc(100%-3.5rem)]"
          : "max-h-[45vh] md:max-h-[calc(100vh-2rem)] max-md:landscape:translate-x-0"
      }`}
    >
      <header className="mb-3 border-b border-slate-200 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-[Sora] text-lg font-semibold">
              BU Route Assistant
            </p>
            <p className="mt-1 text-xs text-slate-600">From: {startLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileCollapsed((previous) => !previous)}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 md:hidden"
            aria-expanded={!isMobileCollapsed}
            aria-label={
              isMobileCollapsed ? "Expand route panel" : "Collapse route panel"
            }
          >
            <span className="inline-flex items-center gap-1">
              {isMobileCollapsed ? "Open" : "Hide"}
              {isMobileCollapsed ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </span>
          </button>
        </div>
        {destination ? (
          <p className="mt-1 text-xs text-slate-600">
            To: {compactLabel(destination.label)}
          </p>
        ) : (
          <p className="mt-1 text-xs text-slate-600">
            Set your destination to get started.
          </p>
        )}
      </header>

      <div
        className={`min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 ${
          isMobileCollapsed ? "hidden md:block" : "block"
        }`}
      >
        {routeLoading ? (
          <div className="flex flex-col items-center justify-center space-y-3 rounded-xl border border-blue-200 bg-blue-50 py-8 px-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <div className="text-center">
              <p className="text-sm font-semibold text-blue-900">
                Calculating the fastest route...
              </p>
              <p className="mt-1 text-xs text-blue-700">
                Finding the best path to your destination
              </p>
            </div>
          </div>
        ) : null}

        {!routeLoading && route ? (
          <>
            <div className="mb-3 flex gap-2">
              <div className="rounded-lg bg-cyan-100 px-3 py-2 text-sm font-semibold text-cyan-900">
                {formatDistance(route.distance)}
              </div>
              <div className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-900">
                {formatDuration(route.duration)}
              </div>
              <div className="rounded-lg bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-900">
                {route.profile === "foot" ? "Walking" : "Driving fallback"}
              </div>
            </div>

            {qrCodeDataUrl && shareLink ? (
              <div className="mb-3 rounded-xl border border-cyan-200 bg-cyan-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
                  Share Route QR
                </p>
                <p className="mt-1 text-xs text-cyan-800">
                  Optimized packet includes only start and destination data. The
                  app recomputes directions after opening for reliable scan
                  links.
                </p>
                {!isShareLinkPublic ? (
                  <p className="mt-1 text-xs font-semibold text-amber-700">
                    This link is localhost-only. Set VITE_PUBLIC_BASE_URL to
                    your LAN/public URL (for example: http://192.168.1.2:5177)
                    before generating QR for other devices.
                  </p>
                ) : null}
                <div className="mt-3 flex flex-col items-center gap-3">
                  <img
                    src={qrCodeDataUrl}
                    alt="QR code to follow this route"
                    className="h-52 w-52 rounded-lg border border-cyan-200 bg-white p-2"
                  />
                  <button
                    type="button"
                    onClick={onCopyShareLink}
                    className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-cyan-800 ring-1 ring-cyan-300 transition hover:bg-cyan-100"
                  >
                    Copy share link
                  </button>
                </div>
              </div>
            ) : null}

            <ol className="route-panel-scroll space-y-2">
              {route.steps.map((step, index) => (
                <li
                  key={`${step.instruction}-${index}`}
                  className="step-reveal rounded-lg border border-slate-200 bg-slate-50 p-3"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <p className="text-sm font-medium leading-relaxed text-slate-800">
                    {index + 1}. {step.instruction}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatDistance(step.distance)}
                  </p>
                </li>
              ))}
            </ol>
          </>
        ) : null}

        {!routeLoading && !route && !routeError ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-100 p-4 text-sm text-slate-600">
            Route details will appear here after selecting a destination.
          </div>
        ) : null}

        {!routeLoading && routeError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {routeError}
          </div>
        ) : null}
      </div>
    </section>
  );
}
