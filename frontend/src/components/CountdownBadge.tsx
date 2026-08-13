import { useCountdown } from "../hooks/useCountdown";

const pad = (n: number) => n.toString().padStart(2, "0");

export default function CountdownBadge({ endsAt }: { endsAt?: string }) {
  const { hours, minutes, seconds, expired } = useCountdown(endsAt);
  if (!endsAt || expired) return null;

  return (
    <div className="absolute top-2 left-2 rounded-sm bg-pink px-1.5 py-0.5 font-body text-[10px] font-bold text-white">
      {pad(hours)}:{pad(minutes)}:{pad(seconds)}
    </div>
  );
}
