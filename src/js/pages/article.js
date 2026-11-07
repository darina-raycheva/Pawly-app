import { getArticleCoverUrl, getPublishedArticleBySlug } from '../services/articles.js'
import { renderArticleContent } from '../services/article-content.js'

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export async function renderArticlePage() {
  const container = document.querySelector('[data-article-page]')
  const slug = new URLSearchParams(window.location.search).get('slug')

  if (!slug) {
    container.innerHTML = '<div class="alert alert-warning">Статията не беше намерена.</div>'
    return
  }

  try {
    const article = await getPublishedArticleBySlug(slug)
    if (!article) {
      container.innerHTML = '<div class="alert alert-warning">Статията не беше намерена.</div>'
      return
    }

    const coverUrl = await getArticleCoverUrl(article.cover_image_path)
    container.innerHTML = `
      <article class="pawly-article-detail">
        <a class="pawly-text-link d-inline-flex align-items-center gap-2 mb-4" href="/index.html#tips-title"><i class="bi bi-arrow-left" aria-hidden="true"></i>Назад към статиите</a>
        ${coverUrl ? `<img class="pawly-article-cover mb-4" src="${escapeHtml(coverUrl)}" alt="${escapeHtml(article.title)}" />` : ''}
        <p class="pawly-article-meta mb-2"><time datetime="${escapeHtml(article.created_at)}">${new Date(article.created_at).toLocaleDateString('bg-BG')}</time></p>
        <h1 class="pawly-title display-4 mb-4">${escapeHtml(article.title)}</h1>
        <div class="pawly-article-content">${renderArticleContent(article.content)}</div>
      </article>`
  } catch (error) {
    container.innerHTML = '<div class="alert alert-warning">Статията временно не може да бъде заредена.</div>'
  }
}
