import { useEffect, useState } from "react";
import {
  ArrowRight,
  Compass,
  MapPinned,
  Mic,
  QrCode,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { EntryMode } from "../types/navigation";

type OnboardingStep = "welcome" | "instructions" | "mode";

type InstructionItem = {
  title: string;
  body: string;
  icon: LucideIcon;
};

const FLOW_STEPS: OnboardingStep[] = ["welcome", "instructions", "mode"];

const INSTRUCTION_ITEMS: InstructionItem[] = [
  {
    title: "Choose your style",
    body: "Pick AI Voice Navigation or Quick Destination Selection.",
    icon: Sparkles,
  },
  {
    title: "Say or tap destination",
    body: "Speak naturally or tap from the preset destination list.",
    icon: Mic,
  },
  {
    title: "Follow live directions",
    body: "Use turn-by-turn prompts and the highlighted route on the map.",
    icon: Compass,
  },
  {
    title: "Share with QR",
    body: "Generate a QR route so others can open the same navigation path.",
    icon: QrCode,
  },
];

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
  const [step, setStep] = useState<OnboardingStep>(modeOnly ? "mode" : "welcome");

  useEffect(() => {
    if (show) {
      setStep(modeOnly ? "mode" : "welcome");
    }
  }, [show, modeOnly]);

  if (!show) {
    return null;
  }

  const currentStepIndex = FLOW_STEPS.indexOf(step);

  const stepLabel = modeOnly
    ? "Quick Start"
    : `Step ${currentStepIndex + 1} of ${FLOW_STEPS.length}`;

  return (
    <section
      className="pointer-events-none absolute inset-0 z-[1000] flex items-center justify-center bg-slate-950/45 p-3 md:p-6 max-md:landscape:p-2"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation onboarding"
    >
      <div className="pointer-events-auto relative h-[88vh] w-full max-w-5xl overflow-hidden rounded-[30px] border border-white/60 bg-white/90 shadow-[0_28px_70px_-36px_rgba(15,23,42,0.6)] backdrop-blur-sm">
        <img
          src={welcomeImage}
          alt="Computer Studies Department floor map background"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(56,189,248,0.35),transparent_42%),radial-gradient(circle_at_80%_18%,rgba(34,197,94,0.25),transparent_36%),linear-gradient(150deg,rgba(248,250,252,0.95),rgba(255,255,255,0.86))]" />

        <div className="relative flex h-full flex-col overflow-y-auto p-4 md:p-8">
          <div className="mb-4 flex items-center justify-between gap-3 md:mb-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/90 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-sky-700 md:text-xs">
              <MapPinned size={14} aria-hidden="true" />
              AY MASAIN
            </span>
            <span className="rounded-full border border-slate-300 bg-white/90 px-3 py-1.5 text-[11px] font-medium text-slate-700 md:text-xs">
              {stepLabel}
            </span>
          </div>

          {!modeOnly ? (
            <div
              className="mx-auto mb-5 flex w-full max-w-md items-center justify-center gap-2"
              aria-label="Onboarding progress"
            >
              {FLOW_STEPS.map((flowStep, index) => {
                const isActive = step === flowStep;
                const isComplete = index < currentStepIndex;

                return (
                  <span
                    key={flowStep}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      isActive
                        ? "w-10 bg-slate-900"
                        : isComplete
                          ? "w-6 bg-emerald-500"
                          : "w-6 bg-slate-300"
                    }`}
                  />
                );
              })}
            </div>
          ) : null}

          <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-5 md:gap-6">
            {step === "welcome" ? (
              <div className="overlay-enter grid gap-5 rounded-3xl border border-slate-200/90 bg-white/95 p-5 shadow-[0_24px_44px_-32px_rgba(30,41,59,0.55)] md:grid-cols-[1.2fr_0.8fr] md:p-8">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                    <Sparkles size={14} aria-hidden="true" />
                    AI Campus Guide
                  </span>
                  <p className="mt-3 font-['Space_Grotesk'] text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl">
                    Welcome to AY MASAIN
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-700 md:text-lg">
                    Navigate smarter with AI-powered assistance.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
                    Find offices, classrooms, and key campus services faster
                    using voice commands or one-tap destinations.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Voice-first support
                    </span>
                    <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                      Quick destinations
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      Route sharing via QR
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep("instructions")}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-900 bg-slate-900 px-6 py-3.5 text-base font-bold text-white shadow-lg transition hover:-translate-y-px hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 md:w-auto md:text-lg"
                  >
                    Get Started
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>

                  <p className="mt-3 text-xs text-slate-500 md:text-sm">
                    Takes less than a minute to set up.
                  </p>
                </div>

                <aside className="hidden rounded-2xl border border-slate-200 bg-slate-50/90 p-4 md:flex md:flex-col md:justify-between">
                  <img
                    src={welcomeImage}
                    alt="Campus floor map preview"
                    className="h-36 w-full rounded-xl object-cover shadow-sm"
                  />
                  <div className="mt-4 space-y-3 text-sm text-slate-700">
                    <p className="flex items-center gap-2 font-semibold text-slate-900">
                      <Mic size={16} aria-hidden="true" />
                      AI voice understands natural prompts
                    </p>
                    <p className="flex items-center gap-2 font-semibold text-slate-900">
                      <Compass size={16} aria-hidden="true" />
                      Follow clear turn-by-turn guidance
                    </p>
                    <p className="flex items-center gap-2 font-semibold text-slate-900">
                      <QrCode size={16} aria-hidden="true" />
                      Share routes instantly with QR
                    </p>
                  </div>
                </aside>
              </div>
            ) : null}

            {step === "instructions" ? (
              <div className="overlay-enter rounded-3xl border border-slate-200/90 bg-white/95 p-5 shadow-[0_24px_44px_-32px_rgba(30,41,59,0.55)] md:p-8">
                <p className="font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  How it works
                </p>
                <p className="mt-2 text-sm text-slate-600 md:text-base">
                  Follow these four quick steps to start navigating.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {INSTRUCTION_ITEMS.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="step-reveal rounded-2xl border border-slate-200 bg-white p-4"
                        style={{ animationDelay: `${index * 60}ms` }}
                      >
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700">
                          <Icon size={17} aria-hidden="true" />
                        </span>
                        <p className="mt-3 text-base font-bold text-slate-900">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">
                          {item.body}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
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
              </div>
            ) : null}

            {step === "mode" ? (
              <div className="overlay-enter rounded-3xl border border-slate-200/90 bg-white/95 p-5 shadow-[0_24px_44px_-32px_rgba(30,41,59,0.55)] md:p-8">
                <p className="font-['Space_Grotesk'] text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-4xl">
                  Choose your navigation style
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 md:text-base">
                  Start with AI voice assistance or pick from quick destination
                  shortcuts.
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => onChooseEntryMode("ai")}
                    className="group rounded-2xl border border-slate-300 bg-white p-5 text-left text-slate-900 transition duration-200 hover:-translate-y-px hover:border-slate-400 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 md:p-6"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-700">
                      <Mic size={18} aria-hidden="true" />
                    </span>
                    <p className="mt-3 text-lg font-bold md:text-xl">
                      AI Voice Navigation
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      Speak naturally and let AI identify your destination.
                    </p>
                    <p className="mt-3 text-xs font-semibold tracking-wide text-sky-700">
                      Hands-free and fast
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => onChooseEntryMode("quick")}
                    className="group rounded-2xl border border-slate-300 bg-white p-5 text-left transition duration-200 hover:-translate-y-px hover:border-slate-400 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 md:p-6"
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
                      <MapPinned size={18} aria-hidden="true" />
                    </span>
                    <p className="mt-3 text-lg font-bold text-slate-900 md:text-xl">
                      Quick Destination Selection
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      Tap a preset location and generate your route instantly.
                    </p>
                    <p className="mt-3 text-xs font-semibold tracking-wide text-emerald-700">
                      Ideal for repeat routes
                    </p>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setStep("instructions")}
                  className="mt-4 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {modeOnly ? "View quick guide" : "Back to instructions"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
