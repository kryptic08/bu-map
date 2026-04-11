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
    <section className="pointer-events-none absolute inset-0 z-[1000] flex items-center justify-center bg-slate-950/70 p-3 md:p-6 max-md:landscape:p-2">
      <div className="pointer-events-auto relative flex w-full max-w-5xl h-[85vh] flex-col overflow-hidden rounded-3xl border border-cyan-100/70 bg-white shadow-[0_38px_120px_-45px_rgba(15,23,42,0.95)] md:rounded-4xl max-md:landscape:flex-row">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.2),transparent_52%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.24),transparent_45%)]" />

        <div className="relative flex flex-1 flex-col justify-center p-4 md:p-8 max-md:landscape:w-1/2 max-md:landscape:p-8">
          <div className="space-y-6 md:space-y-8 flex-1 flex flex-col justify-center">
            <div>
              <p className="font-[\'Space_Grotesk\'] text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl">
                Welcome to AY MASAIN
              </p>
              <p className="mt-2 text-base leading-relaxed text-slate-700 md:text-lg">
                Plan your path across campus in seconds.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onChooseEntryMode("ai")}
                className="rounded-2xl border border-cyan-300 bg-linear-to-br from-cyan-500 to-sky-600 p-5 text-left text-white shadow-lg transition hover:-translate-y-px hover:from-cyan-400 hover:to-sky-500 md:p-6"
              >
                <p className="text-lg md:text-xl font-bold">AI Voice Command</p>
                <p className="mt-2 text-sm leading-relaxed text-cyan-50">
                  Speak naturally and let AI match your destination.
                </p>
              </button>

              <button
                type="button"
                onClick={() => onChooseEntryMode("quick")}
                className="rounded-2xl border border-slate-300 bg-white p-5 text-left shadow-sm transition hover:border-slate-400 hover:bg-slate-50 md:p-6"
              >
                <p className="text-lg md:text-xl font-bold text-slate-900">
                  Quick Destination
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Pick from your most-used campus points instantly.
                </p>
              </button>
            </div>
          </div>
        </div>

        <div className="relative flex min-h-[120px] md:min-h-0 flex-col overflow-hidden bg-slate-900 max-md:landscape:w-5/12 max-md:landscape:flex-none">
          <img
            src={welcomeImage}
            alt="Computer Studies Department floor plan"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-900/30 to-transparent max-md:landscape:bg-linear-to-l" />
          <div className="relative mt-auto p-4 md:p-8 max-md:landscape:p-6">
            <div className="rounded-2xl border border-slate-700/50 bg-slate-950/75 p-4 text-slate-100 backdrop-blur-md md:p-5">
              <p className="text-sm font-bold uppercase tracking-wide text-cyan-400">
                Department Map
              </p>
              <p className="mt-2 text-base font-semibold leading-relaxed md:text-lg">
                "Computer Studies Department - 1st Floor"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
