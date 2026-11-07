import { Modal } from 'bootstrap'
import { requireAdmin } from '../services/authorization.js'
import {
  createArticle,
  deleteArticle,
  getArticleCoverUrl,
  listArticles,
  removeArticleCover,
  updateArticle,
  uploadArticleCover,
} from '../services/articles.js'
import { renderArticleContent, sanitizeArticleHtml } from '../services/article-content.js'

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function setStatus(element, type, message) {
  element.className = `alert alert-${type}`
  element.textContent = message
}

function getArticleSaveErrorMessage(error) {
  if (error?.name === 'StorageApiError' && error?.message?.toLowerCase().includes('bucket not found')) {
    return 'Качването на корицата е недостъпно: Storage bucket-ът „article-covers“ не е създаден. Създайте го като private bucket в Supabase Dashboard.'
  }

  if (
    error?.name === 'StorageApiError'
    && (error?.message?.toLowerCase().includes('mime type') || error?.statusCode === 415)
  ) {
    return 'Форматът на корицата не е разрешен от Storage bucket-а. Разрешете image/jpeg, image/png и image/webp за bucket „article-covers“.'
  }

  if (error?.name === 'StorageApiError' && (error?.status === 401 || error?.status === 403)) {
    return 'Нямате права да качвате корици. Проверете Storage policy-ите и администраторската си роля.'
  }

  if (error?.code === '23505' && error?.constraint === 'articles_slug_key') {
    return 'Този slug вече се използва. Въведете уникален slug за статията.'
  }

  if (error?.code === '42501' || error?.status === 403) {
    return 'Нямате права да запазвате статии. Проверете администраторската си роля.'
  }

  if (error?.status === 413 || error?.message?.toLowerCase().includes('payload too large')) {
    return 'Изображението е твърде голямо. Изберете файл до 5 MB.'
  }

  if (error?.message === 'Въведете съдържание на статията.') {
    return error.message
  }

  if (error?.message?.startsWith('Изберете') || error?.message?.startsWith('Изображението')) {
    return error.message
  }

  return 'Статията не можа да бъде запазена. Проверете данните и опитайте отново.'
}

const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp']
const maxImageSize = 5 * 1024 * 1024

function getSafeFileName(file) {
  const extensions = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }
  const extension = extensions[file.type] || 'jpg'
  return `${crypto.randomUUID()}.${extension}`
}

function validateCover(file) {
  if (!file) return null
  if (!allowedImageTypes.includes(file.type)) return 'Изберете JPG, PNG или WebP изображение.'
  if (file.size > maxImageSize) return 'Изображението трябва да бъде до 5 MB.'
  return null
}

function articleRow(article) {
  return `<tr>
    <td><strong>${escapeHtml(article.title)}</strong><div class="small text-muted">${escapeHtml(article.slug)}</div></td>
    <td><span class="badge ${article.published ? 'text-bg-success' : 'text-bg-secondary'}">${article.published ? 'Публикувана' : 'Чернова'}</span></td>
    <td class="text-muted">${new Date(article.updated_at).toLocaleDateString('bg-BG')}</td>
    <td class="text-end text-nowrap">
      <button class="btn btn-sm btn-outline-primary me-1" type="button" data-edit-article="${article.id}"><i class="bi bi-pencil" aria-hidden="true"></i><span class="visually-hidden">Редактиране</span></button>
      <button class="btn btn-sm btn-outline-danger" type="button" data-delete-article="${article.id}"><i class="bi bi-trash" aria-hidden="true"></i><span class="visually-hidden">Изтриване</span></button>
    </td>
  </tr>`
}

function renderAdmin(container, user, articles) {
  let currentArticles = articles
  const publishedCount = currentArticles.filter((article) => article.published).length
  container.innerHTML = `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div><p class="pawly-eyebrow mb-2"><i class="bi bi-shield-check me-1" aria-hidden="true"></i>Администраторска зона</p>
      <h1 class="pawly-title display-5 mb-2">Статии</h1><p class="pawly-subtitle mb-0">Управлявайте полезното съдържание на Pawly.</p></div>
      <button class="btn btn-primary" type="button" data-new-article><i class="bi bi-plus-lg me-2" aria-hidden="true"></i>Нова статия</button>
    </div>
    <div class="alert d-none" data-admin-status role="status"></div>
    <div class="row g-4 mb-4">
      <div class="col-sm-6"><article class="card pawly-card p-4"><p class="text-muted mb-1">Всички статии</p><p class="display-6 pawly-title mb-0" data-total-articles>${currentArticles.length}</p></article></div>
      <div class="col-sm-6"><article class="card pawly-card p-4"><p class="text-muted mb-1">Публикувани</p><p class="display-6 pawly-title mb-0" data-published-articles>${publishedCount}</p></article></div>
    </div>
    <section class="card pawly-card p-3 p-md-4" aria-labelledby="admin-articles-title">
      <h2 id="admin-articles-title" class="h4 pawly-title mb-3">Списък със статии</h2>
      <div data-article-list>${currentArticles.length ? `<div class="table-responsive"><table class="table align-middle"><thead><tr><th>Заглавие</th><th>Статус</th><th>Обновена</th><th><span class="visually-hidden">Действия</span></th></tr></thead><tbody>${currentArticles.map(articleRow).join('')}</tbody></table></div>` : '<div class="pawly-placeholder"><div><div class="pawly-placeholder-icon mb-3"><i class="bi bi-journal-plus" aria-hidden="true"></i></div><p class="text-muted mb-0">Все още няма създадени статии.</p></div></div>'}</div>
    </section>
    <div class="modal fade" id="articleModal" tabindex="-1" aria-labelledby="article-modal-title" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-scrollable pawly-article-modal-dialog"><div class="modal-content pawly-card pawly-article-modal-content">
        <div class="modal-header"><h2 class="modal-title h4 pawly-title" id="article-modal-title">Нова статия</h2><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Затвори"></button></div>
        <form data-article-form novalidate><div class="modal-body">
          <input type="hidden" name="id" />
          <div class="mb-3"><label class="form-label" for="article-title">Заглавие</label><input class="form-control" id="article-title" name="title" maxlength="200" required /></div>
          <div class="mb-3"><label class="form-label" for="article-slug">Адрес (slug)</label><input class="form-control" id="article-slug" name="slug" maxlength="200" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" required /><div class="form-text">Използвайте латински букви, цифри и тирета.</div></div>
          <div class="mb-3"><label class="form-label" for="article-excerpt">Кратко описание</label><textarea class="form-control" id="article-excerpt" name="excerpt" maxlength="500" rows="3" required></textarea></div>
          <div class="mb-3"><label class="form-label" for="article-cover">Корица</label><input class="form-control" id="article-cover" name="cover" type="file" accept="image/jpeg,image/png,image/webp" /><div class="form-text">JPG, PNG или WebP до 5 MB.</div><div class="mt-3 d-none" data-cover-preview-container><img class="pawly-admin-cover-preview" data-cover-preview alt="Преглед на корицата" /></div><div class="form-check mt-3 d-none" data-remove-cover-container><input class="form-check-input" id="article-remove-cover" name="removeCover" type="checkbox" /><label class="form-check-label" for="article-remove-cover">Премахни текущата корица</label></div></div>
          <div class="mb-3"><label class="form-label" for="article-content-editor">Съдържание</label><div class="pawly-editor-toolbar" role="toolbar" aria-label="Форматиране на съдържанието">
            <select class="form-select form-select-sm" data-editor-block aria-label="Стил на текста"><option value="p">Абзац</option><option value="h2">Заглавие 2</option><option value="h3">Заглавие 3</option></select>
            <button class="btn btn-sm btn-light" type="button" data-editor-command="bold" title="Получер"><i class="bi bi-type-bold" aria-hidden="true"></i><span class="visually-hidden">Получер</span></button>
            <button class="btn btn-sm btn-light" type="button" data-editor-command="italic" title="Курсив"><i class="bi bi-type-italic" aria-hidden="true"></i><span class="visually-hidden">Курсив</span></button>
            <button class="btn btn-sm btn-light" type="button" data-editor-command="underline" title="Подчертан"><i class="bi bi-type-underline" aria-hidden="true"></i><span class="visually-hidden">Подчертан</span></button>
            <button class="btn btn-sm btn-light" type="button" data-editor-command="insertUnorderedList" title="Маркиран списък"><i class="bi bi-list-ul" aria-hidden="true"></i><span class="visually-hidden">Маркиран списък</span></button>
            <button class="btn btn-sm btn-light" type="button" data-editor-command="insertOrderedList" title="Номериран списък"><i class="bi bi-list-ol" aria-hidden="true"></i><span class="visually-hidden">Номериран списък</span></button>
            <button class="btn btn-sm btn-light" type="button" data-editor-link title="Добави връзка"><i class="bi bi-link-45deg" aria-hidden="true"></i><span class="visually-hidden">Добави връзка</span></button>
            <button class="btn btn-sm btn-light" type="button" data-editor-command="justifyLeft" title="Подравни вляво"><i class="bi bi-text-left" aria-hidden="true"></i><span class="visually-hidden">Подравни вляво</span></button>
            <button class="btn btn-sm btn-light" type="button" data-editor-command="justifyCenter" title="Центрирай"><i class="bi bi-text-center" aria-hidden="true"></i><span class="visually-hidden">Центрирай</span></button>
            <button class="btn btn-sm btn-light" type="button" data-editor-command="justifyRight" title="Подравни вдясно"><i class="bi bi-text-right" aria-hidden="true"></i><span class="visually-hidden">Подравни вдясно</span></button>
            <button class="btn btn-sm btn-light" type="button" data-editor-command="undo" title="Отмени"><i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i><span class="visually-hidden">Отмени</span></button>
            <button class="btn btn-sm btn-light" type="button" data-editor-command="redo" title="Повтори"><i class="bi bi-arrow-clockwise" aria-hidden="true"></i><span class="visually-hidden">Повтори</span></button>
            <button class="btn btn-sm btn-light" type="button" data-editor-command="removeFormat" title="Изчисти форматирането"><i class="bi bi-eraser" aria-hidden="true"></i><span class="visually-hidden">Изчисти форматирането</span></button>
          </div><div class="pawly-rich-editor" id="article-content-editor" data-article-editor contenteditable="true" role="textbox" aria-multiline="true" aria-label="Съдържание на статията"></div><textarea class="d-none" name="content" data-article-content-required></textarea><div class="form-text">Изберете текст и използвайте бутоните или стандартните клавишни комбинации за форматиране.</div></div>
          <div class="form-check"><input class="form-check-input" id="article-published" name="published" type="checkbox" /><label class="form-check-label" for="article-published">Публикувана на началната страница</label></div>
          <div class="alert d-none mt-3" data-form-status role="alert"></div>
        </div><div class="modal-footer"><button class="btn btn-outline-secondary" type="button" data-bs-dismiss="modal">Отказ</button><button class="btn btn-primary" type="submit">Запази</button></div></form>
      </div></div>
    </div>`

  const modal = new Modal(container.querySelector('#articleModal'))
  const form = container.querySelector('[data-article-form]')
  const status = container.querySelector('[data-admin-status]')
  const formStatus = container.querySelector('[data-form-status]')
  const titleInput = form.elements.title
  const editor = container.querySelector('[data-article-editor]')
  const editorBlock = container.querySelector('[data-editor-block]')
  const coverInput = form.elements.cover
  const coverPreviewContainer = container.querySelector('[data-cover-preview-container]')
  const coverPreview = container.querySelector('[data-cover-preview]')
  const removeCoverContainer = container.querySelector('[data-remove-cover-container]')
  let previewUrl = null

  async function openForm(article) {
    form.reset()
    form.elements.id.value = article?.id || ''
    form.elements.title.value = article?.title || ''
    form.elements.slug.value = article?.slug || ''
    form.elements.excerpt.value = article?.excerpt || ''
    editor.innerHTML = renderArticleContent(article?.content || '')
    form.elements.published.checked = Boolean(article?.published)
    removeCoverContainer.classList.toggle('d-none', !article?.cover_image_path)
    coverPreviewContainer.classList.add('d-none')
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    previewUrl = null
    if (article?.cover_image_path) {
      try {
        coverPreview.src = await getArticleCoverUrl(article.cover_image_path)
        coverPreviewContainer.classList.remove('d-none')
      } catch (error) {
        coverPreview.removeAttribute('src')
      }
    }
    container.querySelector('#article-modal-title').textContent = article ? 'Редактиране на статия' : 'Нова статия'
    formStatus.className = 'alert d-none'
    modal.show()
  }

  const runEditorCommand = (command, value = null) => {
    editor.focus()
    document.execCommand(command, false, value)
  }

  container.querySelectorAll('[data-editor-command]').forEach((button) => {
    button.addEventListener('mousedown', (event) => event.preventDefault())
    button.addEventListener('click', () => runEditorCommand(button.dataset.editorCommand))
  })
  editorBlock.addEventListener('change', () => runEditorCommand('formatBlock', editorBlock.value))
  container.querySelector('[data-editor-link]').addEventListener('click', () => {
    const url = window.prompt('Въведете URL адрес:', 'https://')
    if (url) runEditorCommand('createLink', url.trim())
  })

  coverInput.addEventListener('change', () => {
    const file = coverInput.files[0]
    const validationError = validateCover(file)
    if (validationError) {
      coverInput.value = ''
      setStatus(formStatus, 'danger', validationError)
      coverPreviewContainer.classList.add('d-none')
      return
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    previewUrl = file ? URL.createObjectURL(file) : null
    if (previewUrl) {
      coverPreview.src = previewUrl
      coverPreviewContainer.classList.remove('d-none')
    }
  })

  titleInput.addEventListener('blur', () => {
    if (!form.elements.id.value && !form.elements.slug.value) form.elements.slug.value = slugify(titleInput.value)
  })
  container.querySelector('[data-new-article]').addEventListener('click', () => openForm())
  container.querySelector('[data-article-list]').addEventListener('click', (event) => {
    const editButton = event.target.closest('[data-edit-article]')
    const deleteButton = event.target.closest('[data-delete-article]')
    if (editButton) openForm(currentArticles.find((article) => article.id === editButton.dataset.editArticle))
    if (deleteButton) handleDelete(deleteButton.dataset.deleteArticle)
  })
  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (!form.reportValidity()) return
    const button = form.querySelector('button[type="submit"]')
    button.disabled = true
    try {
      const payload = {
        title: form.elements.title.value.trim(),
        slug: form.elements.slug.value.trim(),
        excerpt: form.elements.excerpt.value.trim(),
        content: sanitizeArticleHtml(editor.innerHTML),
        published: form.elements.published.checked,
      }
      const selectedCover = coverInput.files[0]
      const coverError = validateCover(selectedCover)
      if (coverError) throw new Error(coverError)
      if (!editor.textContent.trim()) throw new Error('Въведете съдържание на статията.')
      const existingArticle = currentArticles.find((article) => article.id === form.elements.id.value)
      const duplicateSlug = currentArticles.find(
        (article) => article.slug === payload.slug && article.id !== form.elements.id.value,
      )
      if (duplicateSlug) {
        const duplicateError = new Error('Този slug вече се използва. Въведете уникален slug за статията.')
        duplicateError.code = '23505'
        duplicateError.constraint = 'articles_slug_key'
        throw duplicateError
      }
      let coverPath = existingArticle?.cover_image_path || null
      if (form.elements.removeCover.checked) coverPath = null
      let savedArticle
      let uploadedCoverPath = null
      if (selectedCover) {
        uploadedCoverPath = `${user.id}/${getSafeFileName(selectedCover)}`
        await uploadArticleCover(uploadedCoverPath, selectedCover)
        coverPath = uploadedCoverPath
      }

      try {
        if (form.elements.id.value) {
          savedArticle = await updateArticle(form.elements.id.value, { ...payload, cover_image_path: coverPath })
        } else {
          savedArticle = await createArticle({ ...payload, author_id: user.id, cover_image_path: coverPath })
        }
      } catch (error) {
        if (uploadedCoverPath) {
          await removeArticleCover(uploadedCoverPath).catch((cleanupError) => {
            console.error('Pawly: uploaded cover cleanup failed', cleanupError)
          })
        }
        throw error
      }

      if (coverPath && coverPath !== existingArticle?.cover_image_path) {
        if (existingArticle?.cover_image_path) await removeArticleCover(existingArticle.cover_image_path)
      } else if (form.elements.removeCover.checked && existingArticle?.cover_image_path) {
        await removeArticleCover(existingArticle.cover_image_path)
      }
      modal.hide()
      await load()
      setStatus(status, 'success', 'Статията е запазена.')
    } catch (error) {
      console.error('Pawly: article save failed', {
        error,
        articleId: form.elements.id.value || null,
        slug: form.elements.slug.value.trim(),
        hasCover: Boolean(coverInput.files[0]),
      })
      setStatus(formStatus, 'danger', getArticleSaveErrorMessage(error))
    } finally {
      button.disabled = false
    }
  })

  async function handleDelete(id) {
    if (!window.confirm('Сигурни ли сте, че искате да изтриете тази статия?')) return
    try {
      const article = currentArticles.find((item) => item.id === id)
      await deleteArticle(id)
      if (article?.cover_image_path) await removeArticleCover(article.cover_image_path)
      await load()
      setStatus(status, 'success', 'Статията е изтрита.')
    } catch (error) {
      setStatus(status, 'danger', 'Статията не можа да бъде изтрита.')
    }
  }

  async function load() {
    const freshArticles = await listArticles()
    currentArticles = freshArticles
    container.querySelector('[data-total-articles]').textContent = freshArticles.length
    container.querySelector('[data-published-articles]').textContent = freshArticles.filter((article) => article.published).length
    const list = container.querySelector('[data-article-list]')
    list.innerHTML = freshArticles.length
      ? `<div class="table-responsive"><table class="table align-middle"><thead><tr><th>Заглавие</th><th>Статус</th><th>Обновена</th><th><span class="visually-hidden">Действия</span></th></tr></thead><tbody>${freshArticles.map(articleRow).join('')}</tbody></table></div>`
      : '<div class="pawly-placeholder"><div><div class="pawly-placeholder-icon mb-3"><i class="bi bi-journal-plus" aria-hidden="true"></i></div><p class="text-muted mb-0">Все още няма създадени статии.</p></div></div>'
  }
}

export async function renderAdminPage() {
  const container = document.querySelector('[data-admin]')
  container.innerHTML = '<div class="pawly-placeholder"><div><div class="pawly-placeholder-icon mb-3"><i class="bi bi-hourglass-split" aria-hidden="true"></i></div><p class="text-muted mb-0">Зареждаме административния панел…</p></div></div>'
  try {
    const user = await requireAdmin()
    if (!user) return
    renderAdmin(container, user, await listArticles())
  } catch (error) {
    container.innerHTML = '<div class="alert alert-danger">Административният панел не можа да бъде зареден.</div>'
  }
}
