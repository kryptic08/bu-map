type NextStopPromptProps = {
  show: boolean;
  destinationLabel: string;
  onStay: () => void;
  onPickAnother: () => void;
};

export function NextStopPrompt({
  show,
  destinationLabel,
  onStay,
  onPickAnother,
}: NextStopPromptProps) {
  if (!show) {
    return null;
  }

  return (
    <section className="pointer-events-none absolute inset-0 z-[1200] flex items-center justify-center bg-slate-900/35 p-3 md:p-4">
      <div className="pointer-events-auto flex w-full max-w-sm flex-col rounded-2xl border border-slate-300/40 bg-white/95 p-5 text-slate-900 shadow-[0_38px_120px_-45px_rgba(15,23,42,0.95)] backdrop-blur-md overlay-enter">
        <p className="font-[Sora] text-lg font-semibold">
          You arrived at {destinationLabel}
        </p>
        <p className="mt-2 text-sm text-slate-600">What do you want to do?</p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onStay}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100"
          >
            Stay here
          </button>
          <button
            type="button"
            onClick={onPickAnother}
            className="flex-1 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Pick another one
          </button>
        </div>
      </div>
    </section>
  );
}
