type StatusToastProps = {
  message: string | null;
};

export function StatusToast({ message }: StatusToastProps) {
  if (!message) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 z-[1200] w-[90%] md:w-auto max-w-sm rounded-lg border border-amber-300/40 bg-amber-100/95 px-4 py-3 text-sm font-semibold text-amber-900 shadow-lg text-center backdrop-blur-sm">
      {message}
    </div>
  );
}
