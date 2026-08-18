"use client";

import { useEffect } from 'react';

/**
 * PreloadAssets - Pre-cache critical images in the browser cache via JavaScript
 * without injecting <img> tags into the DOM (which causes search engine bots
 * and social scrapers to accidentally pick them up as page thumbnail images).
 */
const ASSETS_TO_PRELOAD = [
  '/Mentor/1.webp',
  '/Mentor/2.webp',
  '/Mentor/3.webp',
  '/Mentor/4.webp',
  '/Mentor/5.webp',
  '/Mentor/6.webp',
  '/Mentor/7.webp',
  '/Mentor/8.webp',
  '/fuii-avatar.webp',
  '/fuii-profile.webp',
  '/Phase1.webp',
  '/Phase2.webp',
  '/Phase3.webp',
  '/avatars/rookie-static.webp',
  '/avatars/rookie-static-w.webp',
  '/avatars/master-static.webp',
  '/avatars/master-static-w.webp',
  '/avatars/architect-static.webp',
  '/avatars/architect-static-w.webp',
  '/avatars/legacy-static.webp',
  '/avatars/legacy-static-w.webp',
  '/avatars/rookie-meditation.webp',
  '/avatars/rookie-meditation-w.webp',
  '/avatars/master-meditation.webp',
  '/avatars/master-meditation-w.webp',
  '/avatars/architect-meditation.webp',
  '/avatars/architect-meditation-w.webp',
  '/avatars/legacy-meditation.webp',
  '/avatars/legacy-meditation-w.webp',
  '/logo-upskill.png',
  '/logo-wheel.png',
  '/office-personality.png',
  '/money-avatar-logo.png',
  '/library-souls-logo.png',
  '/logo-khomsatsat.png',
  '/logo-full.png',
  '/logo-invert.png',
  '/logo-analysis.png',
  '/librarysoul.png',
  '/money-avatar.webp'
];

export const PreloadAssets = () => {
  useEffect(() => {
    const preload = () => {
      ASSETS_TO_PRELOAD.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    };

    if (typeof window !== 'undefined') {
      if ('requestIdleCallback' in window) {
        (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(preload);
      } else {
        setTimeout(preload, 1500);
      }
    }
  }, []);

  return null;
};

