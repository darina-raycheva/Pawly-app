import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import { Modal } from 'bootstrap'
import './style.css'
import { renderAuthPage } from './js/pages/auth.js'
import { renderPetsPage } from './js/pages/pets.js'
import { renderPetDetailsPage } from './js/pages/pet-details.js'
import { renderHealthRecordsPage } from './js/pages/health-records.js'
import { renderDashboardPage } from './js/pages/dashboard.js'
import { renderProfilePage } from './js/pages/profile.js'
import { renderAdminPage } from './js/pages/admin.js'
import { renderPublicArticles } from './js/pages/home.js'
import { renderArticlePage } from './js/pages/article.js'
import { renderMomentsPage } from './js/pages/moments.js'
import { renderDemoPage } from './js/pages/demo.js'
import { isCurrentUserAdmin } from './js/services/authorization.js'
import { getSupabaseClient } from './js/services/supabase.js'

const page = document.body.dataset.page || 'Home'
const pageLabels = {
  Home: 'Начало',
  Login: 'Вход',
  Register: 'Регистрация',
  Dashboard: 'Табло',
  Pets: 'Домашни любимци',
  'Pet Details': 'Подробности за любимец',
  'Health Record': 'Здравни записи',
  Profile: 'Профил',
  Admin: 'Администрация',
  Article: 'Статия',
  Moments: 'Pawly Moments',
  Demo: 'Демо',
}
const pageLabel = pageLabels[page] || pageLabels.Home

const pawlyLogo = `
  <span class="pawly-logo-paw" aria-hidden="true">
    <svg viewBox="4 2 24 22" focusable="false">
      <path d="M10.2 14.2c-2.2 1.1-4.9-.2-5.3-2.6-.4-2.2 1.1-4.2 3.2-4.5 2.3-.3 4.1 1.7 3.8 4-.2 1.4-.8 2.5-1.7 3.1Zm11.6 0c2.2 1.1 4.9-.2 5.3-2.6.4-2.2-1.1-4.2-3.2-4.5-2.3-.3-4.1 1.7-3.8 4 .2 1.4.8 2.5 1.7 3.1ZM15 10.2c-2 .2-3.7-1.5-3.7-3.6S12.7 2.8 14.7 3c1.9.2 3.1 2.1 2.8 4-.3 1.7-1.1 2.9-2.5 3.2Zm2 0c2 .2 3.7-1.5 3.7-3.6S19.3 2.8 17.3 3c-1.9.2-3.1 2.1-2.8 4 .3 1.7 1.1 2.9 2.5 3.2ZM16 12c-3.7 0-7.3 3.5-7.3 7.3 0 2.5 1.8 4.1 4.2 3.7 1.2-.2 2.1-.8 3.1-.8s1.9.6 3.1.8c2.4.4 4.2-1.2 4.2-3.7C23.3 15.5 19.7 12 16 12Z"/>
    </svg>
  </span>
  <span class="pawly-logo-word">Pawly</span>
`

const homePageContent = `
  <section class="pawly-hero" aria-labelledby="hero-title">
    <div class="row align-items-center g-4">
      <div class="col-lg-6">
        <p class="pawly-eyebrow mb-2 reveal">Техният свят. Твоето спокойствие.</p>
        <h1 id="hero-title" class="pawly-title display-3 mb-3 reveal"><span>По-лесна грижа.</span> <span class="pawly-accent">Повече време заедно.</span></h1>
        <p class="pawly-subtitle lead mb-3 reveal">Pawly е твоят дигитален помощник — помага да подредиш здравето, важните записи и ежедневните грижи за твоя любимец.</p>
        <div class="d-flex flex-wrap gap-3 align-items-center reveal">
          <a class="btn btn-primary btn-lg" href="/register.html">Създай профил <i class="bi bi-arrow-right ms-2" aria-hidden="true"></i></a>
          <a class="pawly-text-link fw-bold px-2" href="#features">Разгледай Pawly <i class="bi bi-chevron-down ms-1" aria-hidden="true"></i></a>
        </div>
        <div class="d-flex flex-wrap gap-4 mt-3 pawly-trust-list reveal">
          <span><i class="bi bi-check-circle-fill me-2" aria-hidden="true"></i>Всичко на едно място</span>
          <span><i class="bi bi-check-circle-fill me-2" aria-hidden="true"></i>Най-важното винаги под ръка.</span>
        </div>
      </div>
      <div class="col-lg-6 reveal">
        <div class="pawly-hero-visual">
          <div class="pawly-hero-shape pawly-hero-shape-one"></div>
          <div class="pawly-hero-shape pawly-hero-shape-two"></div>
          <div class="pawly-pet-portrait" aria-label="Илюстрация на усмихнато куче">
            <div class="pawly-pet-ear pawly-pet-ear-left"></div>
            <div class="pawly-pet-ear pawly-pet-ear-right"></div>
            <div class="pawly-pet-face">
              <span class="pawly-pet-eye pawly-pet-eye-left"></span>
              <span class="pawly-pet-eye pawly-pet-eye-right"></span>
              <span class="pawly-pet-muzzle"><i class="bi bi-heart-fill" aria-hidden="true"></i></span>
            </div>
          </div>
          <div class="card pawly-hero-card pawly-hero-card-vaccine">
            <div class="d-flex align-items-center gap-2 mb-2"><span class="pawly-mini-icon pawly-mini-icon-coral"><i class="bi bi-shield-check" aria-hidden="true"></i></span><span class="small fw-bold">Следваща ваксина</span></div>
            <div class="d-flex justify-content-between align-items-end"><strong class="h5 mb-0">12 юни</strong><span class="badge rounded-pill text-bg-light">Напомняне</span></div>
          </div>
          <div class="card pawly-hero-card pawly-hero-card-health">
            <div class="d-flex align-items-center gap-2"><span class="pawly-mini-icon pawly-mini-icon-sage"><i class="bi bi-heart-pulse" aria-hidden="true"></i></span><span class="small fw-bold">Здравен запис</span><i class="bi bi-check-circle-fill ms-auto pawly-check-icon" aria-hidden="true"></i></div>
          </div>
          <div class="card pawly-hero-card pawly-hero-card-photos">
            <div class="d-flex align-items-center gap-2"><span class="pawly-mini-icon pawly-mini-icon-sand"><i class="bi bi-images" aria-hidden="true"></i></span><span class="small fw-bold">Профил на любимеца</span><span class="badge rounded-pill pawly-count-badge ms-auto">24</span></div>
          </div>
          <div class="pawly-hero-sparkle pawly-sparkle-one"><i class="bi bi-stars" aria-hidden="true"></i></div>
          <div class="pawly-hero-sparkle pawly-sparkle-two"><i class="bi bi-heart-fill" aria-hidden="true"></i></div>
        </div>
      </div>
    </div>
  </section>

  <section id="features" class="py-5" aria-labelledby="features-title">
    <div class="text-center mb-5 reveal">
      <p class="pawly-eyebrow mb-2">Твоят помощник за грижа</p>
      <h2 id="features-title" class="pawly-title display-6 mb-3">Всичко за любимеца ти, подредено с любов</h2>
      <p class="pawly-subtitle mx-auto pawly-section-intro">Една ясна и спокойна система за онези неща, които искаш винаги да са под ръка.</p>
    </div>
    <div class="row g-4">
      <div class="col-md-4 reveal">
        <article class="card pawly-card pawly-feature-card h-100">
          <div class="card-body p-4">
            <div class="pawly-icon-box pawly-icon-sage mb-4"><i class="bi bi-heart-pulse" aria-hidden="true"></i></div>
            <h3 class="h4 pawly-title mb-3">Здраве без хаос</h3>
            <p class="text-muted mb-0">Следи прегледи, ваксини и важни здравни събития на едно място.</p>
          </div>
        </article>
      </div>
      <div class="col-md-4 reveal">
        <article class="card pawly-card pawly-feature-card h-100">
          <div class="card-body p-4">
            <div class="pawly-icon-box pawly-icon-coral mb-4"><i class="bi bi-images" aria-hidden="true"></i></div>
            <h3 class="h4 pawly-title mb-3">Pawly Moments — Спомени, създадени с любов</h3>
            <p class="text-muted mb-0">Превърни любимите си снимки в красиви колажи и персонализирани картички.</p>
            <a class="pawly-text-link d-inline-flex align-items-center gap-2 mt-3" href="/moments.html" data-moments-cta>Създай момент <i class="bi bi-arrow-right" aria-hidden="true"></i></a>
          </div>
        </article>
      </div>
      <div class="col-md-4 reveal">
        <article class="card pawly-card pawly-feature-card h-100">
          <div class="card-body p-4">
            <div class="pawly-icon-box pawly-icon-sand mb-4"><i class="bi bi-stars" aria-hidden="true"></i></div>
            <h3 class="h4 pawly-title mb-3">Грижа, която расте с теб</h3>
            <p class="text-muted mb-0">Създай отделен профил за всеки свой любимец.</p>
          </div>
        </article>
      </div>
    </div>
  </section>

  <section class="pawly-why-section py-5 px-4 px-md-5 my-4 reveal" aria-labelledby="why-title">
    <div class="row align-items-center g-4">
      <div class="col-lg-5">
        <p class="pawly-eyebrow mb-2">Защо Pawly?</p>
        <h2 id="why-title" class="pawly-title display-6 mb-3">Защото грижата е в малките неща.</h2>
        <p class="text-muted mb-0">Pawly е създаден за хора, които искат да се грижат по-добре, без това да се превръща в още една сложна задача.</p>
      </div>
      <div class="col-lg-6 offset-lg-1">
        <div class="d-flex gap-3 mb-4"><div class="pawly-step-number">01</div><div><h3 class="h5 pawly-title mb-1">Яснота в ежедневието</h3><p class="text-muted mb-0">Виждаш важните детайли, когато ти потрябват.</p></div></div>
        <div class="d-flex gap-3 mb-4"><div class="pawly-step-number">02</div><div><h3 class="h5 pawly-title mb-1">Повече спокойствие</h3><p class="text-muted mb-0">Подредената информация прави грижата по-лека.</p></div></div>
        <div class="d-flex gap-3"><div class="pawly-step-number">03</div><div><h3 class="h5 pawly-title mb-1">Повече щастливи моменти</h3><p class="text-muted mb-0">Остават ти повече минути за игра, разходки и гушкане.</p></div></div>
      </div>
    </div>
  </section>

  <section class="pawly-demo-intro py-5 my-4" aria-labelledby="demo-intro-title">
    <div class="text-center mb-4 reveal">
      <p class="pawly-eyebrow mb-2"><i class="bi bi-stars me-1" aria-hidden="true"></i>Разгледай Pawly отвътре</p>
      <h2 id="demo-intro-title" class="pawly-title display-6 mb-3">Запознай се с Pawly отвътре</h2>
      <p class="pawly-subtitle mx-auto pawly-section-intro mb-0">Виж колко лесно можеш да организираш грижите за своя любимец. Разгледай примерни профили, здравни записи и важни събития — без регистрация.</p>
    </div>
    <div class="row g-4 mb-4">
      <div class="col-md-4 reveal">
        <article class="card pawly-card pawly-demo-intro-card h-100">
          <img src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=700&q=85" alt="Бела, Golden Retriever" loading="lazy" />
          <div class="card-body p-4"><p class="pawly-eyebrow mb-1">Бела</p><h3 class="h4 pawly-title mb-2">Golden Retriever</h3><p class="text-muted mb-3">2 години · следваща ваксинация</p><span class="small fw-bold text-success"><i class="bi bi-calendar-check me-1" aria-hidden="true"></i>12 юни 2026</span></div>
        </article>
      </div>
      <div class="col-md-4 reveal">
        <article class="card pawly-card pawly-demo-intro-card h-100">
          <img src="https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=700&q=85" alt="Луна, British Shorthair" loading="lazy" />
          <div class="card-body p-4"><p class="pawly-eyebrow mb-1">Луна</p><h3 class="h4 pawly-title mb-2">British Shorthair</h3><p class="text-muted mb-3">3 години · преглед при ветеринар</p><span class="small fw-bold text-success"><i class="bi bi-calendar-check me-1" aria-hidden="true"></i>24 юни 2026</span></div>
        </article>
      </div>
      <div class="col-md-4 reveal">
        <article class="card pawly-card pawly-demo-intro-card h-100">
          <img src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=700&q=85" alt="Роки, French Bulldog" loading="lazy" />
          <div class="card-body p-4"><p class="pawly-eyebrow mb-1">Роки</p><h3 class="h4 pawly-title mb-2">French Bulldog</h3><p class="text-muted mb-3">1 година · контролен преглед</p><span class="small fw-bold text-success"><i class="bi bi-calendar-check me-1" aria-hidden="true"></i>03 юли 2026</span></div>
        </article>
      </div>
    </div>
    <div class="text-center"><a class="btn btn-primary btn-lg" href="/demo.html">Разгледай демото <i class="bi bi-arrow-right ms-2" aria-hidden="true"></i></a></div>
  </section>

  <section class="py-5" aria-labelledby="tips-title">
    <div class="pawly-tips-header d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4 reveal">
      <div class="pawly-tips-heading"><p class="pawly-eyebrow mb-2">Полезно за теб</p><h2 id="tips-title" class="pawly-title display-6 mb-0">Малки идеи за голяма грижа</h2></div>
      <span class="pawly-tips-label text-muted">Съвети от Pawly</span>
    </div>
    <div class="row g-4" data-public-articles>
      <div class="col-12"><div class="pawly-placeholder py-5"><div><div class="pawly-placeholder-icon mb-3"><i class="bi bi-hourglass-split" aria-hidden="true"></i></div><p class="text-muted mb-0">Зареждаме полезните статии…</p></div></div></div>
    </div>
  </section>

  <section class="pawly-cta text-center my-5 reveal" aria-labelledby="cta-title">
    <div class="pawly-cta-paw" aria-hidden="true"><i class="bi bi-paw-fill"></i></div>
    <h2 id="cta-title" class="pawly-title display-6 mb-3">Готов ли си да опиташ Pawly?</h2>
    <p class="pawly-subtitle mb-4">Създай своето място за грижа безплатно и само за няколко минути.</p>
    <a class="btn btn-primary btn-lg" href="/register.html">Започнете сега <i class="bi bi-arrow-right ms-2" aria-hidden="true"></i></a>
  </section>
<footer class="pawly-footer py-4"><div class="container d-flex flex-wrap justify-content-between align-items-center gap-3"><a class="pawly-brand text-decoration-none" href="/index.html">${pawlyLogo}</a><span class="text-muted small">Създадено с любов за твоя любимец.</span></div></footer>
`

if (page === 'Login' || page === 'Register') {
  renderAuthPage(page)
} else {
const pageContent = page === 'Home'
  ? homePageContent
  : page === 'Dashboard'
  ? '<div data-dashboard></div>'
  : page === 'Profile'
    ? '<div data-profile></div>'
    : page === 'Admin'
      ? '<div data-admin></div>'
      : page === 'Article'
        ? '<div data-article-page></div>'
        : page === 'Moments'
          ? '<div data-moments></div>'
            : page === 'Demo'
              ? '<div data-demo></div>'
    : page === 'Pets'
  ? `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div><p class="pawly-eyebrow mb-2"><i class="bi bi-sparkle me-1" aria-hidden="true"></i>Грижата за любимеца е лесна</p><h1 class="pawly-title display-5 mb-2">Моите любимци</h1><p class="pawly-subtitle mb-0">Всички профили на любимците ти на едно място.</p></div>
      <button class="btn btn-primary" type="button" data-add-pet><i class="bi bi-plus-lg me-2" aria-hidden="true"></i>Добави любимец</button>
    </div>
    <div class="alert d-none" data-page-status role="status"></div>
    <div data-pet-form-container class="mb-4"></div>
    <div data-pets-list></div>`
  : page === 'Health Record'
    ? `
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div><p class="pawly-eyebrow mb-2"><i class="bi bi-heart-pulse me-1" aria-hidden="true"></i>Здравето на любимеца е важно</p><h1 class="pawly-title display-5 mb-2">Здравни записи</h1><p class="pawly-subtitle mb-0">Подредете ваксинации, прегледи и лечения на едно място.</p></div>
      <button class="btn btn-primary" type="button" data-add-health-record><i class="bi bi-plus-lg me-2" aria-hidden="true"></i>Добави запис</button>
    </div>
    <div class="alert d-none" data-page-status role="status"></div>
    <div data-health-record-form-container></div>
    <div data-health-records-list></div>`
  : page === 'Pet Details'
    ? `<div data-pet-details></div>`
    : `
    <div class="mb-4"><p class="pawly-eyebrow mb-2"><i class="bi bi-sparkle me-1" aria-hidden="true"></i>Грижата за любимеца е лесна</p><h1 class="pawly-title display-5 mb-2">${pageLabel}</h1><p class="pawly-subtitle mb-0">Спокойно и грижовно място за щастлив и здрав любимец.</p></div>
    <section class="card pawly-card pawly-placeholder" aria-labelledby="placeholder-title"><div><div class="pawly-placeholder-icon mb-3"><i class="bi bi-paw-fill" aria-hidden="true"></i></div><h2 id="placeholder-title" class="h4 pawly-title mb-2">Твоето пространство в Pawly е готово</h2><p class="text-muted mb-0">Тази страница е готова за бъдещо развитие.</p></div></section>`

document.querySelector('#app').innerHTML = `
  <nav class="navbar navbar-expand-md pawly-navbar sticky-top" aria-label="Основна навигация">
    <div class="container">
      <a class="navbar-brand pawly-brand" href="/index.html">
        ${pawlyLogo}
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#pawlyNavigation"
        aria-controls="pawlyNavigation" aria-expanded="false" aria-label="Превключване на навигацията">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="pawlyNavigation">
        <div class="navbar-nav ms-auto gap-md-1" data-session-navigation></div>
      </div>
    </div>
  </nav>
  <main class="${page === 'Home' ? 'pawly-home' : 'container pawly-page'}">
    <div class="row justify-content-center">
      <div class="${page === 'Home' ? 'col-12' : 'col-12 col-lg-10'}">
        ${pageContent}
      </div>
    </div>
  </main>
`

if (page === 'Home') {
  const momentsCta = document.querySelector('[data-moments-cta]')
  const momentsModal = document.createElement('div')
  momentsModal.innerHTML = `
    <div class="modal fade" id="momentsAuthModal" tabindex="-1" aria-labelledby="momentsAuthModalTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content pawly-card">
          <div class="modal-header border-0">
            <h2 class="modal-title h4 pawly-title" id="momentsAuthModalTitle">Създай своя Pawly профил</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Затвори"></button>
          </div>
          <div class="modal-body pt-0">
            <p class="text-muted mb-4">Създай своя Pawly профил, за да превърнеш любимите си снимки в красиви спомени.</p>
            <div class="d-flex flex-column gap-2">
              <a class="btn btn-primary" href="/register.html">Създай профил</a>
              <a class="btn btn-outline-secondary" href="/login.html">Влез в профила си</a>
            </div>
          </div>
        </div>
      </div>
    </div>`
  document.body.append(momentsModal.firstElementChild)
  const modal = Modal.getOrCreateInstance(document.querySelector('#momentsAuthModal'))
  momentsCta?.addEventListener('click', async (event) => {
    event.preventDefault()
    try {
      const { data, error } = await getSupabaseClient().auth.getSession()
      if (error) throw error
      if (data.session) {
        window.location.assign('/moments.html')
      } else {
        modal.show()
      }
    } catch (error) {
      modal.show()
    }
  })
}

async function setupNavigation() {
  try {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    let admin = false
    if (data.session?.user) {
      admin = await isCurrentUserAdmin(data.session.user.id)
    }
    renderNavigation(data.session, admin)
    supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionIsAdmin = session?.user ? await isCurrentUserAdmin(session.user.id) : false
      renderNavigation(session, sessionIsAdmin)
    })
  } catch (error) {
    renderNavigation(null)
  }
}

function renderNavigation(session, admin = false) {
  const navigation = document.querySelector('[data-session-navigation]')
  if (!navigation) return

  navigation.innerHTML = session
    ? `
      <a class="nav-link pawly-nav-link px-3" href="/dashboard.html">Табло</a>
      <a class="nav-link pawly-nav-link px-3" href="/pets.html">Моите любимци</a>
      <a class="nav-link pawly-nav-link px-3" href="/health-record.html">Здравни записи</a>
      <a class="nav-link pawly-nav-link px-3" href="/moments.html">Pawly Moments</a>
      ${admin ? '<a class="nav-link pawly-nav-link px-3" href="/admin.html">Администрация</a>' : ''}
      <a class="nav-link pawly-nav-link px-3" href="/profile.html">Профил</a>`
    : `
      <a class="nav-link pawly-nav-link px-3" href="/index.html">Начало</a>
      <a class="nav-link pawly-nav-link px-3" href="/index.html#features">За Pawly</a>
      <a class="nav-link pawly-nav-link px-3" href="/demo.html">Демо</a>
      <a class="nav-link pawly-nav-link px-3" href="/index.html#tips-title">Съвети</a>
      <a class="nav-link pawly-nav-link px-3" href="/login.html">Вход</a>`
}

setupNavigation()

  if (page === 'Home') {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          revealObserver.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })
    document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element))
  }

  if (page === 'Pets') renderPetsPage()
  if (page === 'Pet Details') renderPetDetailsPage()
  if (page === 'Health Record') renderHealthRecordsPage()
  if (page === 'Dashboard') renderDashboardPage()
  if (page === 'Profile') renderProfilePage()
  if (page === 'Admin') renderAdminPage()
  if (page === 'Home') renderPublicArticles()
  if (page === 'Article') renderArticlePage()
  if (page === 'Moments') renderMomentsPage()
  if (page === 'Demo') renderDemoPage()
}
