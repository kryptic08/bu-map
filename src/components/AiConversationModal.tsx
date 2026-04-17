import { Bot, Mic, X, QrCode } from "lucide-react";
import { useEffect, useRef } from "react";
import type {
  ConversationMessage,
  ConversationMessageAction,
} from "../types/conversation";

type AiConversationModalProps = {
  show: boolean;
  messages: ConversationMessage[];
  isListening: boolean;
  isProcessing: boolean;
  voiceSupported: boolean;
  onClose: () => void;
  onStartVoice: () => void;
  onOpenQrCode?: () => void;
  onViewFloorPlan?: (action: ConversationMessageAction) => void;
};

export function AiConversationModal({
  show,
  messages,
  isListening,
  isProcessing,
  voiceSupported,
  onClose,
  onStartVoice,
  onOpenQrCode,
  onViewFloorPlan,
}: AiConversationModalProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);

  // Auto-start voice recognition when modal opens
  useEffect(() => {
    if (show && voiceSupported && !hasStartedRef.current) {
      hasStartedRef.current = true;
      // Start after a short delay to allow modal to render
      setTimeout(() => {
        onStartVoice();
      }, 800);
    } else if (!show) {
      hasStartedRef.current = false;
    }
  }, [show, voiceSupported, onStartVoice]);

  // Auto-restart voice after AI responds
  useEffect(() => {
    if (show && !isListening && !isProcessing && messages.length > 0 && voiceSupported) {
      // Restart listening after AI responds
      const timer = setTimeout(() => {
        onStartVoice();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [show, isListening, isProcessing, messages.length, voiceSupported, onStartVoice]);

  useEffect(() => {
    if (show) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, show]);

  if (!show) {
    return null;
  }

  return (
    <section className="pointer-events-auto absolute right-0 top-0 bottom-0 z-900 w-full max-w-md flex flex-col overflow-hidden border-l border-slate-300/30 bg-white/95 shadow-[0_38px_120px_-45px_rgba(15,23,42,0.95)] backdrop-blur-md">
      <div className="relative flex h-full w-full flex-col overflow-hidden">
        {/* Header */}
        <div className="relative border-b border-slate-200 bg-linear-to-r from-cyan-500 to-sky-600 px-5 py-4">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_50%)]" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">AI Assistant</p>
                <p className="text-xs text-cyan-50">
                  {isListening
                    ? "Listening..."
                    : isProcessing
                      ? "Thinking..."
                      : "Ready to help"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onOpenQrCode && (
                <button
                  type="button"
                  onClick={onOpenQrCode}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/20 hover:text-white"
                  title="Open QR Code"
                >
                  <QrCode className="h-5 w-5" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/20 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-cyan-100 to-sky-100">
                <Mic className="h-8 w-8 text-cyan-600" />
              </div>
              <p className="mb-2 text-lg font-semibold text-slate-900">
                Voice-Powered AI Campus Guide
              </p>
              <p className="max-w-sm text-sm text-slate-600">
                Speak naturally to ask about navigating Bicol University campus,
                building locations, offices, or any campus-related questions.
                The AI is listening automatically.
              </p>
              <div className="mt-6 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Try saying:
                </p>
                <div className="space-y-2 text-sm text-slate-600">
                  <p className="rounded-lg border border-slate-200 bg-white px-4 py-2">
                    "Where is the library?"
                  </p>
                  <p className="rounded-lg border border-slate-200 bg-white px-4 py-2">
                    "Take me to the Computer Lab"
                  </p>
                  <p className="rounded-lg border border-slate-200 bg-white px-4 py-2">
                    "What buildings are available?"
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-linear-to-br from-cyan-500 to-sky-600 text-white"
                        : "border border-slate-200 bg-white text-slate-900"
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </p>
                    {message.role === "assistant" &&
                    message.action?.type === "view-floor-plan" &&
                    onViewFloorPlan ? (
                      <button
                        type="button"
                        onClick={() => onViewFloorPlan(message.action!)}
                        className="mt-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        {message.action.label}
                      </button>
                    ) : null}
                    <p
                      className={`mt-1 text-[10px] ${message.role === "user" ? "text-cyan-100" : "text-slate-400"}`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-500 [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-500 [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-500"></span>
                      </div>
                      <span className="text-xs text-slate-500">
                        AI is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Voice Status Indicator */}
        <div className="border-t border-slate-200 bg-white p-4">
          <div className="flex items-center justify-center gap-3 rounded-xl bg-linear-to-br from-cyan-50 to-sky-50 p-4">
            <div className="relative flex h-10 w-10 items-center justify-center">
              {isListening ? (
                <>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                  <Mic className="relative h-6 w-6 text-cyan-600" />
                </>
              ) : isProcessing ? (
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-500 [animation-delay:-0.3s]"></span>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-500 [animation-delay:-0.15s]"></span>
                  <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-500"></span>
                </div>
              ) : (
                <Mic className="h-6 w-6 text-slate-400" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-900">
                {isListening
                  ? "Listening..."
                  : isProcessing
                    ? "AI is thinking..."
                    : "Ready to assist"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
