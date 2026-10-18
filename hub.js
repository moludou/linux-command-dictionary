const scriptBase = new URL('.', document.currentScript.src);
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(new URL('service-worker.js', scriptBase)).catch(() => {});
  });
}
