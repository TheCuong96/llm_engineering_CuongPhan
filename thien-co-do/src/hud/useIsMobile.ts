import { useEffect, useState } from 'react';

export const MOBILE_QUERY = '(max-width: 767px)';

export function isMobileNow(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches;
}

/** True below 768 px: HUD switches to the compact layout with a bottom sheet (spec §12). */
export function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(isMobileNow);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const on = () => setMobile(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return mobile;
}
