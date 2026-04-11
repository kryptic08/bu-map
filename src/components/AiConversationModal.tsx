import { Bot, Mic, MicOff, Send, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { ConversationMessage } from "../types/conversation";

type AiConversationModalProps = {
  show: boolean;
  messages: ConversationMessage[];
  isListening: boolean;
  isProcessing: boolean;
  voiceSupported: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => void;
  onToggleVoice: () => void;
};

export function AiConversationModal({
  show,
  messages,
  isListening,
  isProcessing,
  voiceSupported,
  onClose,
  onSendMessage,
  onToggleVoice,
}: AiConversationModalProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (show) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, show]);

  if (!show) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = inputRef.current;
    if (input && input.value.trim()) {
      onSendMessage(input.value.trim());
      input.value = "";
    }
  };

  return (
    <section className="pointer-events-none absolute inset-0 z-[1000] flex items-end justify-center bg-slate-950/70 p-0 sm:p-4 md:items-center">
      <div className="pointer-events-auto relative flex h-[100dvh] w-full max-w-2xl flex-col overflow-hidden rounded-none border-0 sm:border border-cyan-100/70 bg-white shadow-[0_38px_120px_-45px_rgba(15,23,42,0.95)] sm:h-[90vh] sm:rounded-3xl md:h-[600px]">
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
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/20 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-cyan-100 to-sky-100">
                <Bot className="h-8 w-8 text-cyan-600" />
              </div>
              <p className="mb-2 text-lg font-semibold text-slate-900">
                Hello! I'm your AI campus guide
              </p>
              <p className="max-w-sm text-sm text-slate-600">
                Ask me anything about navigating Bicol University campus. You
                can ask for directions, building information, or any
                campus-related questions.
              </p>
              <div className="mt-6 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Try asking:
                </p>
                <button
                  type="button"
                  onClick={() => onSendMessage("Where is the library?")}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-left text-sm text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  "Where is the library?"
                </button>
                <button
                  type="button"
                  onClick={() => onSendMessage("Take me to the gym")}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-left text-sm text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  "Take me to the gym"
                </button>
                <button
                  type="button"
                  onClick={() => onSendMessage("What buildings are available?")}
                  className="block w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-left text-sm text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  "What buildings are available?"
                </button>
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

        {/* Voice Listening Indicator */}
        {isListening && (
          <div className="border-t border-cyan-200 bg-linear-to-r from-cyan-50 to-sky-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center">
                <div className="relative flex h-6 w-6 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                  <Mic className="relative h-4 w-4 text-cyan-600" />
                </div>
              </div>
              <p className="text-sm font-medium text-cyan-900">
                Listening... speak now
              </p>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-slate-200 bg-white p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Type your question or use voice..."
              disabled={isListening || isProcessing}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-50 disabled:text-slate-400"
            />
            {voiceSupported && (
              <button
                type="button"
                onClick={onToggleVoice}
                disabled={isProcessing}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition disabled:opacity-50 ${
                  isListening
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "border border-slate-300 bg-white text-slate-700 hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-600"
                }`}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </button>
            )}
            <button
              type="submit"
              disabled={isListening || isProcessing}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500 to-sky-600 text-white transition hover:from-cyan-400 hover:to-sky-500 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
