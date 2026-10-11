import { useMemo } from 'react';
import './MovieReelGallery.css';

/* ─────────────────────────────────────────────────────────────────
   FALLBACK IMAGES
   High-quality cinematic Unsplash images used when the backend
   hasn't returned enough posters yet, or when a poster fails to load.
   These are sized as movie-poster aspect ratios (2:3).
───────────────────────────────────────────────────────────────── */
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1621155346337-1d19476ba7d6?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1553484771-371a605b060b?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560109947-543149eceb16?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1554469384-e58fac937c9b?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1612686635542-2244ed9f8ddc?w=400&h=600&fit=crop&q=80',
];

/* Reel row config: rotation (deg), animation direction, duration */
const ROW_CONFIG = [
  { rotate: -4,  direction: 'left',  duration: 38, delay: 0   },
  { rotate:  3,  direction: 'right', duration: 44, delay: -8  },
  { rotate: -3,  direction: 'left',  duration: 36, delay: -4  },
  { rotate:  4,  direction: 'right', duration: 42, delay: -12 },
];

/* How many cards per row (we duplicate for seamless loop) */
const CARDS_PER_ROW = 8;

/* ─────────────────────────────────────────────────────────────────
   REEL ROW
   One animated horizontal strip of poster cards.
───────────────────────────────────────────────────────────────── */
function ReelRow({ images, rotate, direction, duration, delay }) {
  // Duplicate cards so the loop scrolls seamlessly
  const loopedImages = [...images, ...images];

  const handleImgError = (e) => {
    const idx = Math.floor(Math.random() * FALLBACK_IMAGES.length);
    if (e.target.src !== FALLBACK_IMAGES[idx]) {
      e.target.src = FALLBACK_IMAGES[idx];
    }
  };

  return (
    <div
      className="reel-row"
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden="true"
    >
      <div
        className={`reel-track reel-track--${direction}`}
        style={{
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
        }}
      >
        {loopedImages.map((src, i) => (
          <div key={i} className="reel-card">
            <img
              src={src}
              alt=""
              className="reel-card-img"
              loading="lazy"
              decoding="async"
              onError={handleImgError}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MOVIE REEL GALLERY
   Props:
     movies  – array of movie objects from the existing API response.
               Must have `posterUrl` and `_id`. Optional: may be empty.
───────────────────────────────────────────────────────────────── */
function MovieReelGallery({ movies = [] }) {
  /* Build one pool of image URLs from real posters + fallbacks */
  const imagePool = useMemo(() => {
    const posterUrls = movies
      .map((m) => m?.posterUrl)
      .filter(Boolean);

    const combined = [...posterUrls, ...FALLBACK_IMAGES];
    return [...new Set(combined)];
  }, [movies]);

  /* Slice the pool into per-row arrays, wrapping around if needed */
  const rowImages = useMemo(() => {
    return ROW_CONFIG.map((_, rowIdx) => {
      const start = (rowIdx * CARDS_PER_ROW) % imagePool.length;
      const slice = [];
      for (let i = 0; i < CARDS_PER_ROW; i++) {
        slice.push(imagePool[(start + i) % imagePool.length]);
      }
      return slice;
    });
  }, [imagePool]);

  return (
    <div className="reel-gallery" aria-hidden="true">
      {/* Perspective container for 3-D tilt effect */}
      <div className="reel-perspective">
        {ROW_CONFIG.map((cfg, i) => (
          <ReelRow
            key={i}
            images={rowImages[i]}
            rotate={cfg.rotate}
            direction={cfg.direction}
            duration={cfg.duration}
            delay={cfg.delay}
          />
        ))}
      </div>

      {/* Gradient overlays to blend into the dark theme */}
      <div className="reel-edge reel-edge--top"    />
      <div className="reel-edge reel-edge--bottom" />
      <div className="reel-edge reel-edge--left"   />
      <div className="reel-edge reel-edge--right"  />
    </div>
  );
}

export default MovieReelGallery;
