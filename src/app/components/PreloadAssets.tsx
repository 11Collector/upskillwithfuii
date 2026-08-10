import React from 'react';

/**
 * PreloadAssets - A component to pre-cache critical images
 * so they appear instantly when needed throughout the app.
 */
const mentors = [
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
];

const avatars = [
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
];

const logos = [
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
  return (
    <div 
      style={{ 
        position: 'absolute', 
        width: 0, 
        height: 0, 
        overflow: 'hidden', 
        zIndex: -1, 
        pointerEvents: 'none',
        visibility: 'hidden' 
      }} 
      aria-hidden="true"
    >
      {[...mentors, ...avatars, ...logos].map((url) => (
        <img key={url} src={url} alt="" fetchPriority="high" />
      ))}
    </div>
  );
};
