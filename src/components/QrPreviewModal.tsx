type QrPreviewModalProps = {
  show: boolean;
  qrCodeDataUrl: string | null;
  onClose: () => void;
  onCopyShareLink: () => void;
};

export function QrPreviewModal({
  show,
  qrCodeDataUrl,
  onClose,
  onCopyShareLink,
}: QrPreviewModalProps) {
  if (!show || !qrCodeDataUrl) {
    return null;
  }

  return (
    <section className="pointer-events-none fixed inset-0 z-[1200] flex items-center justify-center bg-slate-950/55 p-4">
      <div className="pointer-events-auto w-full max-w-lg rounded-2xl border border-blue-200 bg-white/95 p-5 text-slate-900 shadow-2xl backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-[Sora] text-lg font-semibold">Scan Route QR</p>
            <p className="mt-1 text-xs text-slate-600">
              Use another device to open this exact route packet.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="mt-4 flex justify-center">
          <img
            src={qrCodeDataUrl}
            alt="Large QR code to follow this route"
            className="h-[min(72vw,420px)] w-[min(72vw,420px)] rounded-xl border border-slate-200 bg-white p-2"
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCopyShareLink}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Copy share link
          </button>
        </div>
      </div>
    </section>
  );
}
