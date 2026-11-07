import { getArticleCoverUrl, listPublishedArticles } from '../services/articles.js'

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('bg-BG')
}

async function articleCard(article, index) {
  const imageClass = ['one', 'two', 'three'][index % 3]
  const coverUrl = await getArticleCoverUrl(article.cover_image_path)
  return `<div class="col-md-4 reveal is-visible">
    <article class="card pawly-card pawly-article-card h-100">
      ${coverUrl ? `<img class="pawly-article-image pawly-article-cover-card" src="${escapeHtml(coverUrl)}" alt="${escapeHtml(article.title)}" />` : `<div class="pawly-article-image pawly-article-image-${imageClass}"><i class="bi bi-journal-heart" aria-hidden="true"></i></div>`}
      <div class="card-body p-4">
        <p class="pawly-article-meta mb-2"><time datetime="${escapeHtml(article.created_at)}">${formatDate(article.created_at)}</time></p>
        <h3 class="h5 pawly-title">${escapeHtml(article.title)}</h3>
        <p class="text-muted small mb-0">${escapeHtml(article.excerpt)}</p>
        <a class="pawly-text-link d-inline-flex align-items-center gap-2 mt-3" href="/article.html?slug=${encodeURIComponent(article.slug)}">Прочети повече <i class="bi bi-arrow-right" aria-hidden="true"></i></a>
      </div>
    </article>
  </div>`
}

export async function renderPublicArticles() {
  const container = document.querySelector('[data-public-articles]')
  if (!container) return

  try {
    const articles = await listPublishedArticles()
    container.innerHTML = articles.length
      ? (await Promise.all(articles.map(articleCard))).join('')
      : `<div class="col-12"><div class="pawly-placeholder py-5">
          <div><div class="pawly-placeholder-icon mb-3"><i class="bi bi-journal-heart" aria-hidden="true"></i></div>
          <h3 class="h5 pawly-title">Скоро ще има нови полезни статии</h3>
          <p class="text-muted mb-0">Подготвяме идеи и съвети за още по-спокойна грижа.</p></div>
        </div></div>`
  } catch (error) {
    container.innerHTML = `<div class="col-12"><div class="alert alert-warning mb-0" role="status">Статиите временно не могат да бъдат заредени.</div></div>`
  }
}
