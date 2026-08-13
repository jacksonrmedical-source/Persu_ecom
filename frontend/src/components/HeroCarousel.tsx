import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

interface Slide {
  image: string;
  title: string;
  cta: string;
  href: string;
}

const SLIDES: Slide[] = [
  {
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=420&fit=crop",
    title: "🔥 Flash Sale — Up to 80% Off",
    cta: "Shop Now",
    href: "/collection/flash-deals",
  },
  {
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=420&fit=crop",
    title: "New Season Dresses",
    cta: "Explore Dresses",
    href: "/category/dresses",
  },
  {
    image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=1200&h=420&fit=crop",
    title: "Step Into Style",
    cta: "Shop Shoes",
    href: "/category/shoes",
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const go = (next: number) => {
    setIndex((next + SLIDES.length) % SLIDES.length);
    // restart the autoplay clock so a manual click doesn't fight the timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 5000);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 50) go(index - 1);
    else if (delta < -50) go(index + 1);
    touchStartX.current = null;
  };

  return (
    <div
      className="relative overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {SLIDES.map((slide, i) => (
          <Link
            key={i}
            to={slide.href}
            className="relative block h-[220px] w-full shrink-0 sm:h-[340px] md:h-[420px]"
          >
            <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
            <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10">
              <h2 className="mb-3 max-w-md font-display text-2xl font-bold text-white sm:text-4xl">
                {slide.title}
              </h2>
              <span className="btn-gradient inline-block rounded-full px-5 py-2 font-body text-sm font-bold text-white">
                {slide.cta}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <button
        onClick={() => go(index - 1)}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-ink hover:bg-white"
      >
        ‹
      </button>
      <button
        onClick={() => go(index + 1)}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-ink hover:bg-white"
      >
        ›
      </button>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
