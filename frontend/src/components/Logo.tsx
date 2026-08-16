interface LogoProps {
  iconClassName?: string;
  textClassName?: string;
  showTagline?: boolean;
  iconOnly?: boolean;
  textOnly?: boolean;
}

/**
 * Real PERZN icon mark (provided brand artwork: white P + gold Z,
 * transparent background). iconOnly renders just the mark, textOnly
 * renders just the wordmark (used in the header now), default renders both.
 */
export default function Logo({
  iconClassName = "h-14 w-auto",
  textClassName = "text-2xl",
  showTagline = false,
  iconOnly = false,
  textOnly = false,
}: LogoProps) {
  if (iconOnly) {
    return <img src="/logo-mark.png" alt="PERZN" className={iconClassName} />;
  }

  const wordmark = (
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
  );

  if (textOnly) return wordmark;

  return (
    <div className="flex items-center gap-2.5">
      <img src="/logo-mark.png" alt="" className={iconClassName} />
      {wordmark}
    </div>
  );
}
