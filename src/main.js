import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './style.css'

const page = document.body.dataset.page || 'Home'
const pageLabels = {
  Home: 'Начало',
  Login: 'Вход',
  Register: 'Регистрация',
  Dashboard: 'Табло',
  Pets: 'Домашни любимци',
  'Pet Details': 'Подробности за любимец',
  'Health Record': 'Здравен запис',
  Profile: 'Профил',
  Admin: 'Администрация',
}
const pageLabel = pageLabels[page] || pageLabels.Home

document.querySelector('#app').innerHTML = `
  <nav class="navbar navbar-expand-md pawly-navbar sticky-top" aria-label="Основна навигация">
    <div class="container">
      <a class="navbar-brand pawly-brand" href="/index.html">
        <i class="bi bi-heart-fill me-2" aria-hidden="true"></i>Pawly
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#pawlyNavigation"
        aria-controls="pawlyNavigation" aria-expanded="false" aria-label="Превключване на навигацията">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="pawlyNavigation">
        <div class="navbar-nav ms-auto gap-md-1">
          <a class="nav-link pawly-nav-link px-3" href="/dashboard.html">Табло</a>
          <a class="nav-link pawly-nav-link px-3" href="/pets.html">Моите любимци</a>
          <a class="nav-link pawly-nav-link px-3" href="/health-record.html">Здравни записи</a>
          <a class="nav-link pawly-nav-link px-3" href="/profile.html">Профил</a>
        </div>
      </div>
    </div>
  </nav>
  <main class="container pawly-page">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-10">
        <div class="mb-4">
          <p class="pawly-eyebrow mb-2"><i class="bi bi-sparkle me-1" aria-hidden="true"></i>Грижата за любимеца е лесна</p>
          <h1 class="pawly-title display-5 mb-2">${pageLabel}</h1>
          <p class="pawly-subtitle mb-0">Спокойно и грижовно място за щастлив и здрав любимец.</p>
        </div>
        <section class="card pawly-card pawly-placeholder" aria-labelledby="placeholder-title">
          <div>
            <div class="pawly-placeholder-icon mb-3">
              <i class="bi bi-paw-fill" aria-hidden="true"></i>
            </div>
            <h2 id="placeholder-title" class="h4 pawly-title mb-2">Вашето пространство в Pawly е готово</h2>
            <p class="text-muted mb-0">Тази страница е готова за бъдещо развитие.</p>
          </div>
        </section>
      </div>
    </div>
  </main>
`
