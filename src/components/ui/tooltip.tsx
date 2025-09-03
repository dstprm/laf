'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  className?: string;
}

export function Tooltip({ children, content, className }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [coords, setCoords] = React.useState<{ midX: number; top: number } | null>(null);
  const [computedLeft, setComputedLeft] = React.useState<number | null>(null);
  const triggerRef = React.useRef<HTMLDivElement | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);

  const show = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setCoords({ midX: rect.left + rect.width / 2, top: rect.top });
    setIsVisible(true);
  };
  const hide = () => setIsVisible(false);

  // Recompute tooltip position to avoid viewport overflow
  React.useEffect(() => {
    if (!isVisible || !coords || !tooltipRef.current) return;
    const padding = 8; // viewport padding
    const el = tooltipRef.current;
    const width = el.offsetWidth || 0;
    // Desired left places tooltip centered over trigger
    let desiredLeft = coords.midX - width / 2;
    // Clamp within viewport
    const maxLeft = (typeof window !== 'undefined' ? window.innerWidth : 0) - width - padding;
    const minLeft = padding;
    if (desiredLeft < minLeft) desiredLeft = minLeft;
    if (desiredLeft > maxLeft) desiredLeft = maxLeft;
    setComputedLeft(desiredLeft);
  }, [isVisible, coords]);

  return (
    <div className="inline-block">
      <div ref={triggerRef} onMouseEnter={show} onMouseLeave={hide} className="cursor-pointer inline-flex items-center">
        {children}
      </div>
      {isVisible && coords && typeof window !== 'undefined'
        ? createPortal(
            <div
              ref={tooltipRef}
              className={cn(
                'fixed z-[9999] px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-lg whitespace-nowrap pointer-events-none max-w-[90vw]',
                'transform -translate-y-2',
                className,
              )}
              style={{ left: computedLeft ?? coords.midX, top: coords.top }}
            >
              {content}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
