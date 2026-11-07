import { demoPets } from '../demo-data.js'

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function petCard(pet, selectedId) {
  return `
    <button class="pawly-demo-pet-card ${pet.id === selectedId ? 'is-selected' : ''}" type="button" data-demo-pet="${pet.id}" aria-pressed="${pet.id === selectedId}">
      <img src="${pet.image}" alt="Снимка на ${pet.name}" loading="lazy" />
      <span class="pawly-demo-pet-card-body">
        <strong>${pet.name}</strong>
        <small>${pet.species} · ${pet.age}</small>
      </span>
      <i class="bi bi-arrow-up-right" aria-hidden="true"></i>
    </button>`
}

function renderSelectedPet(container, pet) {
  container.innerHTML = `
    <div class="pawly-demo-profile-head">
      <div class="d-flex align-items-center gap-3">
        <img class="pawly-demo-avatar" src="${pet.image}" alt="Снимка на ${pet.name}" />
        <div>
          <p class="pawly-eyebrow mb-1">Активен профил</p>
          <h2 class="pawly-title h3 mb-1">${pet.name}</h2>
          <p class="text-muted mb-0">${pet.species} · ${pet.age}</p>
        </div>
      </div>
      <span class="badge rounded-pill pawly-demo-readonly-badge"><i class="bi bi-eye me-1" aria-hidden="true"></i>Само за преглед</span>
    </div>
    <div class="row g-3 mt-1">
      <div class="col-md-5">
        <div class="pawly-demo-next pawly-demo-next-${pet.color}">
          <p class="small fw-bold mb-2"><i class="bi bi-calendar-heart me-1" aria-hidden="true"></i>Предстояща грижа</p>
          <h3 class="h5 mb-1">${pet.activity}</h3>
          <p class="mb-0">${pet.activityDate}</p>
        </div>
      </div>
      <div class="col-md-7">
        <div class="pawly-demo-record-list">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h3 class="h5 pawly-title mb-0">Последни записи</h3>
            <span class="small text-muted">${pet.records.length} записа</span>
          </div>
          ${pet.records.map((record) => `
            <div class="pawly-demo-record">
              <span class="pawly-demo-record-icon"><i class="bi bi-check2" aria-hidden="true"></i></span>
              <div><strong>${escapeHtml(record.title)}</strong><small>${escapeHtml(record.type)} · ${escapeHtml(record.date)}</small><p>${escapeHtml(record.note)}</p></div>
            </div>`).join('')}
        </div>
      </div>
    </div>`
}

export function renderDemoPage() {
  const container = document.querySelector('[data-demo]')
  if (!container) return
  let selectedId = demoPets[0].id
  container.innerHTML = `
    <div class="pawly-demo-hero mb-4">
      <div>
        <span class="badge rounded-pill pawly-demo-label"><i class="bi bi-stars me-1" aria-hidden="true"></i>Интерактивно демо</span>
        <h1 class="pawly-title display-5 mt-3 mb-2">Pawly — създадено за твоето спокойствие</h1>
        <p class="pawly-subtitle mb-0">Разгледай как можеш да подредиш грижите за любимците си — без регистрация.</p>
      </div>
      <a class="btn btn-primary btn-lg" href="/register.html">Създай своя профил <i class="bi bi-arrow-right ms-2" aria-hidden="true"></i></a>
    </div>
    <div class="alert pawly-demo-notice d-flex align-items-center gap-2 mb-4" role="note"><i class="bi bi-info-circle-fill" aria-hidden="true"></i><span>Това е примерна среда с измислени данни. Тук можеш само да разглеждаш.</span></div>
    <section class="row g-4 mb-4" aria-labelledby="demo-overview-title">
      <div class="col-12"><h2 id="demo-overview-title" class="h4 pawly-title">Твоето табло с един поглед</h2></div>
      <div class="col-sm-4"><div class="card pawly-card pawly-demo-stat h-100"><span class="pawly-demo-stat-icon pawly-icon-sage"><i class="bi bi-paw-fill" aria-hidden="true"></i></span><strong>3</strong><span>любими профила</span></div></div>
      <div class="col-sm-4"><div class="card pawly-card pawly-demo-stat h-100"><span class="pawly-demo-stat-icon pawly-icon-coral"><i class="bi bi-calendar-heart" aria-hidden="true"></i></span><strong>2</strong><span>предстоящи грижи</span></div></div>
      <div class="col-sm-4"><div class="card pawly-card pawly-demo-stat h-100"><span class="pawly-demo-stat-icon pawly-icon-sand"><i class="bi bi-heart-pulse" aria-hidden="true"></i></span><strong>9</strong><span>запазени записа</span></div></div>
    </section>
    <section class="mb-4" aria-labelledby="demo-pets-title">
      <div class="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3"><div><p class="pawly-eyebrow mb-1">Примерни профили</p><h2 id="demo-pets-title" class="h3 pawly-title mb-0">Избери любимец</h2></div><span class="small text-muted">Натисни върху карта, за да разгледаш</span></div>
      <div class="row g-3">${demoPets.map((pet) => `<div class="col-md-4">${petCard(pet, selectedId)}</div>`).join('')}</div>
    </section>
    <section class="card pawly-card p-3 p-md-4 mb-4" aria-labelledby="demo-profile-title"><div data-demo-selected aria-live="polite"></div></section>
    <section class="pawly-demo-bottom-cta text-center"><i class="bi bi-paw-fill" aria-hidden="true"></i><h2 class="pawly-title h3 mt-3 mb-2">Готов ли си да се погрижиш за своя любимец?</h2><p class="text-muted mb-3">Създай свое място за здраве, спомени и спокойствие.</p><a class="btn btn-primary" href="/register.html">Създай своя профил</a></section>`

  const selectedContainer = container.querySelector('[data-demo-selected]')
  const selectPet = (id) => {
    const pet = demoPets.find((item) => item.id === id)
    if (!pet) return
    selectedId = id
    container.querySelectorAll('[data-demo-pet]').forEach((button) => {
      const selected = button.dataset.demoPet === id
      button.classList.toggle('is-selected', selected)
      button.setAttribute('aria-pressed', String(selected))
    })
    renderSelectedPet(selectedContainer, pet)
  }
  container.querySelectorAll('[data-demo-pet]').forEach((button) => button.addEventListener('click', () => selectPet(button.dataset.demoPet)))
  selectPet(selectedId)
}
