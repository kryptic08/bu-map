import {
  List,
  Mic,
  MicOff,
  Map as MapIcon,
  Target,
  NavigationOff,
} from "lucide-react";
import type { EntryMode, Point } from "../types/navigation";

type FloatingActionButtonsProps = {
  activeEntryMode: EntryMode;
  isVoiceListening: boolean;
  voiceRecognitionSupported: boolean;
  startPoint: Point;
  onOpenDestinationListModal: () => void;
  onToggleVoiceCommand: () => void;
  onChangeMode: () => void;
  onRecenter: (point: Point) => void;
  onClearRoute: () => void;
};

export function FloatingActionButtons({
  activeEntryMode,
  isVoiceListening,
  voiceRecognitionSupported,
  startPoint,
  hasDestination,
  isPreviewCardCollapsed,
  onOpenDestinationListModal,
  onToggleVoiceCommand,
  onChangeMode,
  onRecenter,
  onClearRoute,
}: FloatingActionButtonsProps & {
  hasDestination?: boolean;
  isPreviewCardCollapsed?: boolean;
}) {
  return (
    <aside
      className={`pointer-events-none absolute right-4 z-[900] md:w-auto md:bottom-6 md:top-auto md:right-auto md:left-4 max-md:landscape:w-auto max-md:landscape:bottom-auto max-md:landscape:top-4 max-md:landscape:left-auto max-md:landscape:right-4 transition-all duration-300 ${
        hasDestination
          ? isPreviewCardCollapsed
            ? "bottom-24 md:bottom-6"
            : "bottom-[24rem] md:bottom-6"
          : "bottom-24 md:bottom-6"
      }`}
    >
      <div className="flex flex-col items-end gap-3 pointer-events-auto md:flex-row md:items-center max-md:landscape:flex max-md:landscape:flex-row max-md:landscape:items-center">
        {activeEntryMode === "quick" ? (
          <button
            type="button"
            onClick={() => {
              onOpenDestinationListModal();
            }}
            className="flex items-center justify-center md:justify-start h-12 w-12 md:px-4 md:w-auto rounded-full border border-blue-300 bg-blue-600 font-semibold text-white shadow-lg transition hover:bg-blue-500"
            aria-label="Destination list"
          >
            <List size={20} className="md:mr-2 shrink-0 md:size-[22px]" />
            <span className="hidden md:inline text-base">Destinations</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleVoiceCommand}
            disabled={!voiceRecognitionSupported}
            className="flex items-center justify-center md:justify-start h-12 w-12 md:px-4 md:w-auto rounded-full border border-cyan-300 bg-cyan-600 font-semibold text-white shadow-lg transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={isVoiceListening ? "Stop voice" : "Start voice"}
          >
            {isVoiceListening ? (
              <MicOff size={20} className="md:mr-2 shrink-0 md:size-[22px]" />
            ) : (
              <Mic size={20} className="md:mr-2 shrink-0 md:size-[22px]" />
            )}
            <span className="hidden md:inline text-base">
              {isVoiceListening ? "Stop voice" : "Voice"}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            onChangeMode();
          }}
          className="flex items-center justify-center md:justify-start h-12 w-12 md:px-4 md:w-auto rounded-full border border-slate-300 bg-white font-semibold text-slate-800 shadow-lg transition hover:bg-slate-100"
          aria-label="Change mode"
        >
          <MapIcon size={20} className="md:mr-2 shrink-0 md:size-[22px]" />
          <span className="hidden md:inline text-base">Change mode</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onRecenter(startPoint);
          }}
          className="flex items-center justify-center md:justify-start h-12 w-12 md:px-4 md:w-auto rounded-full border border-slate-300 bg-white font-semibold text-slate-800 shadow-lg transition hover:bg-slate-100"
          aria-label="Recenter"
        >
          <Target size={20} className="md:mr-2 shrink-0 md:size-[22px]" />
          <span className="hidden md:inline text-base">Recenter</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClearRoute();
          }}
          className="flex items-center justify-center md:justify-start h-12 w-12 md:px-4 md:w-auto rounded-full border border-red-300 bg-white font-semibold text-red-600 shadow-lg transition hover:bg-red-50"
          aria-label="Clear route"
        >
          <NavigationOff
            size={20}
            className="md:mr-2 shrink-0 text-red-500 md:size-[22px]"
          />
          <span className="hidden md:inline text-red-600">Clear route</span>
        </button>
      </div>
    </aside>
  );
}
