import { requireUser, signOut, updateUserProfile } from '../services/auth.js'

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function setStatus(element, type, message) {
  element.className = `alert alert-${type}`
  element.textContent = message
}

function renderProfile(container, user) {
  const firstName = user.user_metadata?.first_name || ''
  const lastName = user.user_metadata?.last_name || ''
  container.innerHTML = `
    <div class="mb-4">
      <p class="pawly-eyebrow mb-2"><i class="bi bi-person-heart me-1" aria-hidden="true"></i>Твоят Pawly профил</p>
      <h1 class="pawly-title display-5 mb-2">Профил</h1>
      <p class="pawly-subtitle mb-0">Поддържай данните си актуални и управлявай достъпа си.</p>
    </div>
    <div class="alert d-none" data-page-status role="status"></div>
    <div class="row g-4">
      <div class="col-12 col-lg-8">
        <form class="card pawly-card p-4" data-profile-form novalidate>
          <h2 class="h4 pawly-title mb-4">Лични данни</h2>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label" for="profile-first-name">Име</label>
              <input class="form-control" id="profile-first-name" name="firstName" maxlength="100" value="${escapeHtml(firstName)}" />
            </div>
            <div class="col-md-6">
              <label class="form-label" for="profile-last-name">Фамилия</label>
              <input class="form-control" id="profile-last-name" name="lastName" maxlength="100" value="${escapeHtml(lastName)}" />
            </div>
            <div class="col-12">
              <label class="form-label" for="profile-email">Имейл</label>
              <input class="form-control" id="profile-email" type="email" value="${escapeHtml(user.email || '')}" readonly />
              <div class="form-text">Имейлът се използва за вход и не може да се променя от тази страница.</div>
            </div>
          </div>
          <button class="btn btn-primary mt-4" type="submit">Запази промените</button>
        </form>
      </div>
      <div class="col-12 col-lg-4">
        <section class="card pawly-card p-4 h-100" aria-labelledby="account-actions-title">
          <h2 id="account-actions-title" class="h4 pawly-title mb-3">Акаунт</h2>
          <p class="text-muted">Излез от Pawly на това устройство.</p>
          <button class="btn btn-outline-danger" type="button" data-sign-out><i class="bi bi-box-arrow-right me-2" aria-hidden="true"></i>Изход</button>
        </section>
      </div>
    </div>`

  const form = container.querySelector('[data-profile-form]')
  const status = container.querySelector('[data-page-status]')
  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const button = form.querySelector('button[type="submit"]')
    button.disabled = true
    button.setAttribute('aria-busy', 'true')
    try {
      await updateUserProfile({
        firstName: form.elements.firstName.value.trim(),
        lastName: form.elements.lastName.value.trim(),
      })
      setStatus(status, 'success', 'Промените по профила са запазени.')
    } catch (error) {
      setStatus(status, 'danger', 'Профилът не можа да бъде обновен. Моля, опитай отново.')
    } finally {
      button.disabled = false
      button.removeAttribute('aria-busy')
    }
  })

  container.querySelector('[data-sign-out]').addEventListener('click', async (event) => {
    const button = event.currentTarget
    button.disabled = true
    try {
      await signOut()
      window.location.assign('/login.html')
    } catch (error) {
      button.disabled = false
      setStatus(status, 'danger', 'Изходът не беше успешен. Моля, опитай отново.')
    }
  })
}

export async function renderProfilePage() {
  const container = document.querySelector('[data-profile]')
  try {
    const user = await requireUser()
    if (!user) return
    renderProfile(container, user)
  } catch (error) {
    container.innerHTML = '<div class="alert alert-danger">Профилът не можа да бъде зареден. Моля, опитай отново.</div>'
  }
}
