/**
 * service-worker.js
 * -----------------------------------------------------------------------
 * Cache mínimo do "shell" do app, só o suficiente pra permitir instalar
 * o PWA no dispositivo. Não faz cache das respostas da API (os dados de
 * eventos/convidados são sempre buscados ao vivo — inclusive porque a
 * tela de check-in depende de dados sempre atualizados).
 * -----------------------------------------------------------------------
 */

const CACHE_NOME = 'jv-eventos-v2';
const ARQUIVOS_SHELL = [
  './index.html',
  './evento.html',
  './checkin.html',
  './css/style.css',
  './js/config.js',
  './js/api.js',
  './js/ui.js',
  './js/eventos.js',
  './js/convidados.js',
  './js/checkin.js',
  './manifest.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NOME).then(cache => cache.addAll(ARQUIVOS_SHELL))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(nomes =>
      Promise.all(nomes.filter(n => n !== CACHE_NOME).map(n => caches.delete(n)))
    )
  );
});

self.addEventListener('fetch', (event) => {
  // Nunca intercepta chamadas pra API do Apps Script — sempre busca ao vivo
  if (event.request.url.includes('script.google.com')) return;

  event.respondWith(
    caches.match(event.request).then(resposta => resposta || fetch(event.request))
  );
});
