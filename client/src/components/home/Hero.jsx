import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import { FiArrowRight, FiCalendar, FiChevronDown, FiChevronsDown } from 'react-icons/fi';
import { useFrameSequence } from '@hooks/useFrameSequence';

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

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <section className="relative flex h-[85vh] min-h-[560px] w-full items-end overflow-hidden bg-secondary-950">
        <img
          src={LAST_FRAME}
          alt="Savoria signature burger, plated"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-secondary-950 via-secondary-950/75 to-black/30" />
        <HeroContent className="relative pb-14" />
      </section>
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

  const { getNearestLoadedFrame, progress, isReady } = useFrameSequence(FRAME_URLS);

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
    if (!ctxRef.current) ctxRef.current = canvas.getContext('2d');
    const ctx = ctxRef.current;
    // Resizing the canvas resets context state, so this gets reapplied on
    // every draw rather than once — the cost is negligible.
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
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

    ctx.clearRect(0, 0, cw, ch);
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
  const positionWatermarkCover = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    const { scale, dw, dh, dx, dy } = computeFrameTransform(cw, ch);
    const x = dx + WATERMARK_X_FRAC * dw;
    const y = dy + WATERMARK_Y_FRAC * dh;

    if (skipRef.current) {
      skipRef.current.style.left = `${x}px`;
      skipRef.current.style.top = `${y}px`;
    }
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
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
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

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    const clamped = Math.min(value / ANIMATION_END, 1);
    const floatIndex = clamped * (FRAME_URLS.length - 1);
    frameIndexRef.current = floatIndex;
    drawFrame(floatIndex);
    applyOverlayStyles(value);
  });

  return (
    <section ref={wrapperRef} className="relative" style={{ height: '500vh' }}>
      <div className="sticky top-0 h-dvh w-full overflow-hidden" style={{ backgroundColor: FOOTAGE_VOID }}>
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        <div ref={scrimRef} className="absolute inset-0 bg-secondary-950" style={{ opacity: 0 }} />

        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-secondary-950/75 to-transparent" />

        <div className="absolute top-6 left-6 text-xs font-semibold tracking-[0.3em] text-white/80 uppercase sm:top-8 sm:left-8">
          Savoria
        </div>

        <div className="absolute inset-x-0 top-[20%] flex flex-col items-center px-6 text-center sm:top-[24%]">
          {CAPTIONS.map((caption, i) => (
            <div
              key={caption.title}
              ref={(el) => {
                captionRefs.current[i] = el;
              }}
              style={{ opacity: i === 0 ? 1 : 0, transform: 'translateY(12px)' }}
              className="absolute inset-x-0 mx-auto max-w-[26ch] text-center"
            >
              <h2 className="font-display text-2xl leading-tight font-semibold text-white italic drop-shadow-[0_2px_16px_rgba(0,0,0,0.6)] sm:text-4xl">
                {caption.title}
              </h2>
              <p className="mt-3 text-xs tracking-[0.12em] text-primary-200 uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] sm:text-sm">
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
          style={{ opacity: 1, left: '90.6%', top: '83.3%', transform: 'translate(-50%, -50%)' }}
          className="absolute z-10 flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-secondary-950/80 text-white/80 backdrop-blur-sm transition-colors hover:border-primary-400 hover:text-primary-300"
        >
          <FiChevronsDown size={20} />
        </button>

        {!isReady && (
          <div className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-2">
            <div className="h-px w-40 overflow-hidden bg-white/10">
              <div
                className="h-full bg-primary-400 transition-[width] duration-200"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <span className="text-[10px] tracking-[0.18em] text-secondary-400 uppercase">
              Preparing the plate
            </span>
          </div>
        )}

        <div
          ref={promptRef}
          style={{ opacity: 1 }}
          className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 text-white/70"
        >
          <span className="text-[10px] tracking-[0.24em] uppercase">Scroll</span>
          <FiChevronDown className="animate-bounce" />
        </div>

        <div
          ref={contentRef}
          style={{ opacity: 0, transform: 'translateY(24px)', pointerEvents: 'none' }}
          inert
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-secondary-950 via-secondary-950/90 to-transparent pt-32 pb-10 sm:pb-14"
        >
          <HeroContent />
        </div>
      </div>
    </section>
  );
}

function HeroContent({ className = '' }) {
  return (
    <div className={`container-app flex flex-col items-center text-center ${className}`}>
      <div className="flex items-center gap-3 text-xs font-semibold tracking-[0.22em] text-primary-400 uppercase">
        <span className="inline-block h-px w-6 bg-primary-400" />
        Fine Dining Since 2010
        <span className="inline-block h-px w-6 bg-primary-400" />
      </div>

      <h1 className="mt-5 max-w-2xl font-display text-3xl leading-[1.15] font-semibold text-white italic sm:text-4xl">
        Cooking is not decoration.
        <br />
        It&rsquo;s <span className="text-primary-400 not-italic">craft, plated.</span>
      </h1>

      <p className="mt-4 max-w-[46ch] text-[15px] text-secondary-300">
        Savoria brings together seasonal ingredients, an open pass, and a table held for you
        &mdash; twelve dishes a night, each one built to be the only thing on your mind.
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          to="/menu"
          className="flex items-center justify-center gap-2 border border-primary-400 bg-primary-400 px-6 py-3 text-xs font-semibold tracking-[0.08em] text-secondary-950 uppercase transition-transform hover:-translate-y-0.5"
        >
          Order Now <FiArrowRight />
        </Link>
        <Link
          to="/reservations"
          className="flex items-center justify-center gap-2 border border-white/20 px-6 py-3 text-xs font-medium tracking-[0.08em] text-white uppercase transition-colors hover:border-primary-400 hover:text-primary-300"
        >
          <FiCalendar /> Reserve a Table
        </Link>
      </div>

      <div className="mt-8 flex gap-7 border-t border-white/10 pt-5">
        <div className="text-[11px] tracking-[0.08em] text-secondary-400 uppercase">
          Seatings
          <strong className="mt-1 block font-display text-lg font-normal text-white italic normal-case">
            5:30 &ndash; 10p
          </strong>
        </div>
        <div className="text-[11px] tracking-[0.08em] text-secondary-400 uppercase">
          Tables left
          <strong className="mt-1 block font-display text-lg font-normal text-white italic normal-case">
            3 tonight
          </strong>
        </div>
        <div className="text-[11px] tracking-[0.08em] text-secondary-400 uppercase">
          Chef
          <strong className="mt-1 block font-display text-lg font-normal text-white italic normal-case">
            M. Duarte
          </strong>
        </div>
      </div>
    </div>
  );
}
