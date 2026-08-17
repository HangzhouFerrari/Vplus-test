const CACHE = 'velios-20260817-54';
const ASSETS = [
  './',
  './index.html',
  './welcome.html',
  './set.html',
  './login.html',
  './account-options.html',
  './my-account.html',
  './manifest.json',
  './style.css',
  './app.js',
  './set-app.js',
  './supabase-client.js',
  './favicon.svg',
  './favicon-dark.svg',
  './appicon-192.png',
  './appicon-512.png',
  './apple-touch-icon.png',
  './appicon-monochrome.svg',
  './assets/branding/logo_full-svg.svg',
  './assets/icons/icon_notification.svg',
  './assets/icons/icon_settings.svg',
  './assets/icons/icon_settings-config.svg',
  './assets/icons/icon_sets.svg',
  './assets/icons/icon_learn.svg',
  './assets/icons/icon_cloud.svg',
  './assets/welcome/study-hero.webp',
  './assets/subjects/index.json',
  './assets/subjects/placeholder.svg',
  './assets/subjects/biologie.webp',
  './assets/subjects/duits.webp',
  './assets/subjects/geschiedenis.webp',
  './assets/subjects/grieks.webp',
  './assets/subjects/latijn.webp',
  './assets/subjects/nederlands.webp',
  './assets/subjects/natuurkunde.webp',
  './assets/subjects/scheikunde.webp',
  './assets/subjects/aardrijkskunde.webp',
  './assets/subjects/economie.webp',
  './assets/subjects/engels.webp',
  './assets/subjects/frans.webp',
  './assets/subjects/overig.webp',
  './assets/share/whatsapp.png',
  './assets/share/messages.png',
  './assets/share/messenger.png',
  './assets/share/mail.png',
  './assets/share/telegram.png',
  './assets/avatars/cat.jpg',
  './assets/avatars/dog.jpg',
  './assets/avatars/fox.jpg',
  './assets/avatars/owl.jpg',
  './assets/avatars/rabbit.jpg',
  './assets/avatars/red-panda.jpg',
  './assets/avatars/study-red-panda.webp',
  './assets/avatars/study-dog.webp',
  './assets/avatars/study-eagle.webp',
  './assets/avatars/study-giraffe.webp',
  './assets/avatars/study-rabbit.webp',
  './assets/avatars/study-cat.webp',
  './notifications/index.json',
  './notifications/demo-welkom.json',
  './sets/index.json',
  './sets/010000033.vset',
  './sets/020600533.vset',
  './sets/020601533.vset',
  './sets/020601733.vset',
  './sets/03051t233.vset',
  './sets/040401033.vset',
  './sets/040402033.vset',
  './sets/23051t233.vset',
  './sets/a2nb01033.vset',
  './SFX/checkpoint.wav',
  './SFX/correct.wav',
  './SFX/finish.wav',
  './SFX/incorrect.wav'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const requestUrl = new URL(e.request.url);

  // Cache uitsluitend leesverzoeken naar bestanden van Velios+ zelf.
  // Supabase- en andere externe API-responses bevatten gebruikersgegevens en
  // mogen nooit door de offlinecache worden teruggegeven.
  if (e.request.method !== 'GET' || requestUrl.origin !== self.location.origin) return;

  // HTML network-first (altijd nieuwste versie ophalen)
  if (e.request.url.endsWith('.html') || e.request.url.endsWith('/')) {
    e.respondWith(
      fetch(e.request).then(resp => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => caches.match(e.request, { ignoreSearch: true }) || caches.match('./index.html'))
    );
    return;
  }
  // Code, styles, .vset en JSON network-first zodat updates direct zichtbaar zijn.
  if (e.request.url.includes('.vset') || e.request.url.endsWith('.json') || e.request.url.includes('.json?') ||
      e.request.url.endsWith('.js') || e.request.url.includes('.js?') ||
      e.request.url.endsWith('.css') || e.request.url.includes('.css?')) {
    e.respondWith(
      fetch(e.request).then(resp => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => caches.match(e.request, { ignoreSearch: true }))
    );
    return;
  }
  // Favicon en andere assets cache-first maar met fallback
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => Response.error());
    })
  );
});
