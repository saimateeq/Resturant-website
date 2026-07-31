import { useEffect, useState } from 'react';

export function useCountUp(target = 0, duration = 800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = null;
    let frameId;

    const step = (timestamp) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(target * progress);
      if (progress < 1) frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  return value;
}
