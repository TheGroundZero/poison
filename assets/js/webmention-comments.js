document.addEventListener("DOMContentLoaded", function () {
  const containers = document.querySelectorAll('.webmention-comments');
  if (!containers.length) return;

  containers.forEach(function (container) {
    const target = container.dataset.webmentionTarget;
    const list = container.querySelector('.webmention-list');
    if (!target || !list) return;

    const apiUrl = new URL('https://webmention.io/api/mentions.jf2');
    apiUrl.searchParams.set('target', target);

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then(({ children = [] }) => {
        list.replaceChildren();

        if (!children.length) {
          const empty = document.createElement('p');
          empty.className = 'webmention-comments-status';
          empty.textContent = 'No webmentions yet.';
          list.appendChild(empty);
          return;
        }

        children.forEach(mention => list.appendChild(createMention(mention)));
      })
      .catch(error => {
        console.warn('Webmentions unavailable:', error);
        list.replaceChildren();
      });
  });

  function createMention(mention) {
    const article = document.createElement('article');
    article.className = 'webmention-comment h-cite';

    const header = document.createElement('header');
    header.className = 'webmention-comment__header';

    const author = mention.author || {};
    if (author.photo && isSafeUrl(author.photo)) {
      const photo = document.createElement('img');
      photo.className = 'webmention-comment__photo u-photo';
      photo.src = author.photo;
      photo.alt = '';
      photo.loading = 'lazy';
      header.appendChild(photo);
    }

    const authorName = document.createElement('span');
    authorName.className = 'webmention-comment__author p-author h-card';
    const authorLabel = author.name || 'Someone';
    if (author.url && isSafeUrl(author.url)) {
      const link = document.createElement('a');
      link.className = 'p-name u-url';
      link.href = author.url;
      link.rel = 'nofollow noopener';
      link.textContent = authorLabel;
      authorName.appendChild(link);
    } else {
      authorName.textContent = authorLabel;
    }
    header.appendChild(authorName);

    if (mention.published) {
      const date = new Date(mention.published);
      if (!Number.isNaN(date.getTime())) {
        const time = document.createElement('time');
        time.className = 'webmention-comment__date dt-published';
        time.dateTime = mention.published;
        time.textContent = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
        header.appendChild(time);
      }
    }

    article.appendChild(header);

    const content = document.createElement('p');
    content.className = 'webmention-comment__content e-content';
    content.textContent = (mention.content && (mention.content.text || mention.content.html)) || '';
    article.appendChild(content);

    if (mention.url && isSafeUrl(mention.url)) {
      const source = document.createElement('a');
      source.className = 'webmention-comment__source u-url';
      source.href = mention.url;
      source.rel = 'nofollow noopener';
      source.textContent = 'View source';
      article.appendChild(source);
    }

    return article;
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
