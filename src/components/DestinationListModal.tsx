import type { Destination, PresetDestination } from "../types/navigation";

type DestinationListModalProps = {
  show: boolean;
  destination: Destination | null;
  destinations: PresetDestination[];
  onSelectDestination: (destination: PresetDestination) => void;
  onClose: () => void;
};

export function DestinationListModal({
  show,
  destination,
  destinations,
  onSelectDestination,
  onClose,
}: DestinationListModalProps) {
  if (!show) {
    return null;
  }

  return (
    <section className="pointer-events-none absolute inset-0 z-[1970] flex items-center justify-center bg-black/40 backdrop-blur-sm p-3 md:p-4">
      <div className="pointer-events-auto flex w-full max-w-6xl flex-col rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-6 md:p-8 shadow-2xl" style={{ maxHeight: "calc(100vh - 2rem)" }}>
        {/* Glass gradient overlay */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] pointer-events-none" />

        <div className="relative flex shrink-0 items-start justify-between gap-4 mb-4">
          <div>
            <p className="font-[Space_Grotesk] text-xl md:text-2xl font-bold text-white">
              Select Destination
            </p>
            <p className="mt-1 text-xs md:text-sm text-white/70">
              Choose from available campus locations
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl border border-white/20 bg-white/10 backdrop-blur px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold text-white transition hover:bg-white/20 hover:border-white/40"
          >
            Close
          </button>
        </div>

        <div className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-3 overflow-y-auto" style={{ maxHeight: "calc(100vh - 12rem)" }}>
          {destinations.map((place) => {
            const active =
              destination &&
              Math.abs(destination.lat - place.lat) < 0.000001 &&
              Math.abs(destination.lon - place.lon) < 0.000001;

            return (
              <button
                key={place.label}
                type="button"
                onClick={() => onSelectDestination(place)}
                className={`relative group rounded-xl border backdrop-blur-md transition-all duration-300 overflow-hidden px-3 py-3 text-left ${
                  active
                    ? "border-cyan-400/50 bg-gradient-to-br from-cyan-500/30 to-blue-500/20 shadow-lg shadow-cyan-500/20"
                    : "border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/40 hover:shadow-lg hover:shadow-white/10"
                }`}
              >
                {/* Animated gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                <div className="relative z-10">
                  <p className={`text-xs md:text-sm font-bold leading-tight line-clamp-2 ${active ? "text-cyan-50" : "text-white"}`}>
                    {place.label}
                  </p>
                  <p className={`mt-1 text-[10px] md:text-xs leading-tight line-clamp-2 ${active ? "text-cyan-100/80" : "text-white/60 group-hover:text-white/80"}`}>
                    {place.summary}
                  </p>
                </div>

                {/* Active indicator dot */}
                {active && (
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-lg shadow-cyan-400/50 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
