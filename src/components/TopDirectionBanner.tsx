type TopDirectionBannerProps = {
  show: boolean;
  instruction: string;
  distanceText: string;
  heading: number;
};

export function TopDirectionBanner({
  show,
  instruction,
  distanceText,
  heading,
}: TopDirectionBannerProps) {
  if (!show) {
    return null;
  }

  return (
    <section className="pointer-events-none absolute inset-x-0 top-3 z-[920] mx-auto w-[min(94vw,760px)] overlay-enter max-md:landscape:w-[min(70vw,600px)]">
      <div className="pointer-events-auto flex items-center justify-between gap-5 rounded-2xl bg-[#1a73e8]/95 px-6 py-4 text-white shadow-2xl backdrop-blur-md">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-200">
            Next Turn
          </p>
          <p className="text-xl md:text-2xl font-bold leading-snug">
            {instruction}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl md:text-3xl font-black text-white">
            {distanceText}
          </p>
          <p className="text-sm font-bold text-blue-200">
            {Math.round(heading)}°
          </p>
        </div>
      </div>
    </section>
  );
}
