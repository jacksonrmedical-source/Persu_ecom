interface LogoProps {
  iconClassName?: string;
  textClassName?: string;
  showTagline?: boolean;
  iconOnly?: boolean;
}

/**
 * Real PERZN icon mark (provided brand artwork: white P + gold Z,
 * transparent background). Set iconOnly to render just the mark with no
 * text wordmark — used in the header per the Walmart-style layout, where
 * the icon alone carries the brand.
 */
export default function Logo({
  iconClassName = "h-14 w-auto",
  textClassName = "text-2xl",
  showTagline = false,
  iconOnly = false,
}: LogoProps) {
  if (iconOnly) {
    return <img src="/logo-mark.png" alt="PERZN" className={iconClassName} />;
  }

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
