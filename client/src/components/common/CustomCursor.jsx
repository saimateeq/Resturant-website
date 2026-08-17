import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const CursorContext = createContext(() => {});

// Lets any interactive image opt into the floating cursor label without
// prop-drilling: call useCursorLabel() and set it on mouse enter/leave.
export function useCursorLabel() {
  return useContext(CursorContext);
}

const CURSOR_SIZE = 64;

export default function CustomCursorProvider({ children }) {
  const [label, setLabel] = useState('');
  const [enabled, setEnabled] = useState(false);
  const cursorRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setEnabled(fine && !reducedMotion);
  }, []);

  // A hovered image's Link can navigate away and unmount before the browser
  // ever fires mouseleave, leaving the label stuck "on" for whatever page
  // loads next (this provider lives above the router outlet, so it isn't
  // remounted per page). Clear it on every route change as a backstop.
  useEffect(() => {
    setLabel('');
  }, [pathname]);

  useEffect(() => {
    if (!enabled) return undefined;
    const onMove = (e) => {
      if (!cursorRef.current) return;
      cursorRef.current.style.transform = `translate(${e.clientX - CURSOR_SIZE / 2}px, ${e.clientY - CURSOR_SIZE / 2}px)`;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [enabled]);

  return (
    <CursorContext.Provider value={setLabel}>
      {children}
      {enabled && (
        <div
          ref={cursorRef}
          aria-hidden="true"
          className={`pointer-events-none fixed top-0 left-0 z-[200] flex h-16 w-16 items-center justify-center rounded-full bg-ink/85 font-body text-[10px] font-semibold tracking-[0.15em] text-cream uppercase backdrop-blur-sm transition-[opacity,scale] duration-200 ${
            label ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          }`}
        >
          {label}
        </div>
      )}
    </CursorContext.Provider>
  );
}
