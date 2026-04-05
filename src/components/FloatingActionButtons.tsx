import { useState } from "react";
import {
  Wrench,
  X,
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
  onOpenDestinationListModal,
  onToggleVoiceCommand,
  onChangeMode,
  onRecenter,
  onClearRoute,
}: FloatingActionButtonsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className="pointer-events-none absolute right-4 bottom-[calc(max(15vh,120px)+1rem)] z-[900] flex flex-col items-end gap-3 transition-transform duration-300 md:items-start md:bottom-6 md:right-auto md:left-4 max-md:landscape:bottom-auto max-md:landscape:top-4 max-md:landscape:right-4 max-md:landscape:left-auto">
      {/* Expandable menu */}
      <div
        className={`flex flex-col items-end md:items-start gap-3 transition-all duration-300 origin-bottom max-md:landscape:origin-top ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-8 pointer-events-none"
        }`}
      >
        {activeEntryMode === "quick" ? (
          <button
            type="button"
            onClick={() => {
              onOpenDestinationListModal();
              setIsOpen(false);
            }}
            className="pointer-events-auto flex items-center justify-center h-12 w-12 md:w-auto md:px-4 rounded-full border border-blue-300 bg-blue-600 font-semibold text-white shadow-lg transition hover:bg-blue-500"
            aria-label="Destination list"
          >
            <List size={20} className="md:mr-2" />
            <span className="hidden md:inline text-sm">Destination list</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleVoiceCommand}
            disabled={!voiceRecognitionSupported}
            className="pointer-events-auto flex items-center justify-center h-12 w-12 md:w-auto md:px-4 rounded-full border border-cyan-300 bg-cyan-600 font-semibold text-white shadow-lg transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label={isVoiceListening ? "Stop voice" : "Start voice"}
          >
            {isVoiceListening ? (
              <MicOff size={20} className="md:mr-2" />
            ) : (
              <Mic size={20} className="md:mr-2" />
            )}
            <span className="hidden md:inline text-sm">
              {isVoiceListening ? "Stop voice" : "Start voice"}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            onChangeMode();
            setIsOpen(false);
          }}
          className="pointer-events-auto flex items-center justify-center h-12 w-12 md:w-auto md:px-4 rounded-full border border-slate-300 bg-white font-semibold text-slate-800 shadow-lg transition hover:bg-slate-100"
          aria-label="Change mode"
        >
          <MapIcon size={20} className="md:mr-2" />
          <span className="hidden md:inline text-sm">Change mode</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onRecenter(startPoint);
            setIsOpen(false);
          }}
          className="pointer-events-auto flex items-center justify-center h-12 w-12 md:w-auto md:px-4 rounded-full border border-slate-300 bg-white font-semibold text-slate-800 shadow-lg transition hover:bg-slate-100"
          aria-label="Recenter"
        >
          <Target size={20} className="md:mr-2" />
          <span className="hidden md:inline text-sm">Recenter</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClearRoute();
            setIsOpen(false);
          }}
          className="pointer-events-auto flex items-center justify-center h-12 w-12 md:w-auto md:px-4 rounded-full border border-red-300 bg-white font-semibold text-red-600 shadow-lg transition hover:bg-red-50"
          aria-label="Clear route"
        >
          <NavigationOff size={20} className="md:mr-2 text-red-500" />
          <span className="hidden md:inline text-sm text-red-600">
            Clear route
          </span>
        </button>
      </div>

      {/* Main FAB Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto flex items-center justify-center h-14 w-14 rounded-full shadow-2xl transition-all duration-300 md:ml-0 max-md:landscape:ml-auto ${
          isOpen
            ? "bg-slate-800 text-white rotate-45"
            : "bg-blue-600 text-white"
        }`}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={28} /> : <Wrench size={24} />}
      </button>
    </aside>
  );
}
