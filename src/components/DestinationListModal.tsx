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
    <section className="pointer-events-none absolute inset-0 z-[970] flex items-center justify-center bg-slate-950/55 p-3 md:p-4">
      <div className="pointer-events-auto flex w-full max-w-xl max-h-[90dvh] flex-col rounded-2xl border border-blue-200 bg-white p-4 shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-3">
          <div>
            <p className="font-[Sora] text-lg font-semibold text-slate-900">
              Destination List
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Select a destination to generate your route.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-y-auto pb-2 max-md:landscape:grid-cols-3">
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
                className={`rounded-xl border px-3 py-2 text-left transition ${
                  active
                    ? "border-blue-500 bg-blue-600 text-white"
                    : "border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                }`}
              >
                <p className="text-sm font-semibold">{place.label}</p>
                <p
                  className={`mt-0.5 text-xs ${active ? "text-blue-100" : "text-slate-500"}`}
                >
                  {place.summary}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
