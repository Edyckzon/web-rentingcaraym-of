'use client';

import { useEffect, useState } from 'react';
import { limaDate, minimumReturn } from '@/lib/rental-pricing.mjs';

export function useRentalDateBounds(pickup: string) {
  const [today, setToday] = useState('');
  useEffect(() => {
    const refresh = () => setToday(limaDate());
    refresh();
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, []);
  return { pickupMin:today ? `${today}T00:00` : undefined, returnMin:today ? minimumReturn(pickup, today) : undefined };
}
