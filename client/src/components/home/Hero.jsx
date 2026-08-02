import { Link } from 'react-router-dom';
import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { FiArrowRight, FiCalendar } from 'react-icons/fi';
import heroBiryani from '@assets/images/hero-biryani.jpg';

export default function Hero() {
  const stageRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 150,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), {
    stiffness: 150,
    damping: 18,
  });

  const handleMouseMove = (event) => {
    if (prefersReducedMotion || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    mouseX.set((event.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section className="bg-secondary-950 py-16 lg:py-20">
      <div className="container-app grid grid-cols-1 items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 text-xs font-semibold tracking-[0.22em] text-primary-400 uppercase">
            <span className="inline-block h-px w-6 bg-primary-400" />
            Fine Dining Since 2010
          </div>

          <h1 className="mt-6 font-display text-3xl leading-[1.15] font-semibold text-white italic sm:text-4xl lg:text-[42px]">
            Cooking is not
            <br />
            decoration. It&rsquo;s
            <br />
            <span className="text-primary-400 not-italic">craft, plated.</span>
          </h1>

          <p className="mt-5 max-w-[38ch] text-[15px] text-secondary-300">
            Savoria brings together seasonal ingredients, an open pass, and a table held for you
            &mdash; twelve dishes a night, each one built to be the only thing on your mind.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
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

          <div className="mt-9 flex gap-7 border-t border-white/10 pt-5">
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative h-[360px] sm:h-[420px] lg:h-[460px]"
          style={{ perspective: 1400 }}
        >
          <motion.div
            ref={stageRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX: prefersReducedMotion ? 0 : rotateX, rotateY: prefersReducedMotion ? 0 : rotateY }}
            className="relative h-full w-full overflow-hidden rounded-md border border-white/10 shadow-[0_50px_90px_-24px_rgba(0,0,0,0.65)]"
          >
            <img
              src={heroBiryani}
              alt="Tandoori chicken biryani, tonight's signature plate"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary-950/65 via-transparent to-transparent" />
            <span className="absolute bottom-5 left-5 border border-primary-300/30 bg-secondary-950/70 px-2.5 py-1.5 text-[10px] tracking-[0.14em] text-primary-200 uppercase">
              Chef&rsquo;s plate &middot; No. 04
            </span>
            <span className="absolute right-5 bottom-5 text-[11px] tracking-[0.1em] text-secondary-300 uppercase">
              move your cursor
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
