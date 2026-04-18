import { useEffect, useState } from "react";
import type { EntryMode } from "../types/navigation";

type WelcomeModalProps = {
  show: boolean;
  onChooseEntryMode: (mode: EntryMode) => void;
  welcomeImage: string;
  modeOnly?: boolean;
};

export function WelcomeModal({
  show,
  onChooseEntryMode,
  welcomeImage,
  modeOnly = false,
}: WelcomeModalProps) {
  const [step, setStep] = useState<"welcome" | "instructions" | "mode">(
    modeOnly ? "mode" : "welcome",
  );

  useEffect(() => {
    if (show) {
      setStep(modeOnly ? "mode" : "welcome");
    }
  }, [show, modeOnly]);

  if (!show) {
    return null;
  }

  if (modeOnly) {
    return (
      <section className="pointer-events-none absolute inset-0 z-1000 flex items-center justify-center bg-slate-900/35 p-3 md:p-6 max-md:landscape:p-2">
        <div className="pointer-events-auto relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)]">
          <div className="p-5 md:p-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7">
              <p className="font-['Space_Grotesk'] text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-4xl">
                Choose Navigation Mode
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700 md:text-base">
                Select how you want to navigate right now.
              </p>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onChooseEntryMode("ai")}
                className="rounded-2xl border border-slate-300 bg-white p-5 text-left text-slate-900 transition hover:-translate-y-px hover:border-slate-400 hover:shadow-sm md:p-6"
              >
                <p className="text-lg font-bold md:text-xl">AI Voice Command</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Speak naturally and let AI detect your destination.
                </p>
              </button>

              <button
                type="button"
                onClick={() => onChooseEntryMode("quick")}
                className="rounded-2xl border border-slate-300 bg-white p-5 text-left transition hover:-translate-y-px hover:border-slate-400 hover:shadow-sm md:p-6"
              >
                <p className="text-lg font-bold text-slate-900 md:text-xl">
                  Quick Destination
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Tap from preset destinations for a fast route.
                </p>
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pointer-events-none absolute inset-0 z-1000 flex items-center justify-center bg-slate-900/35 p-3 md:p-6 max-md:landscape:p-2">
      <div className="pointer-events-auto relative h-[88vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)]">
        <img
          src={welcomeImage}
          alt="Computer Studies Department floor map background"
          className="absolute inset-0 h-full w-full object-cover opacity-15"
        />
        <div className="relative flex h-full flex-col p-4 md:p-8">
          <div className="mb-3 flex items-center justify-between md:mb-4">
            <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-semibold tracking-wide text-cyan-700 md:text-xs">
              AY MASAIN
            </span>
            <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-medium text-violet-700 md:text-xs">
              {step === "welcome"
                ? "Step 1 of 3"
                : step === "instructions"
                  ? "Step 2 of 3"
                  : "Step 3 of 3"}
            </span>
          </div>

          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-5 md:gap-6">
            {step === "welcome" ? (
              <>
                <div className="rounded-2xl border border-cyan-100 bg-linear-to-br from-cyan-50 via-white to-emerald-50 p-5 md:p-7">
                  <span className="inline-flex rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-semibold text-cyan-700">
                    Smart Campus Navigation
                  </span>
                  <p className="mt-3 font-['Space_Grotesk'] text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl">
                    Welcome to AY MASAIN
                  </p>
                  <p className="mt-2 text-sm leading-relaxed font-semibold text-cyan-700 md:text-lg">
                    Bicol University Campus Navigation Assistant
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 md:text-base">
                    Find offices, classrooms, and service points quickly with
                    guided map directions, voice support, and QR route sharing.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                      AI Voice Assist
                    </span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Quick Destination
                    </span>
                    <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                      Scan QR Route
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep("instructions")}
                  className="mx-auto w-full max-w-md rounded-2xl border border-cyan-300 bg-linear-to-r from-cyan-600 to-sky-600 px-6 py-3.5 text-base font-bold text-white shadow-lg transition hover:from-cyan-500 hover:to-sky-500 md:text-lg"
                >
                  Touch to Start
                </button>

                <p className="text-center text-xs text-slate-600 md:text-sm">
                  Tap to view detailed instructions before selecting your
                  navigation mode.
                </p>
              </>
            ) : null}

            {step === "instructions" ? (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7">
                  <p className="font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                    Detailed Instructions
                  </p>

                  <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2 md:text-base">
                    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 md:p-4">
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-300 text-xs font-bold text-slate-700">
                        1
                      </span>
                      <p>Select your navigation method after this screen.</p>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 md:p-4">
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-300 text-xs font-bold text-slate-700">
                        2
                      </span>
                      <p>
                        In AI Voice mode, speak clearly in English or Tagalog.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 md:p-4">
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-300 text-xs font-bold text-slate-700">
                        3
                      </span>
                      <p>
                        In Quick Destination mode, tap a destination from the
                        list.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 md:p-4">
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-300 text-xs font-bold text-slate-700">
                        4
                      </span>
                      <p>
                        Scan the QR code to get the navigation route on another
                        device.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 md:p-4 sm:col-span-2">
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-300 text-xs font-bold text-slate-700">
                        5
                      </span>
                      <p>
                        Follow the map path and top direction instruction
                        banner.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setStep("welcome")}
                    className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("mode")}
                    className="rounded-xl border border-slate-900 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : null}

            {step === "mode" ? (
              <>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-7">
                  <p className="font-['Space_Grotesk'] text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-4xl">
                    Choose Navigation Mode
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700 md:text-base">
                    Pick the option that best fits how you want to navigate.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => onChooseEntryMode("ai")}
                    className="rounded-2xl border border-slate-300 bg-white p-5 text-left text-slate-900 transition hover:-translate-y-px hover:border-slate-400 hover:shadow-sm md:p-6"
                  >
                    <p className="text-lg font-bold md:text-xl">
                      AI Voice Command
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      Speak naturally and let AI detect your destination.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChooseEntryMode("quick")}
                    className="rounded-2xl border border-slate-300 bg-white p-5 text-left transition hover:-translate-y-px hover:border-slate-400 hover:shadow-sm md:p-6"
                  >
                    <p className="text-lg font-bold text-slate-900 md:text-xl">
                      Quick Destination
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      Tap from preset destinations for a fast route.
                    </p>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setStep("instructions")}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Back to Instructions
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
