import { getSupabaseClient } from '../services/supabase.js'

const authPageContent = {
  Login: {
    eyebrow: 'Добре дошъл отново',
    title: 'Влез в Pawly',
    subtitle: 'Продължи да се грижиш за любимеца си с лекота.',
    submitLabel: 'Вход',
    alternateText: 'Нямаш профил?',
    alternateLink: 'Регистрация',
    alternateHref: '/register.html',
  },
  Register: {
    eyebrow: 'Твоето място за грижа',
    title: 'Създай Pawly профил',
    subtitle: 'Организирай грижите за любимеца си на едно място.',
    submitLabel: 'Регистрация',
    alternateText: 'Вече имаш профил?',
    alternateLink: 'Вход',
    alternateHref: '/login.html',
  },
}

function renderLoginForm() {
  return `
    <div class="mb-3">
      <label class="form-label" for="email">Имейл</label>
      <input class="form-control" id="email" name="email" type="email" autocomplete="email"
        placeholder="имейл@пример.bg" required />
      <div class="invalid-feedback">Моля, въведи валиден имейл адрес.</div>
    </div>
    <div class="mb-3">
      <label class="form-label" for="password">Парола</label>
      <input class="form-control" id="password" name="password" type="password"
        autocomplete="current-password" minlength="8" data-password-field required />
      <div class="invalid-feedback">Паролата трябва да съдържа поне 8 символа.</div>
    </div>
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
      <div class="form-check">
        <input class="form-check-input" id="remember" name="remember" type="checkbox" />
        <label class="form-check-label" for="remember">Запомни ме</label>
      </div>
      <a class="pawly-text-link" href="#" data-placeholder-link="true">Забравена парола?</a>
    </div>
  `
}

function renderRegisterForm() {
  return `
    <div class="row g-3 mb-3">
      <div class="col-sm-6">
        <label class="form-label" for="first-name">Име</label>
        <input class="form-control" id="first-name" name="firstName" type="text"
          autocomplete="given-name" required />
        <div class="invalid-feedback">Моля, въведи име.</div>
      </div>
      <div class="col-sm-6">
        <label class="form-label" for="last-name">Фамилия</label>
        <input class="form-control" id="last-name" name="lastName" type="text"
          autocomplete="family-name" required />
        <div class="invalid-feedback">Моля, въведи фамилия.</div>
      </div>
    </div>
    <div class="mb-3">
      <label class="form-label" for="email">Имейл</label>
      <input class="form-control" id="email" name="email" type="email" autocomplete="email"
        placeholder="имейл@пример.bg" required />
      <div class="invalid-feedback">Моля, въведи валиден имейл адрес.</div>
    </div>
    <div class="mb-3">
      <label class="form-label" for="password">Парола</label>
      <input class="form-control" id="password" name="password" type="password"
        autocomplete="new-password" minlength="8" data-password-field required />
      <div class="invalid-feedback">Паролата трябва да съдържа поне 8 символа.</div>
    </div>
    <div class="mb-3">
      <label class="form-label" for="confirm-password">Потвърди паролата</label>
      <input class="form-control" id="confirm-password" name="confirmPassword" type="password"
        autocomplete="new-password" minlength="8" data-password-field required />
      <div class="invalid-feedback">Паролите трябва да съвпадат.</div>
    </div>
    <div class="form-check mb-4">
      <input class="form-check-input" id="terms" name="terms" type="checkbox" required />
      <label class="form-check-label" for="terms">
        Приемам <a class="pawly-text-link" href="#" data-placeholder-link="true">Условията за ползване</a>
        и <a class="pawly-text-link" href="#" data-placeholder-link="true">Политиката за поверителност</a>.
      </label>
      <div class="invalid-feedback">Трябва да приемете условията и политиката за поверителност.</div>
    </div>
  `
}

function setupPasswordToggle(form) {
  const passwordFields = form.querySelectorAll('[data-password-field]')
  const toggle = form.querySelector('[data-password-toggle]')

  toggle.addEventListener('change', () => {
    passwordFields.forEach((field) => {
      field.type = toggle.checked ? 'text' : 'password'
    })
  })
}

function setFormStatus(status, type, message) {
  status.classList.remove('d-none', 'alert-success', 'alert-danger')
  status.classList.add(type === 'success' ? 'alert-success' : 'alert-danger')
  status.textContent = message
}

function setEmailConfirmationStatus(status) {
  status.classList.remove('d-none', 'alert-danger')
  status.classList.add('alert-success')
  status.innerHTML = 'Профилът ти е създаден успешно! Провери имейла си, за да потвърдиш регистрацията. <a class="alert-link" href="/login.html">Влез в профила си</a>.'
}

function getAuthErrorMessage(error, page) {
  if (error.message === 'Липсва конфигурация за Supabase.') {
    return 'Автентикацията не е конфигурирана. Моля, свържи се с администратор.'
  }

  if (page === 'Login' && error.message === 'Invalid login credentials') {
    return 'Имейлът или паролата са неправилни.'
  }

  if (page === 'Register' && error.message === 'User already registered') {
    return 'Този имейл вече е регистриран.'
  }

  return 'Възникна грешка. Моля, опитай отново.'
}

async function submitAuthForm(form, page) {
  const formData = new FormData(form)
  const email = formData.get('email')
  const password = formData.get('password')
  const submitButton = form.querySelector('button[type="submit"]')
  const status = form.querySelector('[data-form-status]')

  if (submitButton.disabled) {
    return
  }

  submitButton.disabled = true
  submitButton.setAttribute('aria-busy', 'true')

  try {
    const supabase = getSupabaseClient()

    if (page === 'Login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        throw error
      }

      window.location.assign('/dashboard.html')
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: formData.get('firstName'),
          last_name: formData.get('lastName'),
        },
      },
    })

    if (error) {
      throw error
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError

    if (data.session && sessionData.session) {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!userData.user) throw new Error('Липсва активен потребител след регистрация.')
      window.location.assign('/dashboard.html')
      return
    }

    setEmailConfirmationStatus(status)
    form.reset()
    form.classList.remove('was-validated')
  } catch (error) {
    setFormStatus(status, 'error', getAuthErrorMessage(error, page))
  } finally {
    submitButton.disabled = false
    submitButton.removeAttribute('aria-busy')
  }
}

function setupValidation(form, page) {
  const password = form.querySelector('#password')
  const confirmPassword = form.querySelector('#confirm-password')
  const status = form.querySelector('[data-form-status]')

  const validatePasswordMatch = () => {
    if (confirmPassword) {
      const message = confirmPassword.value
        ? 'Паролите трябва да съвпадат.'
        : 'Моля, потвърдете паролата.'
      confirmPassword.setCustomValidity(
        confirmPassword.value && confirmPassword.value === password.value ? '' : message,
      )
    }
  }

  password.addEventListener('input', validatePasswordMatch)
  confirmPassword?.addEventListener('input', validatePasswordMatch)

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    validatePasswordMatch()
    form.classList.add('was-validated')
    status.classList.remove('d-none', 'alert-success', 'alert-danger')

    if (!form.checkValidity()) {
      setFormStatus(status, 'error', 'Моля, провери маркираните полета и опитай отново.')
      return
    }

    await submitAuthForm(form, page)
  })
}

export function renderAuthPage(page) {
  const content = authPageContent[page]
  const formMarkup = page === 'Login' ? renderLoginForm() : renderRegisterForm()

  document.querySelector('#app').innerHTML = `
    <main class="pawly-auth-page">
      <div class="container py-4 py-sm-5">
        <div class="pawly-auth-brand text-center mb-4">
          <a class="pawly-brand" href="/index.html">
            <span class="pawly-logo-paw" aria-hidden="true">
              <svg viewBox="4 2 24 22" focusable="false"><path d="M10.2 14.2c-2.2 1.1-4.9-.2-5.3-2.6-.4-2.2 1.1-4.2 3.2-4.5 2.3-.3 4.1 1.7 3.8 4-.2 1.4-.8 2.5-1.7 3.1Zm11.6 0c2.2 1.1 4.9-.2 5.3-2.6 2.2-2.2-3.2-4.5-3.2-4.5-2.3-.3-4.1 1.7-3.8 4 .2 1.4.8 2.5 1.7 3.1ZM15 10.2c-2 .2-3.7-1.5-3.7-3.6S12.7 2.8 14.7 3c1.9.2 3.1 2.1 2.8 4-.3 1.7-1.1 2.9-2.5 3.2Zm2 0c2 .2 3.7-1.5 3.7-3.6S19.3 2.8 17.3 3c-1.9.2-3.1 2.1-2.8 4-.3 1.7-1.1 2.9-2.5 3.2ZM16 12c-3.7 0-7.3 3.5-7.3 7.3 0 2.5 1.8 4.1 4.2 3.7 1.2-.2 2.1-.8 3.1-.8s1.9.6 3.1.8c2.4.4 4.2-1.2 4.2-3.7C23.3 15.5 19.7 12 16 12Z"/></svg>
            </span>
            <span class="pawly-logo-word">Pawly</span>
          </a>
        </div>
        <div class="row justify-content-center">
          <div class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <section class="card pawly-card pawly-auth-card" aria-labelledby="auth-title">
              <div class="card-body p-4 p-sm-5">
                <div class="text-center mb-4">
                  <p class="pawly-eyebrow mb-2"><i class="bi bi-paw-fill me-1" aria-hidden="true"></i>${content.eyebrow}</p>
                  <h1 id="auth-title" class="pawly-title h2 mb-2">${content.title}</h1>
                  <p class="pawly-subtitle mb-0">${content.subtitle}</p>
                </div>
                <form class="needs-validation" novalidate>
                  ${formMarkup}
                  <div class="form-check mb-4">
                    <input class="form-check-input" id="show-password" type="checkbox"
                      data-password-toggle aria-controls="${page === 'Register' ? 'password confirm-password' : 'password'}" />
                    <label class="form-check-label" for="show-password">Покажи паролата</label>
                  </div>
                  <button class="btn btn-primary w-100" type="submit">${content.submitLabel}</button>
                  <div class="alert mt-3 mb-0 d-none" role="status" aria-live="polite" data-form-status></div>
                </form>
                <p class="text-center text-muted mb-0 mt-4">
                  ${content.alternateText}
                  <a class="pawly-text-link fw-bold" href="${content.alternateHref}">${content.alternateLink}</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  `

  const form = document.querySelector('form')
  setupPasswordToggle(form)
  setupValidation(form, page)

  document.querySelectorAll('[data-placeholder-link="true"]').forEach((link) => {
    link.addEventListener('click', (event) => event.preventDefault())
  })
}
