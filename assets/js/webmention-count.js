document.addEventListener("DOMContentLoaded", function () {
  const container = document.querySelector('.webmention-stats');
  if (!container) return;

  const target = container.dataset.webmentionTarget;
  const total = container.querySelector('.webmention-total');
  
  /* for testing use https://webmention.io/api/example/count */
  const apiUrl = new URL('https://webmention.io/api/count');
  apiUrl.searchParams.set('target', target);

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    })
    .then(({count = 0, type = {}}) => {
      counttext = `${count} webmention${count === 1 ? '' : 's'}`;

      const breakdown = Object.entries(type)
        .filter(([, value]) => value > 0)
        .map(([name, value]) => `${value} ${name}`)
        .join(' · ');

      total.textContent = counttext + (breakdown ? ` — ${breakdown}` : '');
    })
    .catch(error => {
      console.warn('Webmention count unavailable:', error);
      total.textContent = '';
    });
});
