interface LogoProps {
  iconClassName?: string;
  textClassName?: string;
  showTagline?: boolean;
}

/**
 * Real PERZN icon mark (provided brand artwork: white P + gold Z,
 * transparent background) paired with a plain white text wordmark —
 * per request, not the full pre-rendered wordmark image.
 */
export default function Logo({
  iconClassName = "h-14 w-auto",
  textClassName = "text-2xl",
  showTagline = false,
}: LogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      <img src="/logo-mark.png" alt="" className={iconClassName} />
      <div className="leading-tight">
        <span className={`font-body font-medium tracking-[0.25em] text-white ${textClassName}`}>
          PER<span className="text-gold">Z</span>N
        </span>
        {showTagline && (
          <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/75">
            Wear Your Version
          </p>
        )}
      </div>
    </div>
  );
}
