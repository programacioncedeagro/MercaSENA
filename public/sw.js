const CACHE_NAME = 'mercasena-v1';
const STATIC_CACHE = 'mercasena-static-v1';
const DYNAMIC_CACHE = 'mercasena-dynamic-v1';

// Assets que siempre queremos cachear
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  // Next.js assets se manejan automáticamente
];

// Assets que NO queremos cachear
const EXCLUDE_URLS = [
  '/api/',
  '/_next/webpack-hmr',
  '/_next/static/development/',
  '/firebase-auth-sw.js',
  'chrome-extension',
  'moz-extension',
];

// Estrategias de cache
const CACHE_STRATEGIES = {
  // Cache First: Para assets estáticos
  cacheFirst: ['/_next/static/', '/static/', '.woff2', '.woff', '.ttf'],
  // Network First: Para datos dinámicos con fallback a cache
  networkFirst: ['/api/', '/auth/', '/productor/', '/comprador/'],
  // Stale While Revalidate: Para contenido que puede ser un poco viejo
  staleWhileRevalidate: ['/', '/mercado', '/dashboard']
};

self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Precaching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE &&
                     cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;

  // Solo manejar GET requests
  if (method !== 'GET') return;

  // Excluir URLs específicas
  if (EXCLUDE_URLS.some(excludeUrl => url.includes(excludeUrl))) {
    return;
  }

  // Determinar estrategia de cache
  const strategy = getCacheStrategy(url);
  
  switch (strategy) {
    case 'cacheFirst':
      event.respondWith(cacheFirst(request));
      break;
    case 'networkFirst':
      event.respondWith(networkFirst(request));
      break;
    case 'staleWhileRevalidate':
      event.respondWith(staleWhileRevalidate(request));
      break;
    default:
      event.respondWith(networkFirst(request));
  }
});

function getCacheStrategy(url) {
  for (const [strategy, patterns] of Object.entries(CACHE_STRATEGIES)) {
    if (patterns.some(pattern => url.includes(pattern))) {
      return strategy;
    }
  }
  return 'networkFirst';
}

// Cache First - Para assets estáticos
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await fetch(request);
    if (response.status === 200) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Cache First failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network First - Para contenido dinámico
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    if (response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      // Solo cachear respuestas exitosas
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback para páginas HTML
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Stale While Revalidate - Respuesta rápida con actualización en background
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await caches.match(request);
  
  const networkPromise = fetch(request).then((response) => {
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch((error) => {
    console.log('[SW] Network failed for stale-while-revalidate:', error);
  });

  // Retornar cache inmediatamente si existe, sino esperar red
  return cachedResponse || networkPromise;
}

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearCache();
  }
});

// Limpiar cache viejo
async function clearCache() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('[SW] All caches cleared');
}