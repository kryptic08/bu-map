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
    <section className="pointer-events-none absolute inset-x-0 top-3 z-[920] mx-auto w-[min(94vw,760px)] overlay-enter max-md:landscape:w-[min(60vw,500px)]">
      <div className="pointer-events-auto flex items-center justify-between gap-3 rounded-2xl bg-[#1a73e8]/95 px-4 py-2.5 text-white shadow-2xl backdrop-blur-md">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-200">
            Next Turn
          </p>
          <p className="text-sm font-semibold leading-snug">{instruction}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-white">{distanceText}</p>
          <p className="text-[10px] font-medium text-blue-200">
            {Math.round(heading)}°
          </p>
        </div>
      </div>
    </section>
  );
}
