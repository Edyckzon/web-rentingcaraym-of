'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';

/** A native modal keeps keyboard focus inside and restores it to the opener. */
export default function GalleryDialog({ children, labelId, className, onDismiss }: {
  children: ReactNode; labelId: string; className: string; onDismiss: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const dialog = ref.current!;
    const opener = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);
  return <dialog ref={ref} aria-labelledby={labelId} className={`gallery-dialog ${className}`}
    onCancel={event => { event.preventDefault(); onDismiss(); }}
    onClick={event => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onDismiss();
    }}>
    {children}
  </dialog>;
}
