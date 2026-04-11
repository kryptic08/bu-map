import { Navigation, MapPin, ArrowRight, Smartphone } from "lucide-react";

type MobileScannedRouteModalProps = {
  show: boolean;
  startLabel: string;
  destinationLabel: string;
  onStartNavigation: () => void;
};

export function MobileScannedRouteModal({
  show,
  startLabel,
  destinationLabel,
  onStartNavigation,
}: MobileScannedRouteModalProps) {
  if (!show) {
    return null;
  }

  return (
    <section className="fixed inset-0 z-9999 flex items-end bg-linear-to-b from-sky-900 to-cyan-900 md:items-center">
      <div className="w-full">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute -left-20 -top-20 h-80 w-80 animate-pulse rounded-full bg-cyan-400 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-80 w-80 animate-pulse rounded-full bg-sky-400 blur-3xl" style={{ animationDelay: '1s' }} />
        </div>

        {/* Content */}
        <div className="relative mx-auto max-w-md px-6 pb-8 pt-12 md:px-8">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                <Smartphone className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-400 shadow-lg">
                <Navigation className="h-5 w-5 text-cyan-900" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-3 text-center text-3xl font-bold text-white">
            Route Loaded! 🎯
          </h1>
          <p className="mb-8 text-center text-base text-cyan-100">
            You've scanned a navigation route for Bicol University Polangui campus
          </p>

          {/* Route Info Card */}
          <div className="mb-8 rounded-2xl bg-white/10 p-6 backdrop-blur-md">
            <div className="space-y-4">
              {/* Starting Point */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">
                    Starting from
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">
                    {startLabel}
                  </p>
                </div>
              </div>

              {/* Arrow Separator */}
              <div className="flex justify-center">
                <ArrowRight className="h-6 w-6 text-cyan-300" />
              </div>

              {/* Destination */}
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200">
                    Going to
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">
                    {destinationLabel}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-8 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-xs font-bold text-cyan-900">
                1
              </div>
              <p className="text-sm text-cyan-50">
                Tap <strong>"Start Navigation"</strong> to load the route on the map
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-xs font-bold text-cyan-900">
                2
              </div>
              <p className="text-sm text-cyan-50">
                Follow the <strong>blue path</strong> and turn-by-turn directions
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-xs font-bold text-cyan-900">
                3
              </div>
              <p className="text-sm text-cyan-50">
                Use <strong>zoom and pan</strong> to explore the campus map
              </p>
            </div>
          </div>

          {/* Start Button */}
          <button
            type="button"
            onClick={onStartNavigation}
            className="group relative w-full overflow-hidden rounded-2xl bg-white py-5 text-center text-lg font-bold text-cyan-900 shadow-2xl shadow-cyan-500/50 transition-all hover:scale-[1.02] hover:shadow-cyan-400/60 active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-linear-to-r from-cyan-400 to-sky-400 opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="relative flex items-center justify-center gap-2">
              <Navigation className="h-6 w-6" />
              Start Navigation
            </span>
          </button>

          {/* Footer Note */}
          <p className="mt-6 text-center text-xs text-cyan-200">
            💡 Tip: For best experience, allow location access to see your real-time position on campus
          </p>
        </div>
      </div>
    </section>
  );
}
