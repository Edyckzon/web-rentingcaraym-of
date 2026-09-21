'use client';

import { useEffect } from 'react';

const sections: Record<string, string> = {
  '/': '', '/flota': 'flota', '/contacto': 'contacto',
  '/nosotros': 'nosotros', '/como-funciona': 'como-funciona', '/planear': 'buscador',
};

/** Exportable routes with smooth transitions and browser history. */
export function useSectionNavigation() {
  useEffect(() => {
    const moveTo = (path: string, smooth: boolean) => {
      const section = sections[path];
      if (section === undefined) return false;
      const target = section ? document.getElementById(section) : document.querySelector<HTMLElement>('header');
      if (!target) return false;
      const temporaryTabIndex = !target.hasAttribute('tabindex');
      if (temporaryTabIndex) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      if (temporaryTabIndex) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      const behavior = smooth && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant';
      if (!section) window.scrollTo({ top: 0, behavior });
      else target.scrollIntoView({ behavior, block: 'start' });
      return true;
    };
    const currentPath = () => window.location.pathname.replace(/\/$/, '') || '/';
    const navigate = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
      const url = new URL(link.href);
      const path = url.pathname.replace(/\/$/, '') || '/';
      if (url.origin !== window.location.origin || url.hash || url.search || !(path in sections)) return;
      if (!moveTo(path, true)) return;
      event.preventDefault();
      if (currentPath() !== path) window.history.pushState(null, '', path);
    };
    const restore = () => { moveTo(currentPath(), false); };
    const frame = window.requestAnimationFrame(restore);
    document.addEventListener('click', navigate);
    window.addEventListener('popstate', restore);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener('click', navigate);
      window.removeEventListener('popstate', restore);
    };
  }, []);
}
