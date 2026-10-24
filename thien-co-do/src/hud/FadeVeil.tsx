import { useEffect, useState } from 'react';
import { motion as motionTokens } from '../design/tokens';
import { useCamera } from '../store/camera';

/** With prefers-reduced-motion the peak switch is a 200 ms fade instead of a flight (spec §5.1). */
export function FadeVeil() {
  const nonce = useCamera((s) => s.fadeNonce);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (nonce === 0) return;
    setOn(true);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setOn(false)));
    return () => cancelAnimationFrame(id);
  }, [nonce]);
  return (
    <div
      aria-hidden="true"
      data-fade-veil={on ? 'on' : 'off'}
      className="pointer-events-none absolute inset-0 bg-cloud-low"
      style={{ opacity: on ? 1 : 0, transition: on ? 'none' : `opacity ${motionTokens.reducedFadeMs}ms linear` }}
    />
  );
}
