import { Bot, Mic, QrCode, SendHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
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
  onToggleVoice: () => void;
  onSendMessage: (message: string) => void | Promise<void>;
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
  onToggleVoice,
  onSendMessage,
  onOpenQrCode,
  onViewFloorPlan,
}: AiConversationModalProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");

  const onSubmitMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = inputValue.trim();
    if (!trimmed || isProcessing) {
      return;
    }

    await onSendMessage(trimmed);
    setInputValue("");
  };

  useEffect(() => {
    if (show) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, show]);

  if (!show) {
    return null;
  }

  return (
    <section className="pointer-events-auto absolute z-999 flex flex-col overflow-hidden bg-slate-50 shadow-2xl transition-all duration-300 md:right-4 md:top-4 md:bottom-4 md:w-[600px] md:h-[calc(100vh-2rem)] md:rounded-3xl md:border md:border-slate-200 max-md:inset-0 max-md:h-[100dvh] max-md:w-full max-md:rounded-none">
      {/* Header */}
      <header className="shrink-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 shadow-md">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight text-slate-800">
              AI Assistant
            </h2>
            <p className="text-xs font-semibold text-slate-500">
              {isListening ? (
                <span className="animate-pulse text-sky-500">Listening...</span>
              ) : isProcessing ? (
                <span className="animate-pulse text-cyan-500">Thinking...</span>
              ) : (
                "Online"
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onOpenQrCode && (
            <button
              type="button"
              onClick={onOpenQrCode}
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              title="Open QR Code"
            >
              <QrCode className="h-5 w-5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            title="Close AI Assistant"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-2 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100/70 shadow-inner">
              <Bot className="h-10 w-10 text-cyan-600" />
            </div>
            <h3 className="mb-2 text-xl font-extrabold text-slate-800">
              Campus Guide
            </h3>
            <p className="mb-8 text-sm leading-relaxed text-slate-500">
              Type your destination or question to get navigation help around
              Bicol University.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`relative max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                    message.role === "user"
                      ? "rounded-tr-sm bg-gradient-to-br from-cyan-500 to-sky-600 text-white"
                      : "rounded-tl-sm border border-slate-200 bg-white text-slate-800"
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
                      className="mt-3 flex w-full items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-700 transition hover:bg-cyan-100 hover:text-cyan-800"
                    >
                      {message.action.label}
                    </button>
                  ) : null}
                  <p
                    className={`mt-1.5 text-[10px] font-medium ${message.role === "user" ? "text-cyan-100" : "text-slate-400"}`}
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
                <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-5 py-4 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-500 [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-500 [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-500"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Footer */}
      <div className="shrink-0 rounded-t-3xl border-t border-slate-200 bg-white p-6 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] z-10 transition-all">
        <form onSubmit={onSubmitMessage} className="flex items-center gap-2">
          <label htmlFor="ai-chat-input" className="sr-only">
            Type a message for AI assistant
          </label>
          <input
            id="ai-chat-input"
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Type your destination or question..."
            disabled={isProcessing}
            className="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isProcessing || inputValue.trim().length === 0}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-sm transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            aria-label="Send message"
            title="Send message"
          >
            <SendHorizontal className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onToggleVoice}
            disabled={!voiceSupported || isProcessing}
            className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm transition ${
              !voiceSupported
                ? "cursor-not-allowed bg-slate-300 text-slate-500"
                : isProcessing
                  ? "cursor-not-allowed bg-cyan-300"
                  : isListening
                    ? "bg-sky-500 hover:bg-sky-600"
                    : "bg-emerald-600 hover:bg-emerald-700"
            }`}
            aria-label={isListening ? "Stop listening" : "Start listening"}
            title={isListening ? "Stop listening" : "Tap to Speak"}
          >
            <Mic className={`h-5 w-5 ${isListening ? "animate-pulse" : ""}`} />
          </button>
        </form>
      </div>
    </section>
  );
}
