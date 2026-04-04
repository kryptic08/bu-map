import type { EntryMode } from "../types/navigation";

type WelcomeModalProps = {
  show: boolean;
  onChooseEntryMode: (mode: EntryMode) => void;
  welcomeImage: string;
};

export function WelcomeModal({
  show,
  onChooseEntryMode,
  welcomeImage,
}: WelcomeModalProps) {
  if (!show) {
    return null;
  }

  return (
    <section className="pointer-events-none absolute inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-slate-950/70 p-3 md:p-6 max-md:landscape:p-2">
      <div className="pointer-events-auto relative flex w-full max-w-5xl max-h-[96dvh] flex-col overflow-hidden rounded-3xl border border-cyan-100/70 bg-white shadow-[0_38px_120px_-45px_rgba(15,23,42,0.95)] md:max-h-[90dvh] md:rounded-4xl max-md:landscape:flex-row">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.2),transparent_52%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.24),transparent_45%)]" />

        <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto p-4 md:p-8 max-md:landscape:w-1/2 max-md:landscape:p-6">
          <div className="space-y-3 md:space-y-4">
            <p className="font-[\'Space_Grotesk\'] text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-3xl lg:text-4xl">
              Welcome to AY MASAIN
            </p>
            <p className="text-sm leading-relaxed text-slate-700 md:text-base">
              Plan your path across campus in seconds. Choose AI voice command
              if you want hands-free guidance, or jump straight to quick
              destinations for one-tap routing.
            </p>

            <div className="rounded-2xl border border-cyan-200/80 bg-cyan-50/80 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-800">
                How this works
              </p>
              <div className="mt-1 space-y-1">
                <p className="text-xs text-cyan-900">
                  1. Pick your navigation style below.
                </p>
                <p className="text-xs text-cyan-900">
                  2. Say a destination like "Take me to BUP Gym" or choose a
                  quick campus stop.
                </p>
                <p className="text-xs text-cyan-900">
                  3. Follow the route and live turn-by-turn instructions.
                </p>
              </div>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2 md:gap-3">
              <button
                type="button"
                onClick={() => onChooseEntryMode("ai")}
                className="rounded-2xl border border-cyan-300 bg-linear-to-br from-cyan-500 to-sky-600 p-3.5 text-left text-white shadow-lg transition hover:-translate-y-px hover:from-cyan-400 hover:to-sky-500 md:p-4"
              >
                <p className="text-base font-semibold">AI Voice Command</p>
                <p className="mt-1 text-xs leading-relaxed text-cyan-50">
                  Speak naturally and let AI match your destination.
                </p>
              </button>

              <button
                type="button"
                onClick={() => onChooseEntryMode("quick")}
                className="rounded-2xl border border-slate-300 bg-white p-3.5 text-left shadow-sm transition hover:border-slate-400 hover:bg-slate-50 md:p-4"
              >
                <p className="text-base font-semibold text-slate-900">
                  Quick Destination
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Pick from your most-used campus points instantly.
                </p>
              </button>
            </div>
          </div>
        </div>

        <div className="relative order-first flex min-h-[160px] flex-col overflow-hidden bg-slate-900 md:order-none max-md:landscape:w-5/12 max-md:landscape:flex-none">
          <img
            src={welcomeImage}
            alt="Computer Studies Department floor plan"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-900/30 to-transparent max-md:landscape:bg-linear-to-l" />
          <div className="relative mt-auto p-4 md:p-8 max-md:landscape:p-6">
            <div className="rounded-2xl border border-slate-700/50 bg-slate-950/75 p-3 text-slate-100 backdrop-blur-md md:p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-400">
                Department Map
              </p>
              <p className="mt-1 text-sm font-medium leading-relaxed md:text-base">
                "Computer Studies Department - 1st Floor"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
