import React from 'react';

/**
 * PreloadAssets - A component to pre-cache critical images
 * so they appear instantly when needed throughout the app.
 */
const avatars = [
  '/avatars/rookie-static.png',
  '/avatars/rookie-static-w.png',
  '/avatars/master-static.png',
  '/avatars/master-static-w.png',
  '/avatars/architect-static.png',
  '/avatars/architect-static-w.png',
  '/avatars/legacy-static.png',
  '/avatars/legacy-static-w.png',
  '/avatars/rookie-meditation.png',
  '/avatars/rookie-meditation-w.png',
  '/avatars/master-meditation.png',
  '/avatars/master-meditation-w.png',
  '/avatars/architect-meditation.png',
  '/avatars/architect-meditation-w.png',
  '/avatars/legacy-meditation.png',
  '/avatars/legacy-meditation-w.png',
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
  '/money-avatar.png'
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
      {[...avatars, ...logos].map((url) => (
        <img key={url} src={url} alt="" fetchPriority="auto" />
      ))}
    </div>
  );
};
