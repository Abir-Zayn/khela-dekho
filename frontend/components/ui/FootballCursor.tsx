'use client';

import React, { useEffect, useRef, useState } from 'react';

export function FootballCursor() {
  const ballRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    if (!mounted) {
      setMounted(true);
      return;
    }
    
    const ball = ballRef.current;
    if (!ball) return;

    // Inject dynamic styles to hide the default browser cursor.
    // We keep input/textarea cursors visible so text selection/carets are still usable.
    const style = document.createElement('style');
    style.id = 'hide-default-cursor-style';
    style.innerHTML = `
      html, body, a, button, select, [role="button"] {
        cursor: none !important;
      }
    `;
    document.head.appendChild(style);

    let mouseX = -100;
    let mouseY = -100;
    let ballX = -100;
    let ballY = -100;
    let rotationAngle = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    // If the user actually touches the screen, disable the custom cursor immediately
    // and restore the default pointer for a native touch experience.
    const handleTouchStart = () => {
      if (ball) ball.style.display = 'none';
      if (style.parentNode) style.remove();
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Lerp Speed: 0.05 is slow and fluid (slowmo), 0.15 is fast and snappy
    const speed = 0.06;

    const updatePosition = () => {
      // Calculate distance between current ball position and mouse position
      const dx = mouseX - ballX;
      const dy = mouseY - ballY;
      
      // Update ball coordinates using Linear Interpolation (Lerp)
      ballX += dx * speed;
      ballY += dy * speed;

      // Spin the football proportional to its velocity/distance remaining
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 0.1) {
        // Spin direction based on movement direction (dx)
        const direction = dx >= 0 ? 1 : -1;
        rotationAngle += distance * 0.3 * direction;
      }

      if (ball) {
        // -16px offsets the 32px-wide element to center it on the cursor tip
        ball.style.transform = `translate3d(${ballX - 16}px, ${ballY - 16}px, 0) rotate(${rotationAngle}deg)`;
      }

      requestAnimationFrame(updatePosition);
    };

    const animId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animId);
      if (style.parentNode) style.remove();
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      ref={ballRef}
      className="pointer-events-none fixed left-0 top-0 z-50 select-none will-change-transform flex items-center justify-center w-8 h-8 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
      style={{
        transform: 'translate3d(-100px, -100px, 0) rotate(0deg)',
        transition: 'none', // Crucial to override CSS transitions and let animation loop control position
      }}
    >
      <div
        className="text-3xl select-none will-change-transform"
        style={{
          transform: isClicked ? 'scale(0.72) rotate(-35deg)' : 'scale(1) rotate(0deg)',
          transition: 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
      >
        ⚽
      </div>
    </div>
  );
}

