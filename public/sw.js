self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  // Never intercept Firebase Auth handlers, Google OAuth, or Firebase backend APIs
  if (
    url.includes('/__/auth/') ||
    url.includes('accounts.google.com') ||
    url.includes('apis.google.com') ||
    url.includes('firebaseapp.com') ||
    url.includes('identitytoolkit.googleapis.com') ||
    url.includes('securetoken.googleapis.com')
  ) {
    return;
  }
  event.respondWith(fetch(event.request));
});
