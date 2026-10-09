// useSeatRepel.js — cursor-reactive "antigravity" effect for the seat map.
// Seats near the mouse drift away from it and ease back when the cursor leaves.
// Safe: no-ops on touch devices and when prefers-reduced-motion is set.

import { useEffect } from 'react';

// ── tuning constants ──────────────────────────────────────────────────────────
const REPEL_RADIUS = 120; // px — how far the influence reaches
const MAX_SHIFT    = 12;  // px — maximum translation at the sweet spot
const MAX_GROW     = 0.12; // fractional scale added at the cursor's position

// ── helpers ───────────────────────────────────────────────────────────────────

function shouldRun() {
  return (
    window.matchMedia('(hover: hover)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

// Apply CSS variables to every [data-seat-cell] under the container.
// Read all rects first, then write all styles (avoids layout thrashing).
function applyRepel(container, cursorX, cursorY) {
  const cells = container.querySelectorAll('[data-seat-cell]');

  // ── READ phase ─────────────────────────────────────────────────────────────
  const updates = [];
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const rect = cell.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;

    const dx = cx - cursorX; // vector pointing AWAY from the cursor
    const dy = cy - cursorY;
    const d  = Math.hypot(dx, dy);
    const t  = d / REPEL_RADIUS; // 0 = under cursor, 1 = at radius edge

    if (t >= 1 || d === 0) {
      // Outside influence radius (or cursor exactly on center) — no movement.
      updates.push({ cell, x: 0, y: 0, s: 1 });
    } else {
      // Bell-shaped shift: 0 directly under cursor, peaks ~half radius, 0 at edge.
      const shift = MAX_SHIFT * Math.sin(Math.PI * t);
      updates.push({
        cell,
        x: (dx / d) * shift,
        y: (dy / d) * shift,
        s: 1 + MAX_GROW * (1 - t),
      });
    }
  }

  // ── WRITE phase ────────────────────────────────────────────────────────────
  for (let i = 0; i < updates.length; i++) {
    const { cell, x, y, s } = updates[i];
    cell.style.setProperty('--repel-x', `${x}px`);
    cell.style.setProperty('--repel-y', `${y}px`);
    cell.style.setProperty('--repel-s', s);
  }
}

function resetAll(container) {
  const cells = container.querySelectorAll('[data-seat-cell]');
  for (let i = 0; i < cells.length; i++) {
    cells[i].style.setProperty('--repel-x', '0px');
    cells[i].style.setProperty('--repel-y', '0px');
    cells[i].style.setProperty('--repel-s', '1');
  }
}

// ── hook ──────────────────────────────────────────────────────────────────────

export default function useSeatRepel(containerRef) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !shouldRun()) return;

    let rafId      = null; // pending animation frame handle
    let lastX      = -9999;
    let lastY      = -9999;

    function scheduleUpdate(x, y) {
      lastX = x;
      lastY = y;
      if (rafId !== null) return; // already queued — let the existing frame run
      rafId = requestAnimationFrame(() => {
        rafId = null;
        applyRepel(container, lastX, lastY);
      });
    }

    function onPointerMove(e) {
      if (e.pointerType !== 'mouse') return;
      scheduleUpdate(e.clientX, e.clientY);
    }

    function onPointerLeave() {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      resetAll(container);
    }

    // Recompute with the last known cursor pos when the page scrolls,
    // because the seats' viewport positions change under a stationary mouse.
    function onScroll() {
      if (lastX === -9999) return; // cursor hasn't entered yet
      scheduleUpdate(lastX, lastY);
    }

    container.addEventListener('pointermove',  onPointerMove);
    container.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      container.removeEventListener('pointermove',  onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, [containerRef]);
}
