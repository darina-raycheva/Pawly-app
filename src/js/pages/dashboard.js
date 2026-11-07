import { requireUser } from '../services/auth.js'
import { listHealthRecords } from '../services/health-records.js'
import { listPets } from '../services/pets.js'

const recordTypeLabels = {
  vaccination: 'Ваксинация',
  checkup: 'Преглед',
  treatment: 'Лечение',
  test: 'Изследване',
  deworming: 'Обезпаразитяване',
  other: 'Друго',
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('bg-BG')
}

function displayName(user) {
  return user.user_metadata?.first_name || user.email?.split('@')[0] || 'там'
}

function renderDashboard(container, user, pets, records) {
  const recentRecords = records.slice(0, 3)
  container.innerHTML = `
    <div class="mb-4">
      <p class="pawly-eyebrow mb-2"><i class="bi bi-sparkle me-1" aria-hidden="true"></i>Добре дошъл в Pawly</p>
      <h1 class="pawly-title display-5 mb-2">Здравей, ${escapeHtml(displayName(user))}!</h1>
      <p class="pawly-subtitle mb-0">Всичко важно за грижата за любимците ти, подредено на едно място.</p>
    </div>
    <div class="alert d-none" data-page-status role="status"></div>
    <div class="row g-4 mb-4">
      <div class="col-12 col-md-6">
        <article class="card pawly-card h-100 p-4">
          <div class="d-flex align-items-center gap-3">
            <div class="pawly-placeholder-icon"><i class="bi bi-paw-fill" aria-hidden="true"></i></div>
            <div><p class="text-muted mb-1">Моите любимци</p><p class="display-6 pawly-title mb-0">${pets.length}</p></div>
          </div>
          <a class="btn btn-outline-primary mt-4 align-self-start" href="/pets.html">Преглед на любимците</a>
        </article>
      </div>
      <div class="col-12 col-md-6">
        <article class="card pawly-card h-100 p-4">
          <div class="d-flex align-items-center gap-3">
            <div class="pawly-placeholder-icon"><i class="bi bi-heart-pulse" aria-hidden="true"></i></div>
            <div><p class="text-muted mb-1">Здравни записи</p><p class="display-6 pawly-title mb-0">${records.length}</p></div>
          </div>
          <a class="btn btn-outline-primary mt-4 align-self-start" href="/health-record.html">Преглед на записите</a>
        </article>
      </div>
    </div>
    <section class="card pawly-card p-4" aria-labelledby="recent-records-title">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 id="recent-records-title" class="h4 pawly-title mb-0">Последни здравни записи</h2>
        <a class="pawly-text-link" href="/health-record.html">Виж всички</a>
      </div>
      ${recentRecords.length ? `<div class="list-group list-group-flush">${recentRecords.map((record) => `
        <div class="list-group-item px-0 py-3 bg-transparent">
          <div class="d-flex justify-content-between gap-3">
            <div><strong>${escapeHtml(record.title)}</strong><p class="text-muted small mb-0">${escapeHtml(record.pets.name)} · ${recordTypeLabels[record.record_type]}</p></div>
            <time class="text-muted small text-nowrap datetime" datetime="${record.record_date}">${formatDate(record.record_date)}</time>
          </div>
        </div>`).join('')}</div>` : '<p class="text-muted mb-0">Все още няма здравни записи. Добави първия запис, за да започнеш.</p>'}
    </section>`
}

export async function renderDashboardPage() {
  const container = document.querySelector('[data-dashboard]')
  try {
    const user = await requireUser()
    if (!user) return
    const [pets, records] = await Promise.all([listPets(), listHealthRecords()])
    renderDashboard(container, user, pets, records)
  } catch (error) {
    container.innerHTML = '<div class="alert alert-danger">Таблото не можа да бъде заредено. Моля, опитай отново.</div>'
  }
}
