interface LootMeterProps {
  stockRatio: number; // 0 (sold out) to 1 (full stock)
}

/**
 * The "loot meter" — PERZN's signature scarcity gauge.
 * A fuel-gauge needle instead of a plain "3 left" label, because
 * urgency reads faster as a shape than as text.
 */
export default function LootMeter({ stockRatio }: LootMeterProps) {
  const clamped = Math.max(0, Math.min(1, stockRatio));
  // needle sweeps from -90deg (empty) to +90deg (full)
  const angle = -90 + clamped * 180;

  const zoneColor =
    clamped < 0.15 ? "#FF4D6D" : clamped < 0.4 ? "#FFB020" : "#C6FF3D";

  const label =
    clamped < 0.15 ? "Almost gone" : clamped < 0.4 ? "Going fast" : "In stock";

  return (
    <div className="flex items-center gap-1.5" aria-label={`Stock level: ${label}`}>
      <svg width="28" height="16" viewBox="0 0 28 16" className="shrink-0">
        <path
          d="M 2 15 A 12 12 0 0 1 26 15"
          fill="none"
          stroke="#131A2B1A"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M 2 15 A 12 12 0 0 1 26 15"
          fill="none"
          stroke={zoneColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${clamped * 37.7} 37.7`}
        />
        <g transform={`rotate(${angle} 14 15)`}>
          <line x1="14" y1="15" x2="14" y2="5" stroke="#131A2B" strokeWidth="1.5" strokeLinecap="round" />
        </g>
        <circle cx="14" cy="15" r="1.5" fill="#131A2B" />
      </svg>
      <span className="font-mono text-[10px] font-medium tracking-tight" style={{ color: zoneColor === "#C6FF3D" ? "#4d7a00" : zoneColor }}>
        {label}
      </span>
    </div>
  );
}
