document.addEventListener("DOMContentLoaded", function () {
  const containers = document.querySelectorAll('.webmentions');
  if (!containers.length) return;

  containers.forEach(function (container) {
    const target = container.dataset.webmentionTarget;
    if (!target) return;

    renderCount(container, target);
    renderLists(container, target);
  });

  /* ---------------------------------------------------------------------- */
  /* Count summary                                                           */
  /* ---------------------------------------------------------------------- */

  function renderCount(container, target) {
    const total = container.querySelector('.webmention-stats-total');
    if (!total) return;

    /* for testing use https://webmention.io/api/example/count */
    const apiUrl = new URL('https://webmention.io/api/count');
    apiUrl.searchParams.set('target', target);

    fetchJson(apiUrl)
      .then(({ count = 0, type = {} }) => {
        const countText = `${count} webmention${count === 1 ? '' : 's'}`;

        const breakdown = Object.entries(type)
          .filter(([, value]) => value > 0)
          .map(([name, value]) => `${value} ${name}`)
          .join(' · ');

        total.textContent = countText + (breakdown ? ` — ${breakdown}` : '');
      })
      .catch(error => {
        console.warn('Webmention count unavailable:', error);
        total.textContent = '';
      });
  }

  /* ---------------------------------------------------------------------- */
  /* Grouped lists                                                           */
  /* ---------------------------------------------------------------------- */

  function renderLists(container, target) {
    const listsWrapper = container.querySelector('.webmention-lists');
    const lists = container.querySelectorAll('.webmention-list[data-wm-property]');
    if (!listsWrapper || !lists.length) return;

    const fallbackTemplate = container.querySelector('.webmention-avatar-fallback');

    /* for testing use https://webmention.io/api/example/mentions.jf2 */
    const apiUrl = new URL('https://webmention.io/api/mentions.jf2');
    apiUrl.searchParams.set('target', target);
    apiUrl.searchParams.set('per-page', '100');

    fetchJson(apiUrl)
      .then(({ children = [] }) => {
        // Group mentions by wm-property, keeping the order returned by the API.
        const grouped = new Map();
        children.forEach(mention => {
          const property = mention['wm-property'];
          if (!property) return;
          if (!grouped.has(property)) grouped.set(property, []);
          grouped.get(property).push(mention);
        });

        let shown = 0;
        lists.forEach(list => {
          const mentions = grouped.get(list.dataset.wmProperty) || [];
          // Drop anything from a previous render but keep the group icon.
          list.querySelectorAll('li:not(.webmention-group)').forEach(li => li.remove());

          if (!mentions.length) {
            list.hidden = true;
            return;
          }

          mentions.forEach(mention => {
            list.appendChild(createItem(mention, list.dataset.wmClass, fallbackTemplate));
          });
          list.hidden = false;
          shown += 1;
        });

        if (shown) {
          clearStatus(listsWrapper);
        }
      })
      .catch(error => {
        console.warn('Webmentions unavailable:', error);
        lists.forEach(list => { list.hidden = true; });
        clearStatus(listsWrapper);
      });
  }

  function clearStatus(wrapper) {
    const status = wrapper.querySelector('.webmention-status');
    if (status) status.remove();
  }

  function createItem(mention, mf2Class, fallbackTemplate) {
    const item = document.createElement('li');
    item.className = `webmention-item ${mf2Class || ''} h-cite`.trim();

    const author = mention.author || {};
    const authorName = author.name || 'Someone';

    // Wrap the avatar in a link to the mention itself, falling back to the author's profile.
    const href = firstSafeUrl(mention.url, author.url);
    const link = document.createElement(href ? 'a' : 'span');
    link.className = 'webmention-item__link';
    if (href) {
      link.classList.add('u-url');
      link.href = href;
      link.rel = 'nofollow noopener';
    }
    link.title = itemTitle(mention, authorName);

    const card = document.createElement('span');
    card.className = 'p-author h-card';
    card.appendChild(createAvatar(author, authorName, fallbackTemplate));
    link.appendChild(card);
    item.appendChild(link);

    // Keep the author name in the DOM for microformats parsers and screen readers.
    const name = document.createElement(author.url && isSafeUrl(author.url) ? 'a' : 'span');
    name.className = 'webmention-item__name p-name';
    if (name.tagName === 'A') {
      name.classList.add('u-url');
      name.href = author.url;
      name.rel = 'nofollow noopener';
    }
    name.textContent = authorName;
    item.appendChild(name);

    return item;
  }

  function createAvatar(author, authorName, fallbackTemplate) {
    const fallback = () => {
      if (fallbackTemplate && fallbackTemplate.content) {
        const svg = fallbackTemplate.content.firstElementChild;
        if (svg) {
          const clone = svg.cloneNode(true);
          clone.classList.add('webmention-item__photo', 'webmention-item__photo--fallback');
          clone.setAttribute('role', 'img');
          clone.setAttribute('aria-label', authorName);
          return clone;
        }
      }
      const span = document.createElement('span');
      span.className = 'webmention-item__photo webmention-item__photo--fallback';
      span.textContent = authorName.charAt(0).toUpperCase();
      return span;
    };

    if (!author.photo || !isSafeUrl(author.photo)) {
      return fallback();
    }

    const photo = document.createElement('img');
    photo.className = 'webmention-item__photo u-photo';
    photo.src = author.photo;
    photo.alt = authorName;
    photo.loading = 'lazy';
    photo.decoding = 'async';
    photo.referrerPolicy = 'no-referrer';
    photo.addEventListener('error', () => photo.replaceWith(fallback()), { once: true });
    return photo;
  }

  function itemTitle(mention, authorName) {
    const parts = [authorName];

    if (mention.published) {
      const date = new Date(mention.published);
      if (!Number.isNaN(date.getTime())) {
        parts.push(new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date));
      }
    }

    let title = parts.join(' · ');

    // Replies and mentions carry text worth previewing on hover.
    const property = mention['wm-property'];
    if (property === 'in-reply-to' || property === 'mention-of') {
      const text = mentionText(mention.content).trim();
      if (text) title += `\n${truncate(text, 200)}`;
    } else if (property === 'rsvp' && mention.rsvp) {
      title += `\nRSVP: ${mention.rsvp}`;
    }

    return title;
  }

  function truncate(text, max) {
    return text.length > max ? `${text.slice(0, max - 1)}…` : text;
  }

  function mentionText(content) {
    if (!content) return '';
    if (content.text) return content.text;
    if (!content.html) return '';
    // DOMParser never executes scripts or loads resources; we only take the text.
    const doc = new DOMParser().parseFromString(content.html, 'text/html');
    doc.querySelectorAll('script, style').forEach(node => node.remove());
    return doc.body.textContent || '';
  }

  /* ---------------------------------------------------------------------- */
  /* Shared helpers                                                          */
  /* ---------------------------------------------------------------------- */

  async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  }

  function firstSafeUrl(...candidates) {
    return candidates.find(value => value && isSafeUrl(value)) || null;
  }

  function isSafeUrl(value) {
    try {
      const url = new URL(value, window.location.href);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }
});
