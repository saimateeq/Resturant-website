import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import { FiChevronDown, FiChevronsDown } from 'react-icons/fi';
import { useFrameSequence } from '@hooks/useFrameSequence';
import { useMediaQuery } from '@hooks/useMediaQuery';
import heroMobileVideo from '../../assets/videos/hero-mobile.mp4';

const clamp01 = (n) => Math.min(1, Math.max(0, n));

// Short captions that walk through the build alongside the frames, one per
// scene. The first is on screen at scroll 0 — before any scrolling happens —
// and each crossfades into the next as the animation progresses.
const CAPTIONS = [
  { title: 'Crafted to order', subtitle: 'Every burger, built fresh — just for you.' },
  { title: 'Toasted just right', subtitle: 'Golden brioche, baked this morning.' },
  { title: 'Flame-grilled', subtitle: 'Never frozen. Seared to order.' },
  { title: 'Farm fresh', subtitle: 'Crisp lettuce, ripe tomato, signature sauce.' },
  { title: 'Stacked with care', subtitle: 'Every layer, every time.' },
];
const CAPTION_END = 0.72;
const CAPTION_FADE = 0.035;

function captionOpacityAt(value, index) {
  const segLen = CAPTION_END / CAPTIONS.length;
  const start = index * segLen;
  const end = start + segLen;
  let o = 1;
  if (index > 0) o = Math.min(o, clamp01((value - start) / CAPTION_FADE));
  o = Math.min(o, clamp01((end - value) / CAPTION_FADE));
  return o;
}

// Vite-native way to pull in the whole optimized frame set at build time.
// Sorted numerically since the source sequence has a couple of missing
// numbers (frame_206, frame_209) and glob keys aren't guaranteed in order.
const frameModules = import.meta.glob('../../assets/animation-optimized/frame_*.webp', {
  eager: true,
  import: 'default',
});
const FRAME_URLS = Object.keys(frameModules)
  .sort((a, b) => Number(a.match(/(\d+)(?=\.webp$)/)[1]) - Number(b.match(/(\d+)(?=\.webp$)/)[1]))
  .map((key) => frameModules[key]);
const LAST_FRAME = FRAME_URLS[FRAME_URLS.length - 1];

// Scroll-progress bands within the tall wrapper below. The first band plays
// the 210-frame build-and-reveal; the rest holds the finished shot and
// brings the page content in over it before the section releases.
const ANIMATION_END = 0.75;
const CONTENT_START = 0.8;
const CONTENT_DONE = 0.92;

// Exact position of the video generator's watermark, measured directly from
// the source frames (bounding box of the low-saturation bright pixels in the
// bottom-right quadrant) — as a fraction of the native 1280x720 frame, so the
// cover button can be placed precisely regardless of viewport crop.
const WATERMARK_X_FRAC = 0.9059;
const WATERMARK_Y_FRAC = 0.8333;

// The sequence's own dark tones are a warm olive-green, not the site's
// cooler near-black theme color — measured by averaging pixels along the
// frame edges/corners across several frames. Used for anything that needs to
// blend into the footage itself (letterbox bars, the watermark cover patch)
// rather than read as a distinct chrome color.
const FOOTAGE_VOID = '#1c2620';

const SOURCE_W = 1280;
const SOURCE_H = 720;
const SOURCE_ASPECT = SOURCE_W / SOURCE_H;
// A pure "cover" fit on a narrow phone (~0.46:1) only shows ~26% of the
// frame's width — the sides get cropped away almost entirely. This floor
// caps how far that zoom can go: once a plain cover crop would show less
// than this fraction of the width, we back off the zoom instead and accept
// soft letterbox bars top/bottom (they're the same dark tone as the scene,
// so they read as background rather than an obvious gap).
const MIN_VISIBLE_WIDTH_FRACTION = 0.42;

function computeFrameTransform(cw, ch) {
  const targetAspect = cw / ch;
  let scale;
  if (targetAspect < SOURCE_ASPECT) {
    const coverScale = ch / SOURCE_H;
    const visibleFraction = targetAspect / SOURCE_ASPECT;
    scale =
      visibleFraction < MIN_VISIBLE_WIDTH_FRACTION
        ? cw / (SOURCE_W * MIN_VISIBLE_WIDTH_FRACTION)
        : coverScale;
  } else {
    scale = Math.max(cw / SOURCE_W, ch / SOURCE_H);
  }
  const dw = SOURCE_W * scale;
  const dh = SOURCE_H * scale;
  return { scale, dw, dh, dx: (cw - dw) / 2, dy: (ch - dh) / 2 };
}

// Shared shell for both non-scrubbing variants below: a single full-bleed
// background (image or video) with the same static content overlay used by
// the scroll-driven hero's end state, just always visible instead of
// revealed on scroll.
function StaticHero({ children }) {
  return (
    <section className="relative flex h-[100svh] min-h-[700px] w-full items-end overflow-hidden bg-ink">
      {children}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-black/30" />
      <HeroContent className="relative pb-20" />
    </section>
  );
}

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();
  // Below tablet width: skip the scroll-scrubbed canvas entirely. Its cover
  // fit has to back off from a true edge-to-edge crop on narrow screens
  // (letterboxing top/bottom) to avoid losing too much of the frame's width,
  // and per-frame canvas redraws on scroll are heavier on mobile hardware. A
  // real looping video crops to fill with no letterbox and just plays.
  const isMobile = useMediaQuery('(max-width: 767px)');

  if (prefersReducedMotion) {
    return (
      <StaticHero>
        <img
          src={LAST_FRAME}
          alt="Savoria signature dish, plated"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </StaticHero>
    );
  }

  if (isMobile) {
    return (
      <StaticHero>
        <video
          src={heroMobileVideo}
          poster={LAST_FRAME}
          autoPlay
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </StaticHero>
    );
  }

  return <ScrubbedHero />;
}

function ScrubbedHero() {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const frameIndexRef = useRef(0);
  const promptRef = useRef(null);
  const scrimRef = useRef(null);
  const contentRef = useRef(null);
  const captionRefs = useRef([]);
  const skipRef = useRef(null);
  const watermarkCoverRef = useRef(null);

  const { getNearestLoadedFrame, progress, isHeadReady } = useFrameSequence(FRAME_URLS);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  });

  // Cross-fades between the two frames straddling the current scroll position
  // instead of snapping to the nearest whole frame. 210 stills spread across
  // a 10-second build is sparse enough that hard-cutting between them reads
  // as a slideshow; blending on the fractional part makes it read as motion.
  const drawFrame = (floatIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // alpha:false lets the browser skip per-pixel alpha compositing on what's
    // often a near-full-viewport canvas — the void color is painted below
    // instead of relying on transparency + the wrapper's background showing
    // through, which was the only thing alpha blending bought here.
    if (!ctxRef.current) ctxRef.current = canvas.getContext('2d', { alpha: false });
    const ctx = ctxRef.current;
    // Resizing the canvas resets context state, so this gets reapplied on
    // every draw rather than once — the cost is negligible. 'medium' (not
    // 'high') because the source frames are only 1280x720 to begin with —
    // max-quality resampling onto a much larger canvas buys no real
    // sharpness back but costs noticeably more per draw.
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'medium';
    const cw = canvas.width;
    const ch = canvas.height;
    const { dw, dh, dx, dy } = computeFrameTransform(cw, ch);

    const lowIndex = Math.floor(floatIndex);
    const highIndex = Math.min(lowIndex + 1, FRAME_URLS.length - 1);
    const blend = floatIndex - lowIndex;

    const lowImg = getNearestLoadedFrame(lowIndex);
    if (!lowImg) return;
    const highImg = blend > 0.01 && highIndex !== lowIndex ? getNearestLoadedFrame(highIndex) : null;

    const drawCover = (img, alpha) => {
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, dx, dy, dw, dh);
    };

    ctx.fillStyle = FOOTAGE_VOID;
    ctx.fillRect(0, 0, cw, ch);
    drawCover(lowImg, 1);
    if (highImg && highImg !== lowImg) {
      drawCover(highImg, blend);
    }
    ctx.globalAlpha = 1;
  };

  // Driven imperatively (refs, not motion.div style bindings) so it stays in
  // lockstep with the canvas draw on every scroll tick, no re-render involved.
  const applyOverlayStyles = (value) => {
    if (promptRef.current) {
      promptRef.current.style.opacity = String(1 - clamp01(value / 0.03));
    }
    const contentT = clamp01((value - CONTENT_START) / (CONTENT_DONE - CONTENT_START));
    if (scrimRef.current) {
      scrimRef.current.style.opacity = String(contentT * 0.86);
    }
    if (contentRef.current) {
      contentRef.current.style.opacity = String(contentT);
      contentRef.current.style.transform = `translateY(${(1 - contentT) * 24}px)`;
      // Keep the CTAs out of tab order and unclickable until they're actually
      // visible, so a keyboard user never lands on an invisible "Order Now".
      contentRef.current.style.pointerEvents = contentT > 0.05 ? 'auto' : 'none';
      contentRef.current.inert = contentT <= 0.05;
    }
    captionRefs.current.forEach((el, i) => {
      if (!el) return;
      const o = captionOpacityAt(value, i);
      el.style.opacity = String(o);
      el.style.transform = `translateY(${(1 - o) * 12}px)`;
    });
    if (skipRef.current) {
      const skipOpacity = 1 - contentT;
      skipRef.current.style.opacity = String(skipOpacity);
      skipRef.current.style.pointerEvents = skipOpacity > 0.1 ? 'auto' : 'none';
    }
  };

  const handleSkip = () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const top = wrapper.offsetTop + CONTENT_DONE * (wrapper.offsetHeight - window.innerHeight);
    window.scrollTo({ top, behavior: 'smooth' });
  };

  // Recomputes where the watermark actually lands on screen using the same
  // cover-fit math as drawFrame, so the cover tracks it exactly instead of
  // guessing a fixed corner offset that drifts on wide/uncropped screens.
  // The watermark itself is drawn at native-frame scale, so as viewport crop
  // eases off (bigger, closer-to-16:9 screens) it renders proportionally
  // larger on screen too — the cover has to grow with that same `scale`
  // factor rather than staying a fixed pixel size, or big screens would show
  // an edge of it peeking past a fixed-size patch.
  //
  // Note: this is frame-content space, not viewport space — on a narrow/tall
  // crop (phones, tablets) the watermark's native position falls well outside
  // the visible center crop (dx/dy go negative), so `x`/`y` can land far
  // beyond the viewport edges. That's fine for the cover patch (the watermark
  // itself is equally out of view, nothing to hide), but the skip button must
  // NOT share this placement — it needs to stay on-screen regardless of crop,
  // so it's positioned independently via CSS instead.
  const positionWatermarkCover = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    const { scale, dw, dh, dx, dy } = computeFrameTransform(cw, ch);
    const x = dx + WATERMARK_X_FRAC * dw;
    const y = dy + WATERMARK_Y_FRAC * dh;

    if (watermarkCoverRef.current) {
      // Measured watermark half-extent is ~23px native; 70px native-equivalent
      // diameter before scaling gives a comfortable safety margin.
      const size = Math.max(64, 70 * scale);
      watermarkCoverRef.current.style.left = `${x}px`;
      watermarkCoverRef.current.style.top = `${y}px`;
      watermarkCoverRef.current.style.width = `${size}px`;
      watermarkCoverRef.current.style.height = `${size}px`;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const resize = () => {
      // Sized from the canvas's own rendered box (clientWidth/Height), not
      // window.innerWidth/innerHeight directly. On mobile those two drift
      // apart as the browser chrome (address bar) shows/hides, which used to
      // leave the canvas bitmap mismatched with its actual CSS box — the
      // image would render stretched/misaligned and the watermark cover
      // (already positioned from clientWidth/Height) would drift off target.
      // Capped below the usual 2x/3x device ratios: the source frames are
      // only 1280x720, so beyond ~1.5x there's no extra real detail to show
      // — just a bigger canvas to fill and blend on every scroll tick.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      drawFrame(frameIndexRef.current);
      positionWatermarkCover();
    };
    resize();
    applyOverlayStyles(scrollYProgress.get());
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (progress > 0) drawFrame(frameIndexRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  // Scroll 'change' events can fire more than once per animation frame
  // (trackpad momentum, fast wheel input) — without coalescing, each one
  // triggers a full canvas redraw plus a dozen style writes, so the page can
  // do several frames' worth of drawing work for a single displayed frame.
  // Buffering the latest value and drawing once per rAF caps the work to
  // exactly one draw per paint, which is what actually stabilizes the rate.
  const latestScrollRef = useRef(0);
  const rafIdRef = useRef(null);

  const renderTick = () => {
    rafIdRef.current = null;
    const value = latestScrollRef.current;
    const clamped = Math.min(value / ANIMATION_END, 1);
    const floatIndex = clamped * (FRAME_URLS.length - 1);
    frameIndexRef.current = floatIndex;
    drawFrame(floatIndex);
    applyOverlayStyles(value);
  };

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    latestScrollRef.current = value;
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(renderTick);
    }
  });

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    };
  }, []);

  return (
    <section ref={wrapperRef} className="relative" style={{ height: '500vh' }}>
      <div className="sticky top-0 h-dvh w-full overflow-hidden" style={{ backgroundColor: FOOTAGE_VOID }}>
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        <div ref={scrimRef} className="absolute inset-0 bg-ink" style={{ opacity: 0 }} />

        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-ink/70 to-transparent" />

        <div className="absolute inset-x-0 top-[20%] flex flex-col items-center px-6 text-center sm:top-[24%]">
          {CAPTIONS.map((caption, i) => (
            <div
              key={caption.title}
              ref={(el) => {
                captionRefs.current[i] = el;
              }}
              style={{ opacity: i === 0 ? 1 : 0, transform: 'translateY(12px)' }}
              className="absolute inset-x-0 ml-auto md:ml-10 mr-auto   max-w-[26ch] text-center"
            >
              <h2 className="font-display text-4xl leading-tight font-medium text-cream italic drop-shadow-[0_2px_16px_rgba(0,0,0,0.6)] sm:text-5xl">
                {caption.title}
              </h2>
              <p className="mt-3 font-body text-xs tracking-[0.12em] text-gold uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] sm:text-sm">
                {caption.subtitle}
              </p>
            </div>
          ))}
        </div>

        {/* Soft corner vignette for blending, plus a solid, scale-aware patch
            that fully hides the video generator's watermark (present in this
            same spot in every source frame) regardless of viewport crop. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 bottom-0 h-64 w-64 opacity-90"
          style={{
            background: `radial-gradient(circle at bottom right, ${FOOTAGE_VOID}, transparent 68%)`,
          }}
        />
        <div
          ref={watermarkCoverRef}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full"
          style={{
            left: '90.6%',
            top: '83.3%',
            width: 64,
            height: 64,
            transform: 'translate(-50%, -50%)',
            backgroundColor: FOOTAGE_VOID,
          }}
        />

        <button
          ref={skipRef}
          type="button"
          onClick={handleSkip}
          aria-label="Skip animation"
          title="Skip animation"
          style={{ opacity: 1 }}
          className="absolute top-24 right-6 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-ink/60 text-cream/80 backdrop-blur-sm transition-colors hover:border-gold hover:text-gold sm:top-28 sm:right-8 sm:h-16 sm:w-16"
        >
          <FiChevronsDown size={20} />
        </button>

        {!isHeadReady && (
          <div className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2">
            <div className="h-px w-40 overflow-hidden bg-white/10">
              <div
                className="h-full bg-gold transition-[width] duration-200"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <span className="font-body text-[10px] tracking-[0.18em] text-cream/50 uppercase">
              Preparing the plate
            </span>
          </div>
        )}

        {/* Only shown once there's enough of the sequence loaded to scrub
            smoothly — it used to render at the same time and position as the
            loading indicator above, overlapping it illegibly. Gated on the
            "head" batch rather than full completion, since the rest of the
            sequence now streams in over a longer background window. */}
        {isHeadReady && (
          <div
            ref={promptRef}
            style={{ opacity: 1 }}
            className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 text-cream/60"
          >
            <span className="font-body text-[10px] tracking-[0.24em] uppercase">Scroll</span>
            <FiChevronDown className="animate-bounce" />
          </div>
        )}

        <div
          ref={contentRef}
          style={{ opacity: 0, transform: 'translateY(24px)', pointerEvents: 'none' }}
          inert
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/90 to-transparent pt-32 pb-14 sm:pb-20"
        >
          <HeroContent />
        </div>
      </div>
    </section>
  );
}

const HERO_HEADING = ['A Table', 'Worth', 'Remembering'];

function HeroContent({ className = '' }) {
  return (
    <div className={`container-app flex flex-col items-center text-center ${className}`}>
      <span className="eyebrow text-cream/70">Seasonal Fine Dining</span>

      <h1 className="mt-5 font-display text-[13vw] leading-[0.95] font-medium text-cream italic sm:text-6xl md:text-7xl lg:text-8xl">
        {HERO_HEADING.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h1>

      <p className="mt-6 max-w-md font-body text-sm text-cream/70 sm:text-base">
        Seasonal cuisine. Crafted with intention.
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/reservations"
          className="flex min-h-[44px] items-center justify-center gap-2 border border-gold bg-gold px-7 py-3.5 font-body text-xs font-semibold tracking-[0.12em] text-ink uppercase transition-colors hover:bg-transparent hover:text-gold"
        >
          Reserve a Table
        </Link>
        <Link
          to="/menu"
          className="flex min-h-[44px] items-center justify-center gap-2 border border-cream/30 px-7 py-3.5 font-body text-xs font-medium tracking-[0.12em] text-cream uppercase transition-colors hover:border-cream hover:bg-cream/10"
        >
          Explore Menu
        </Link>
      </div>
    </div>
  );
}

